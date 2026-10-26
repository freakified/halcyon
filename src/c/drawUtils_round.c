#ifdef PBL_ROUND

#include "drawUtils.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"

static ColorTheme currentTheme;

void draw_center_layer(Layer *layer, GContext *ctx) {
  currentTheme = getCurrentColorTheme();
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, currentTheme.bgColor);

  // Draw the background circle
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, bounds.size.w / 2,
                       0, TRIG_MAX_ANGLE);

  // Parameters for pips
  int numPips = 24;        // Number of pips (adjust as needed)
  int pip_length = 3;      // Length for smaller pips
  int long_pip_length = 4; // Length for cardinal direction pips (longer)

  // Loop to draw the pips
  for (int i = 0; i < numPips; i++) {
    // Determine if the current pip is a "main" pip (e.g., cardinal directions)
    bool is_main_pip = (i % (numPips / 8) == 0);

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

    // Set color based on pip type
    graphics_context_set_stroke_color(
        ctx, is_main_pip ? currentTheme.pipColorPrimary
                         : currentTheme.pipColorSecondary);
    graphics_context_set_stroke_width(ctx, 3);

    int angle = (i * TRIG_MAX_ANGLE) / numPips;

    GPoint start = gpoint_from_polar(bounds, GOvalScaleModeFitCircle, angle);
    GPoint end = gpoint_from_polar(bounds, GOvalScaleModeFitCircle, angle);

    end.x -= (length * sin_lookup(angle) / TRIG_MAX_RATIO);
    end.y += (length * cos_lookup(angle) / TRIG_MAX_RATIO);

    graphics_draw_line(ctx, start, end);
  }
}

void draw_ring_layer(Layer *layer, GContext *ctx) {
  currentTheme = getCurrentColorTheme();
  GRect bounds = layer_get_bounds(layer);

  // Expand bounds to avoid antialiasing artifacts at the screen edge
  const int expansion = 2;
  GRect draw_bounds =
      grect_inset(bounds, GEdgeInsets(-expansion, -expansion, -expansion, -expansion));

  int thickness = RING_THICKNESS;
  int expanded_thickness = thickness + expansion;
  int expanded_edge_thickness = EDGE_THICKNESS + expansion;

  int strokeWidth = RING_STROKE_WIDTH;
  int hourShift = 12;

  // Draw outer ring
  graphics_context_set_fill_color(ctx, currentTheme.ringStrokeColor);
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_edge_thickness, 0, TRIG_MAX_ANGLE);

  // Get time and sun position
  struct tm *timeInfo = getCurrentTime();
  int hour = timeInfo->tm_hour;
  int minute = timeInfo->tm_min;

  // Shift time by 12 hours so that it starts at the bottom
  int shiftedHour = (hour + hourShift) % 24;
  float progress = ((shiftedHour % 24) + (minute / 60.0f)) / 24.0f;

  // Calculate sun position using polar coordinates (using original bounds)
  GRect sunBoundingRect =
      GRect(bounds.origin.x + SUN_INSET, bounds.origin.y + SUN_INSET,
            bounds.size.w - SUN_INSET * 2, bounds.size.h - SUN_INSET * 2);
  int angle = (int)(TRIG_MAX_ANGLE * progress);
  GPoint sunPos =
      gpoint_from_polar(sunBoundingRect, GOvalScaleModeFitCircle, angle);

  // Apply the same 12-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute =
      (currentSolarInfo.sunriseMinute + hourShift * 60) % (24 * 60);
  int shiftedSunsetMinute =
      (currentSolarInfo.sunsetMinute + hourShift * 60) % (24 * 60);

  // Calculate sunrise and sunset positions using polar coordinates
  int dayStartAngle = (int)((shiftedSunriseMinute / 1440.0f) * TRIG_MAX_ANGLE);
  int dayEndAngle = (int)((shiftedSunsetMinute / 1440.0f) * TRIG_MAX_ANGLE);

  // Draw the night area as the whole ring, then the day on top of it
  graphics_context_set_fill_color(ctx, currentTheme.ringNightColor);
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_thickness, 0, TRIG_MAX_ANGLE);

  graphics_context_set_fill_color(ctx, currentTheme.ringDayColor);
  if (dayStartAngle > dayEndAngle) {
    // Usual case: daylight at noon, so the day wraps past the top
    graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                         expanded_thickness, dayStartAngle, TRIG_MAX_ANGLE);
    graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                         expanded_thickness, 0, dayEndAngle);
  } else {
    // Night at noon (e.g. a far-away manual location)
    graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                         expanded_thickness, dayStartAngle, dayEndAngle);
  }

  // Calculate the angle for the sunrise/sunset arcs to be centered around the
  // times
  int arcLength = TRIG_MAX_ANGLE / 30; // 30-minute arc length
  int sunriseStartAngle = dayStartAngle - arcLength / 2;
  int sunriseEndAngle = dayStartAngle + arcLength / 2;
  int sunsetStartAngle = dayEndAngle - arcLength / 2;
  int sunsetEndAngle = dayEndAngle + arcLength / 2;
  // slightly narrower arc stroke on gabbro
#if defined(PBL_PLATFORM_GABBRO)
  int arcStroke = TRIG_MAX_ANGLE / 270;
#else
  int arcStroke = TRIG_MAX_ANGLE / 180;
#endif

  graphics_context_set_fill_color(ctx, currentTheme.ringStrokeColor);

  // Draw the border behind sunrise
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_thickness, sunriseStartAngle - arcStroke,
                       sunriseEndAngle + arcStroke);

  // Draw the border behind sunset
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_thickness, sunsetStartAngle - arcStroke,
                       sunsetEndAngle + arcStroke);

  // Draw the sunrise and sunset arcs
  graphics_context_set_fill_color(ctx, currentTheme.ringSunriseColor);
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_thickness, sunriseStartAngle, sunriseEndAngle);

  graphics_context_set_fill_color(ctx, currentTheme.ringSunsetColor);
  graphics_fill_radial(ctx, draw_bounds, GOvalScaleModeFitCircle,
                       expanded_thickness, sunsetStartAngle, sunsetEndAngle);

  // Draw the sun position
  graphics_context_set_stroke_width(ctx, strokeWidth);
  graphics_context_set_fill_color(ctx, currentTheme.sunFillColor);
  graphics_context_set_stroke_color(ctx, currentTheme.sunStrokeColor);
  graphics_fill_circle(ctx, sunPos, SUN_DIAMETER);
  graphics_draw_circle(ctx, sunPos, SUN_DIAMETER);

  //   graphics_context_set_fill_color(ctx, GColorRed);
  // graphics_fill_rect(ctx, sunBoundingRect, 0, GCornerNone);
}

#endif