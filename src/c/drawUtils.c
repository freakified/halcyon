#include "drawUtils.h"
#include "alarmUtils.h"

#ifdef HAS_ALARMS

void draw_alarm_marker(GContext *ctx, GPoint center, GColor fillColor,
                       GColor strokeColor) {
  // a diamond as tall as the sun, outlined as thickly as the rest of the ring
  // (a more detailed icon would get lost under an outline that thick)
  int radius = SUN_DIAMETER;
  GPoint points[] = {GPoint(0, -radius), GPoint(radius, 0), GPoint(0, radius),
                     GPoint(-radius, 0)};
  GPath diamond = {
      .num_points = ARRAY_LENGTH(points), .points = points, .offset = center};

  graphics_context_set_fill_color(ctx, fillColor);
  gpath_draw_filled(ctx, &diamond);

  graphics_context_set_stroke_color(ctx, strokeColor);
  graphics_context_set_stroke_width(ctx, RING_STROKE_WIDTH);
  gpath_draw_outline(ctx, &diamond);
}

#endif
