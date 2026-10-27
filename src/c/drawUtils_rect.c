#ifdef PBL_RECT

#include "drawUtils.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"

static ColorTheme currentTheme;

// Time is laid out around the rectangle like a ruler: each side covers 6
// hours, and the pips, sun and ring all share the same coordinate along a
// side, so the sun lines up perpendicularly with the pips. Sides are numbered
// clockwise starting from the top-left corner.
#define MINUTES_PER_SIDE 360

#define PIP_WIDTH 3
#define PIP_LENGTH 4
#define MAIN_PIP_LENGTH 5
// corner pips are 45 degree bars with a flat end, CORNER_PIP_LENGTH pixels on
// each axis, and CORNER_PIP_SPREAD pixels to either side of the diagonal
#define CORNER_PIP_LENGTH 5
#define CORNER_PIP_SPREAD 2

// Coordinate along a side of the pip rect (x for top/bottom, y for
// left/right) for the given number of minutes into that side
static int get_along_coord(int side, int sideMinute, GRect pipRect) {
  int w = pipRect.size.w;
  int h = pipRect.size.h;
  switch (side) {
  case 0:
    return pipRect.origin.x + sideMinute * w / MINUTES_PER_SIDE;
  case 1:
    return pipRect.origin.y + sideMinute * h / MINUTES_PER_SIDE;
  case 2:
    return pipRect.origin.x + w - sideMinute * w / MINUTES_PER_SIDE;
  default:
    return pipRect.origin.y + h - sideMinute * h / MINUTES_PER_SIDE;
  }
}

// Point on a track rect for the given (shifted) minute of the day. Exactly on
// a corner minute this is the track's corner; otherwise it's directly across
// from the matching spot on the pip rect, which never reaches the corners.
static GPoint get_track_position(int dayMinute, GRect track, GRect pipRect) {
  int side = dayMinute / MINUTES_PER_SIDE;
  int sideMinute = dayMinute % MINUTES_PER_SIDE;
  int x0 = track.origin.x;
  int y0 = track.origin.y;
  int x1 = x0 + track.size.w;
  int y1 = y0 + track.size.h;

  if (sideMinute == 0) {
    switch (side) {
    case 0:
      return GPoint(x0, y0);
    case 1:
      return GPoint(x1, y0);
    case 2:
      return GPoint(x1, y1);
    default:
      return GPoint(x0, y1);
    }
  }

  int along = get_along_coord(side, sideMinute, pipRect);
  switch (side) {
  case 0:
    return GPoint(along, y0);
  case 1:
    return GPoint(x1, along);
  case 2:
    return GPoint(along, y1);
  default:
    return GPoint(x0, along);
  }
}

// Fills the ring band between two (shifted) minutes of the day, where
// startMinute < endMinute. Spans that pass a corner fill it completely.
static void fill_ring_span(GContext *ctx, int startMinute, int endMinute,
                           GRect bounds, GRect pipRect, int thickness) {
  int w = bounds.size.w;
  int h = bounds.size.h;

  for (int side = 0; side < 4; side++) {
    int sideStart = side * MINUTES_PER_SIDE;
    int a = (startMinute > sideStart ? startMinute : sideStart) - sideStart;
    int b = (endMinute < sideStart + MINUTES_PER_SIDE
                 ? endMinute
                 : sideStart + MINUTES_PER_SIDE) -
            sideStart;
    if (a >= b)
      continue;

    // edges of the screen at the start/end of each side
    int startEdge = (side == 0 || side == 1) ? 0 : (side == 2 ? w : h);
    int endEdge = (side == 0) ? w : (side == 1 ? h : 0);

    int from = (a == 0) ? startEdge : get_along_coord(side, a, pipRect);
    int to =
        (b == MINUTES_PER_SIDE) ? endEdge : get_along_coord(side, b, pipRect);
    int lo = from < to ? from : to;
    int len = (from < to ? to : from) - lo;

    switch (side) {
    case 0:
      graphics_fill_rect(ctx, GRect(lo, 0, len, thickness), 0, GCornerNone);
      break;
    case 1:
      graphics_fill_rect(ctx, GRect(w - thickness, lo, thickness, len), 0,
                         GCornerNone);
      break;
    case 2:
      graphics_fill_rect(ctx, GRect(lo, h - thickness, len, thickness), 0,
                         GCornerNone);
      break;
    default:
      graphics_fill_rect(ctx, GRect(0, lo, thickness, len), 0, GCornerNone);
      break;
    }
  }
}

// Draws a small diagonal pip pointing out of the given corner of bounds
static void draw_corner_pip(GContext *ctx, int side, GRect bounds) {
  int maxX = bounds.size.w - 1;
  int maxY = bounds.size.h - 1;
  int cx = (side == 0 || side == 3) ? 0 : maxX;
  int cy = (side == 0 || side == 1) ? 0 : maxY;
  int dx = (cx == 0) ? 1 : -1;
  int dy = (cy == 0) ? 1 : -1;

  // a 45 degree bar drawn row by row (gpaths this small rasterize unevenly),
  // as seen from the top-left corner:
  //   ###..
  //   ####.
  //   #####
  //   .###.
  //   ..#..
  // The end is cut perpendicular to the bar, where x + y reaches capSum.
  int capSum = 2 * (CORNER_PIP_LENGTH - 1) - CORNER_PIP_SPREAD;
  for (int y = 0; y < CORNER_PIP_LENGTH; y++) {
    int x0 = (y > CORNER_PIP_SPREAD) ? y - CORNER_PIP_SPREAD : 0;
    int x1 = (y + CORNER_PIP_SPREAD < capSum - y) ? y + CORNER_PIP_SPREAD
                                                  : capSum - y;
    int rowX = (dx > 0) ? cx + x0 : cx - x1;
    int rowY = cy + dy * y;
    graphics_fill_rect(ctx, GRect(rowX, rowY, x1 - x0 + 1, 1), 0, GCornerNone);
  }
}

GRect snap_to_edges(GRect rect, GRect bounds, int thickness) {
  // vertical snapping
  if (rect.origin.y + rect.size.h > bounds.size.h - thickness) {
    rect.size.h = bounds.size.h - rect.origin.y;
  }
  if (rect.origin.y < thickness) {
    rect.size.h += rect.origin.y;
    rect.origin.y = 0;
  }

  // horizontal snapping
  if (rect.origin.x + rect.size.w > bounds.size.w - thickness) {
    rect.size.w = bounds.size.w - rect.origin.x;
  }
  if (rect.origin.x < thickness) {
    rect.size.w += rect.origin.x;
    rect.origin.x = 0;
  }

  return rect;
}

void draw_center_layer(Layer *layer, GContext *ctx) {
  currentTheme = getCurrentColorTheme();
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, currentTheme.bgColor);

  graphics_fill_rect(ctx, bounds, 0, GCornerNone);

  // the pip rect spans from the first to the last pixel of the layer
  GRect pipRect = GRect(0, 0, bounds.size.w - 1, bounds.size.h - 1);
  int w = bounds.size.w;
  int h = bounds.size.h;

  int numPips = 24;
  int pipsPerSide = numPips / 4;

  for (int i = 0; i < numPips; i++) {
    bool is_main_pip = ((i - (numPips / 8)) % (numPips / 4) == 0);

    // Check pip visibility setting
    bool should_draw_pip = false;
    switch (globalSettings.pipVisibility) {
    case PIP_SHOW_ALL:
      should_draw_pip = true;
      break;
    case PIP_SHOW_MAJOR:
      should_draw_pip = is_main_pip;
      break;
    case PIP_HIDDEN:
      should_draw_pip = false;
      break;
    }

    if (!should_draw_pip)
      continue;

    int length = is_main_pip ? MAIN_PIP_LENGTH : PIP_LENGTH;

    // pips are filled rather than stroked so that grays work on b&w watches
    graphics_context_set_fill_color(ctx, is_main_pip
                                             ? currentTheme.pipColorPrimary
                                             : currentTheme.pipColorSecondary);

    int side = i / pipsPerSide;
    int sideMinute = (i % pipsPerSide) * MINUTES_PER_SIDE / pipsPerSide;

    if (sideMinute == 0) {
      draw_corner_pip(ctx, side, bounds);
      continue;
    }

    int along = get_along_coord(side, sideMinute, pipRect) - PIP_WIDTH / 2;
    GRect pip;
    switch (side) {
    case 0:
      pip = GRect(along, 0, PIP_WIDTH, length);
      break;
    case 1:
      pip = GRect(w - length, along, length, PIP_WIDTH);
      break;
    case 2:
      pip = GRect(along, h - length, PIP_WIDTH, length);
      break;
    default:
      pip = GRect(0, along, length, PIP_WIDTH);
      break;
    }
    graphics_fill_rect(ctx, pip, 0, GCornerNone);
  }
}

void draw_ring_layer(Layer *layer, GContext *ctx) {
  currentTheme = getCurrentColorTheme();
  GRect bounds = layer_get_bounds(layer);
  int thickness = RING_THICKNESS;
  int strokeWidth = RING_STROKE_WIDTH;
  GRect innerBounds =
      GRect(bounds.origin.x + thickness / 2, bounds.origin.y + thickness / 2,
            bounds.size.w - thickness, bounds.size.h - thickness);

  GRect sunBounds =
      GRect(bounds.origin.x + SUN_INSET, bounds.origin.y + SUN_INSET,
            bounds.size.w - SUN_INSET * 2, bounds.size.h - SUN_INSET * 2);

  // the pip rect, in this layer's coordinates (see draw_center_layer)
  GRect pipRect =
      GRect(bounds.origin.x + EDGE_THICKNESS, bounds.origin.y + EDGE_THICKNESS,
            bounds.size.w - EDGE_THICKNESS * 2 - 1,
            bounds.size.h - EDGE_THICKNESS * 2 - 1);

  int width = bounds.size.w;
  int height = bounds.size.h;

  // Draw outer rectangular ring
  graphics_context_set_fill_color(ctx, currentTheme.ringNightColor);

  // Top bar
  graphics_fill_rect(ctx, GRect(0, 0, width, thickness), 0, GCornerNone);
  // Bottom bar
  graphics_fill_rect(ctx, GRect(0, height - thickness, width, thickness), 0,
                     GCornerNone);
  // Left bar
  graphics_fill_rect(ctx, GRect(0, 0, thickness, height), 0, GCornerNone);
  // Right bar
  graphics_fill_rect(ctx, GRect(width - thickness, 0, thickness, height), 0,
                     GCornerNone);

  // Get time and sun position
  struct tm *timeInfo = getCurrentTime();

  // Shift time by 15 hours so that it starts at the bottom
  int shiftedMinute = ((timeInfo->tm_hour + 15) % 24) * 60 + timeInfo->tm_min;

  GPoint sunPos = get_track_position(shiftedMinute, sunBounds, pipRect);

  // Apply the same 15-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute =
      (currentSolarInfo.sunriseMinute + 15 * 60) % (24 * 60);
  int shiftedSunsetMinute =
      (currentSolarInfo.sunsetMinute + 15 * 60) % (24 * 60);

  GPoint dayStart =
      get_track_position(shiftedSunriseMinute, innerBounds, pipRect);
  GPoint dayEnd = get_track_position(shiftedSunsetMinute, innerBounds, pipRect);

  // Fill the day section, splitting it if it wraps past the start of the day
  graphics_context_set_fill_color(ctx, currentTheme.ringDayColor);
  if (shiftedSunriseMinute < shiftedSunsetMinute) {
    fill_ring_span(ctx, shiftedSunriseMinute, shiftedSunsetMinute, bounds,
                   pipRect, thickness);
  } else if (shiftedSunriseMinute > shiftedSunsetMinute) {
    fill_ring_span(ctx, shiftedSunriseMinute, 24 * 60, bounds, pipRect,
                   thickness);
    fill_ring_span(ctx, 0, shiftedSunsetMinute, bounds, pipRect, thickness);
  }

  // Calculate positioning of twilight interface blocks
  int boxSize = thickness;
  graphics_context_set_stroke_color(ctx, currentTheme.ringStrokeColor);
  graphics_context_set_stroke_width(ctx, strokeWidth);

  GRect twilightStartRect = GRect(dayStart.x - boxSize / 2,
                                  dayStart.y - boxSize / 2, boxSize, boxSize);
  GRect twilightEndRect =
      GRect(dayEnd.x - boxSize / 2, dayEnd.y - boxSize / 2, boxSize, boxSize);

  // Correct boundaries of the twilight blocks, if necessary
  // (this ensures that the ring doesn't "break" if a block is on an edge)
  twilightStartRect = snap_to_edges(twilightStartRect, bounds, thickness);
  twilightEndRect = snap_to_edges(twilightEndRect, bounds, thickness);

  // draw sunrise block
  graphics_context_set_fill_color(ctx, currentTheme.ringSunriseColor);
  graphics_fill_rect(ctx, twilightStartRect, 0, GCornerNone);
  graphics_draw_rect(
      ctx, GRect(twilightStartRect.origin.x - 2, twilightStartRect.origin.y - 2,
                 twilightStartRect.size.w + 4, twilightStartRect.size.h + 4));

  // draw sunset block
  graphics_context_set_fill_color(ctx, currentTheme.ringSunsetColor);
  graphics_fill_rect(ctx, twilightEndRect, 0, GCornerNone);
  graphics_draw_rect(
      ctx, GRect(twilightEndRect.origin.x - 2, twilightEndRect.origin.y - 2,
                 twilightEndRect.size.w + 4, twilightEndRect.size.h + 4));

  // cue the sun!
  graphics_context_set_fill_color(ctx, currentTheme.sunFillColor);
  graphics_context_set_stroke_color(ctx, currentTheme.sunStrokeColor);
  graphics_fill_circle(ctx, sunPos, SUN_DIAMETER);
  graphics_draw_circle(ctx, sunPos, SUN_DIAMETER);
}
#endif