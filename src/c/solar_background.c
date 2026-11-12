#include "drawUtils.h"

#ifdef PBL_COLOR
// Reuse a single row, rather than allocating a screen-sized image or writing
// directly to the framebuffer. Native bitmap drawing keeps SDK clipping intact.
static GBitmap *s_scanline;
static int s_scanline_width;
// Keep this table off the drawing stack and reuse it for same-minute redraws.
static uint16_t s_weights[257];
static int s_weight_event = -1;
static int s_weight_progress = -1;
#endif

void solar_background_deinit(void) {
#ifdef PBL_COLOR
  if (s_scanline) gbitmap_destroy(s_scanline);
  s_scanline = NULL;
  s_scanline_width = 0;
  s_weight_event = s_weight_progress = -1;
#endif
}

void draw_solar_background(Layer *layer, GContext *ctx, const ColorTheme *theme) {
#ifdef PBL_COLOR
  if (!theme->solar.event ||
      gcolor_equal(globalSettings.bgColor, globalSettings.nightBgColor)) return;

  GRect bounds = layer_get_bounds(layer);
  int width = bounds.size.w, height = bounds.size.h;
  if (width <= 0 || height <= 0) return;
  if (!s_scanline || s_scanline_width != width) {
    solar_background_deinit();
    s_scanline = gbitmap_create_blank(GSize(width, 1), GBitmapFormat8Bit);
    if (!s_scanline) return; // The ordinary flat background is already painted.
    s_scanline_width = width;
  }
  const bool round = PBL_IF_ROUND_ELSE(true, false);
  if (s_weight_event != theme->solar.event || s_weight_progress != theme->solar.progress) {
    for (int i = 0; i <= 256; i++) {
      s_weights[i] = solar_theme_background_weight(theme->solar,
          solar_theme_bucket_radius(i, round));
    }
    s_weight_event = theme->solar.event;
    s_weight_progress = theme->solar.progress;
  }
  uint8_t *data = gbitmap_get_data(s_scanline);
  uint8_t from = globalSettings.nightBgColor.argb, to = globalSettings.bgColor.argb;
  graphics_context_set_compositing_mode(ctx, GCompOpAssign);
  for (int y = 0; y < height; y++) {
    int first = width, last = -1;
    for (int x = 0; x < width; x++) {
      int bucket = solar_theme_background_bucket(x, y, width, height, round);
      if (bucket < 0) continue;
      if (first == width) first = x;
      last = x;
      data[x] = solar_theme_dither(from, to, s_weights[bucket], x, y);
    }
    if (last < first) continue;
    // Both supported shapes have one contiguous visible span per row.
    gbitmap_set_bounds(s_scanline, GRect(first, 0, last - first + 1, 1));
    graphics_draw_bitmap_in_rect(ctx, s_scanline,
        GRect(bounds.origin.x + first, bounds.origin.y + y, last - first + 1, 1));
  }
  // Pips and text are painted afterward, without any dithering.
#endif
}
