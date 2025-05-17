#ifdef PBL_ROUND

#include "drawUtils.h"
#include "settings.h"
#include "utils.h"
#include "solarUtils.h"

void draw_center_layer(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, globalSettings.bgColor);
  
  // Draw the background circle
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, bounds.size.w / 2, 0, TRIG_MAX_ANGLE);

  // Parameters for pips
  int numPips = 24;  // Number of pips (adjust as needed)
  int pip_length = 3; // Length for smaller pips
  int long_pip_length = 4; // Length for cardinal direction pips (longer)

  // Loop to draw the pips
  for (int i = 0; i < numPips; i++) {
    // Determine if the current pip is a "main" pip (e.g., cardinal directions)
    bool is_main_pip = (i % (numPips / 8) == 0);
    int length = is_main_pip ? long_pip_length : pip_length;

    // Set color based on pip type
    graphics_context_set_stroke_color(ctx, is_main_pip ? globalSettings.pipColorPrimary : globalSettings.pipColorSecondary);
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
  GRect bounds = layer_get_bounds(layer);
  int thickness = RING_THICKNESS;
  int strokeWidth = RING_STROKE_WIDTH;
  int hourShift = 12;

  // Draw the stroke and day ring
  graphics_context_set_fill_color(ctx, globalSettings.ringStrokeColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, EDGE_THICKNESS, 0, TRIG_MAX_ANGLE);

  // Get time and sun position
  struct tm *timeInfo = getCurrentTime();
  int hour = timeInfo->tm_hour;
  int minute = timeInfo->tm_min;

  // Shift time by 12 hours so that it starts at the bottom
  int shiftedHour = (hour + hourShift) % 24;
  float progress = ((shiftedHour % 24) + (minute / 60.0f)) / 24.0f;
  
  // Calculate sun position using polar coordinates
  GRect sunBoundingRect = GRect(bounds.origin.x + thickness / 2 + strokeWidth, bounds.origin.y + thickness / 2 + strokeWidth, bounds.size.w - thickness - strokeWidth * 2, bounds.size.h - thickness - strokeWidth * 2);
  int angle = (int)(TRIG_MAX_ANGLE * progress);
  GPoint sunPos = gpoint_from_polar(sunBoundingRect, GOvalScaleModeFitCircle, angle);

  // Apply the same 12-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute = (currentSolarInfo.sunriseMinute + hourShift * 60) % (24 * 60);
  int shiftedSunsetMinute = (currentSolarInfo.sunsetMinute + hourShift * 60) % (24 * 60);

  // Calculate sunrise and sunset positions using polar coordinates
  int dayStartAngle = (int)((shiftedSunriseMinute / 1440.0f) * TRIG_MAX_ANGLE);
  int dayEndAngle = (int)((shiftedSunsetMinute / 1440.0f) * TRIG_MAX_ANGLE);

  // Note: this *will* break if there isn't daylight at noon, but luckily
  // that doesn't happen very often

  // Draw the top left area
  graphics_context_set_fill_color(ctx, globalSettings.ringDayColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, 0, dayEndAngle);

  // Draw the top right area
  graphics_context_set_fill_color(ctx, globalSettings.ringDayColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, dayStartAngle, TRIG_MAX_ANGLE);

  // Draw the night area
  graphics_context_set_fill_color(ctx, globalSettings.ringNightColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, dayEndAngle, dayStartAngle);

  // Calculate the angle for the sunrise/sunset arcs to be centered around the times
  int arcLength = TRIG_MAX_ANGLE / 30; // 30-minute arc length
  int sunriseStartAngle = dayStartAngle - arcLength / 2;
  int sunriseEndAngle = dayStartAngle + arcLength / 2;
  int sunsetStartAngle = dayEndAngle - arcLength / 2;
  int sunsetEndAngle = dayEndAngle + arcLength / 2;
  int arcStroke = TRIG_MAX_ANGLE / 180;

  // Draw the stroke behind the sunrise and sunset arcs (border)
  int borderArcLength = arcLength + TRIG_MAX_ANGLE / 60; // Slightly longer than the arcs
  graphics_context_set_fill_color(ctx, globalSettings.ringStrokeColor);

  // Draw the border behind sunrise
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, sunriseStartAngle - arcStroke, sunriseEndAngle + arcStroke);

  // Draw the border behind sunset
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, sunsetStartAngle - arcStroke, sunsetEndAngle + arcStroke);

  // Draw the sunrise and sunset arcs
  graphics_context_set_fill_color(ctx, globalSettings.ringSunriseColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, sunriseStartAngle, sunriseEndAngle);

  graphics_context_set_fill_color(ctx, globalSettings.ringSunsetColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, sunsetStartAngle, sunsetEndAngle);

  // Draw the sun position
  graphics_context_set_stroke_width(ctx, strokeWidth);
  graphics_context_set_fill_color(ctx, globalSettings.sunFillColor);
  graphics_context_set_stroke_color(ctx, globalSettings.sunStrokeColor);
  graphics_fill_circle(ctx, sunPos, 6);
  graphics_draw_circle(ctx, sunPos, 6);

  //   graphics_context_set_fill_color(ctx, GColorRed);
  // graphics_fill_rect(ctx, sunBoundingRect, 0, GCornerNone);
}

#endif