#ifdef PBL_RECT

#include "drawUtils.h"
#include "settings.h"
#include "utils.h"
#include "solarUtils.h"

GPoint getPipPosition(int id, int numPips, GRect bounds) {
  int edgePips = numPips / 4;
  int x, y;

  if (id < edgePips) {
    // top edge
    x = bounds.origin.x + (id * bounds.size.w / edgePips);
    y = bounds.origin.y;
  } else if (id < 2 * edgePips) {
    // right edge
    x = bounds.origin.x + bounds.size.w;
    y = bounds.origin.y + ((id - edgePips) * bounds.size.h / edgePips);
  } else if (id < 3 * edgePips) {
    // bottom edge
    x = bounds.origin.x + bounds.size.w -
        ((id - 2 * edgePips) * bounds.size.w / edgePips);
    y = bounds.origin.y + bounds.size.h;
  } else {
    // left edge
    x = bounds.origin.x;
    y = bounds.origin.y + bounds.size.h -
        ((id - 3 * edgePips) * bounds.size.h / edgePips);
  }

  return GPoint(x, y);
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
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, globalSettings.bgColor);
  
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);

  int innerPadding = 0;

  bounds.origin.x += innerPadding;
  bounds.origin.y += innerPadding;
  bounds.size.w -= innerPadding * innerPadding + 1;
  bounds.size.h -= innerPadding * innerPadding + 1;

  int numPips = 24;
  int pip_length = 2;
  int long_pip_length = 3;

  for (int i = 0; i < numPips; i++) {
    bool is_main_pip = ((i - (numPips / 8)) % (numPips / 4) == 0);
    int length = is_main_pip ? long_pip_length : pip_length;

    graphics_context_set_stroke_color(ctx, is_main_pip ? globalSettings.pipColorPrimary
                                                       : globalSettings.pipColorSecondary);
    graphics_context_set_stroke_width(ctx, 3);

    GPoint start = getPipPosition(i, numPips, bounds);

    GRect contracted_bounds = bounds;
    contracted_bounds.origin.x += length;
    contracted_bounds.origin.y += length;
    contracted_bounds.size.w -= 2 * length;
    contracted_bounds.size.h -= 2 * length;

    GPoint end = getPipPosition(i, numPips, contracted_bounds);

    graphics_draw_line(ctx, start, end);
  }
}

void draw_ring_layer(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  int thickness = RING_THICKNESS;
  int strokeWidth = RING_STROKE_WIDTH;
  GRect innerBounds =
      GRect(bounds.origin.x + thickness / 2, bounds.origin.y + thickness / 2,
            bounds.size.w - thickness, bounds.size.h - thickness);
  int numPositions = 96;
  int width = bounds.size.w;
  int height = bounds.size.h;

  // Draw outer rectangular ring
  graphics_context_set_fill_color(ctx, globalSettings.ringNightColor);

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
  int hour = timeInfo->tm_hour;
  int minute = timeInfo->tm_min;

  // Shift time by 15 hours so that it starts at the bottom
  int shiftedHour = (hour + 15) % 24;
  float progress = ((shiftedHour % 24) + (minute / 60.0f)) / 24.0f;

  // Calculate total perimeter minus the corners
  int pos = (int)(progress * numPositions);

  GPoint sunPos = getPipPosition(pos, numPositions, innerBounds);

  // Apply the same 15-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute = (currentSolarInfo.sunriseMinute + 15 * 60) % (24 * 60);
  int shiftedSunsetMinute = (currentSolarInfo.sunsetMinute + 15 * 60) % (24 * 60);

  // Calculate sunrise and sunset positions on the ring using getPipPosition
  int dayStartPos = (int)(((shiftedSunriseMinute / 1440.0f) * numPositions) + 0.5);
  int dayEndPos = (int)(((shiftedSunsetMinute / 1440.0f) * numPositions) + 0.5);

  GPoint dayStart = getPipPosition(dayStartPos, numPositions, innerBounds);
  GPoint dayEnd = getPipPosition(dayEndPos, numPositions, innerBounds);

  // Fill the day section
  graphics_context_set_fill_color(ctx, globalSettings.ringDayColor);
  for (int i = dayStartPos; i != dayEndPos; i = (i + 1) % numPositions) {
    GPoint pipPos = getPipPosition(i, numPositions, innerBounds);
    graphics_fill_rect(ctx, GRect(pipPos.x - thickness / 2, pipPos.y - thickness / 2, thickness, thickness), 0, GCornerNone);
  }

  // Calculate positioning of twilight interface blocks
  int boxSize = thickness;
  graphics_context_set_stroke_color(ctx, globalSettings.ringStrokeColor);
  graphics_context_set_stroke_width(ctx, strokeWidth);

  GRect twilightStartRect = GRect(dayStart.x - boxSize / 2, dayStart.y - boxSize / 2, boxSize, boxSize);
  GRect twilightEndRect = GRect(dayEnd.x - boxSize / 2, dayEnd.y - boxSize / 2, boxSize, boxSize);

  // Correct boundaries of the twilight blocks, if necessary
  // (this ensures that the ring doesn't "break" if a block is on an edge)
  twilightStartRect = snap_to_edges(twilightStartRect, bounds, thickness);
  twilightEndRect = snap_to_edges(twilightEndRect, bounds, thickness);

  // draw sunrise block
  graphics_context_set_fill_color(ctx, globalSettings.ringSunriseColor);
  graphics_fill_rect(ctx, twilightStartRect, 0, GCornerNone);
  graphics_draw_rect(ctx,GRect(twilightStartRect.origin.x - 2,
                                twilightStartRect.origin.y - 2,
                                twilightStartRect.size.w + 4,
                                twilightStartRect.size.h  + 4)
                    );

  // draw sunset block
  graphics_context_set_fill_color(ctx, globalSettings.ringSunsetColor);
  graphics_fill_rect(ctx, twilightEndRect, 0, GCornerNone);
  graphics_draw_rect(ctx,GRect(twilightEndRect.origin.x - 2,
                                twilightEndRect.origin.y - 2,
                                twilightEndRect.size.w + 4,
                                twilightEndRect.size.h  + 4)
                    );

  // cue the sun! 
  graphics_context_set_fill_color(ctx, globalSettings.sunFillColor);
  graphics_context_set_stroke_color(ctx, globalSettings.sunStrokeColor);
  graphics_fill_circle(ctx, sunPos, 7);
  graphics_draw_circle(ctx, sunPos, 7);
}
#endif