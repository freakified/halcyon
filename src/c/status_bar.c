#include "status_bar.h"
#include "drawUtils.h"
#include "settings.h"
#include "solarUtils.h"
#include <pebble.h>

/*
 * The status bar is a single tiny prerendered icon that sits in the sun
 * ring at the top of the face. The top of the ring is noon, which is usually
 * in the day segment -- but not always, since a far-away manual location can
 * put night (or a twilight block) there, so the icon color follows whatever
 * the ring draws at noon. Around noon the sun passes underneath the icon;
 * the icon draws on top.
 *
 * Disconnection always wins, then quiet time, then (only if the "always
 * show connection" setting is on) a "connected" icon; otherwise nothing is
 * drawn.
 */

// the icon centers vertically in the ring band
#define STATUS_BAR_HEIGHT RING_THICKNESS

static Layer *statusBarLayer;

static GBitmap *dndIcon;
static GBitmap *connectedIcon;
static GBitmap *disconnectedIcon;

// the icon art is a single opaque color on transparency; repaint the
// opaque palette entries so the icons contrast with the ring behind them
static void recolor_icon(GBitmap *icon, GColor color) {
  GColor *palette = gbitmap_get_palette(icon);

  if (palette == NULL) {
    return;
  }

  int paletteSize;

  switch (gbitmap_get_format(icon)) {
  case GBitmapFormat1BitPalette:
    paletteSize = 2;
    break;
  case GBitmapFormat2BitPalette:
    paletteSize = 4;
    break;
  case GBitmapFormat4BitPalette:
    paletteSize = 16;
    break;
  default:
    return;
  }

  for (int i = 0; i < paletteSize; i++) {
    if (palette[i].a != 0) {
      palette[i] = color;
    }
  }
}

// the palettes are only rewritten when the color changes (e.g. when the
// night theme kicks in)
static GColor iconColor;

static void update_icon_color(GColor color) {
  if (gcolor_equal(iconColor, color)) {
    return;
  }

  iconColor = color;
  recolor_icon(dndIcon, iconColor);
  recolor_icon(connectedIcon, iconColor);
  recolor_icon(disconnectedIcon, iconColor);
}

// black or white, whichever reads better on the given background. Channels
// are 2 bits (0-3), weighted by perceived brightness; the threshold sits at
// mid-gray.
static GColor contrasting_color(GColor bg) {
  int brightness = bg.r * 299 + bg.g * 587 + bg.b * 114;
  return (brightness > 1500) ? GColorBlack : GColorWhite;
}

#define NOON_MINUTE (12 * 60)

// minutes between two times of day, the short way around the clock
static int minutes_apart(int a, int b) {
  int diff = (a > b) ? a - b : b - a;
  return (diff > 12 * 60) ? 24 * 60 - diff : diff;
}

// the ring color at the top of the face (noon), mirroring draw_ring_layer
static GColor ring_color_at_noon(ColorTheme *theme, int ringWidth) {
  int sunrise = currentSolarInfo.sunriseMinute;
  int sunset = currentSolarInfo.sunsetMinute;

#ifdef PBL_ROUND
  // the twilight arcs span 30 minutes
  int twilightHalfWidth = 15;
#else
  // the twilight blocks are a ring thickness wide, on a top edge that spans
  // six hours
  int twilightHalfWidth =
      (6 * 60 / 2) * RING_THICKNESS / (ringWidth - RING_THICKNESS);
#endif

  if (minutes_apart(NOON_MINUTE, sunrise) <= twilightHalfWidth) {
    return theme->ringSunriseColor;
  }

  if (minutes_apart(NOON_MINUTE, sunset) <= twilightHalfWidth) {
    return theme->ringSunsetColor;
  }

  // the day can wrap past midnight when the location is far away
  bool noonIsDay = (sunrise <= sunset)
                       ? (NOON_MINUTE >= sunrise && NOON_MINUTE < sunset)
                       : (NOON_MINUTE >= sunrise || NOON_MINUTE < sunset);

  return noonIsDay ? theme->ringDayColor : theme->ringNightColor;
}

static void status_bar_update(Layer *layer, GContext *ctx) {
  if (!globalSettings.enableStatusBar) {
    return;
  }

  GBitmap *statusIcon = NULL;

  if (!bluetooth_connection_service_peek()) {
    statusIcon = disconnectedIcon;
  } else if (quiet_time_is_active()) {
    statusIcon = dndIcon;
  } else if (globalSettings.statusShowConnection) {
    statusIcon = connectedIcon;
  }

  if (statusIcon == NULL) {
    return;
  }

  GRect bounds = layer_get_bounds(layer);

  ColorTheme theme = getCurrentColorTheme();
  update_icon_color(
      contrasting_color(ring_color_at_noon(&theme, bounds.size.w)));

  GSize size = gbitmap_get_bounds(statusIcon).size;
  // nudged down a pixel on rect so it sits visually centered in the band
  GRect iconRect =
      GRect((bounds.size.w - size.w) / 2,
            (bounds.size.h - size.h) / 2 + PBL_IF_ROUND_ELSE(0, 1), size.w,
            size.h);

  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  graphics_draw_bitmap_in_rect(ctx, statusIcon, iconRect);
}

void StatusBar_init(Layer *parent) {
  GRect bounds = layer_get_bounds(parent);

  dndIcon = gbitmap_create_with_resource(RESOURCE_ID_STATUS_DND);
  connectedIcon = gbitmap_create_with_resource(RESOURCE_ID_STATUS_CONNECTED);
  disconnectedIcon =
      gbitmap_create_with_resource(RESOURCE_ID_STATUS_DISCONNECTED);
  iconColor = GColorClear; // fresh bitmaps; force the first recolor

  statusBarLayer =
      layer_create(GRect(0, 0, bounds.size.w, STATUS_BAR_HEIGHT));
  layer_set_update_proc(statusBarLayer, status_bar_update);
  layer_add_child(parent, statusBarLayer);
  layer_set_hidden(statusBarLayer, !globalSettings.enableStatusBar);
}

void StatusBar_deinit(void) {
  layer_destroy(statusBarLayer);

  gbitmap_destroy(dndIcon);
  gbitmap_destroy(connectedIcon);
  gbitmap_destroy(disconnectedIcon);
}

void StatusBar_redraw(void) {
  layer_set_hidden(statusBarLayer, !globalSettings.enableStatusBar);
  layer_mark_dirty(statusBarLayer);
}
