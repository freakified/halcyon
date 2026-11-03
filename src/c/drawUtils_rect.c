#ifdef PBL_RECT

#include "alarmUtils.h"
#include "drawUtils.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"

static ColorTheme currentTheme;

GPoint get_rect_position(float progress, GRect bounds) {
  if (progress < 0.25f) {
    float t = progress / 0.25f;
    return GPoint(bounds.origin.x + (int)(t * bounds.size.w), bounds.origin.y);
  } else if (progress < 0.5f) {
    float t = (progress - 0.25f) / 0.25f;
    return GPoint(bounds.origin.x + bounds.size.w,
                  bounds.origin.y + (int)(t * bounds.size.h));
  } else if (progress < 0.75f) {
    float t = (progress - 0.5f) / 0.25f;
    return GPoint(bounds.origin.x + bounds.size.w - (int)(t * bounds.size.w),
                  bounds.origin.y + bounds.size.h);
  } else {
    float t = (progress - 0.75f) / 0.25f;
    return GPoint(bounds.origin.x,
                  bounds.origin.y + bounds.size.h - (int)(t * bounds.size.h));
  }
}

GPoint getPipPosition(int id, int numPips, GRect bounds) {
  float progress = (float)id / (float)numPips;
  return get_rect_position(progress, bounds);
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

    int length = is_main_pip ? long_pip_length : pip_length;

    graphics_context_set_stroke_color(
        ctx, is_main_pip ? currentTheme.pipColorPrimary
                         : currentTheme.pipColorSecondary);
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
  currentTheme = getCurrentColorTheme();
  GRect bounds = layer_get_bounds(layer);
  int thickness = RING_THICKNESS;
  int strokeWidth = RING_STROKE_WIDTH;
  GRect innerBounds =
      GRect(bounds.origin.x + thickness / 2, bounds.origin.y + thickness / 2,
            bounds.size.w - thickness, bounds.size.h - thickness);

  GRect sunBounds = GRect(bounds.origin.x + SUN_INSET, bounds.origin.y + SUN_INSET,
                          bounds.size.w - SUN_INSET * 2,
                          bounds.size.h - SUN_INSET * 2);

  int numPositions = 96;
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
  int hour = timeInfo->tm_hour;
  int minute = timeInfo->tm_min;

  // Shift time by 15 hours so that it starts at the bottom
  int shiftedHour = (hour + 15) % 24;
  float progress = ((shiftedHour % 24) + (minute / 60.0f)) / 24.0f;

  GPoint sunPos = get_rect_position(progress, sunBounds);

  // Apply the same 15-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute =
      (currentSolarInfo.sunriseMinute + 15 * 60) % (24 * 60);
  int shiftedSunsetMinute =
      (currentSolarInfo.sunsetMinute + 15 * 60) % (24 * 60);

  // Calculate sunrise and sunset positions on the ring using getPipPosition
  int dayStartPos =
      (int)(((shiftedSunriseMinute / 1440.0f) * numPositions) + 0.5);
  int dayEndPos = (int)(((shiftedSunsetMinute / 1440.0f) * numPositions) + 0.5);

  GPoint dayStart = getPipPosition(dayStartPos, numPositions, innerBounds);
  GPoint dayEnd = getPipPosition(dayEndPos, numPositions, innerBounds);

  // Fill the day section
  graphics_context_set_fill_color(ctx, currentTheme.ringDayColor);
  for (int i = dayStartPos; i != dayEndPos; i = (i + 1) % numPositions) {
    GPoint pipPos = getPipPosition(i, numPositions, innerBounds);
    graphics_fill_rect(ctx,
                       GRect(pipPos.x - thickness / 2, pipPos.y - thickness / 2,
                             thickness, thickness),
                       0, GCornerNone);
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

#ifdef HAS_ALARMS
  // mark the next alarm along the sun's path (underneath the sun, in case
  // it's nearly time)
  if (globalSettings.showNextAlarm && nextAlarmMinute != NO_ALARM) {
    int shiftedAlarmMinute = (nextAlarmMinute + 15 * 60) % (24 * 60);
    GPoint alarmPos =
        get_rect_position(shiftedAlarmMinute / 1440.0f, sunBounds);
    draw_alarm_marker(ctx, alarmPos, currentTheme.alarmColor,
                      currentTheme.ringStrokeColor);
  }
#endif

  // cue the sun!
  graphics_context_set_fill_color(ctx, currentTheme.sunFillColor);
  graphics_context_set_stroke_color(ctx, currentTheme.sunStrokeColor);
  graphics_fill_circle(ctx, sunPos, SUN_DIAMETER);
  graphics_draw_circle(ctx, sunPos, SUN_DIAMETER);
}
#endif