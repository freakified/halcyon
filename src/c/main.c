#include <pebble.h>
#include "messaging.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"

#define FORCE_BACKLIGHT
#define FORCE_12H false
#define TIME_STR_LEN 6
#define DATE_STR_LEN 25

// various metrics
#define EDGE_THICKNESS 19
#define RING_THICKNESS 16
#define TIME_LAYER_YPOS PBL_IF_ROUND_ELSE(39, 34)
#define DATE_LAYER_YPOS PBL_IF_ROUND_ELSE(79, 68)
#define TEXT_LAYER_HEIGHT 40

// windows and layers
static Window *mainWindow;
static TextLayer *timeLayer;
static TextLayer *dateLayer;
static Layer *windowLayer;
static Layer *shiftingLayer;
static Layer *centerLayer;
static Layer *ringLayer;

// fonts
static GFont timeFont;
static GFont dateFont;

// long-lived strings
static char timeText[TIME_STR_LEN];
static char dateText[DATE_STR_LEN];

static SolarInfo currentSolarInfo;

// Resize literally everything on quick view 
// I wonder if there was some more efficient way to do this
static void quickViewLayerReposition() {
  GRect full_bounds = layer_get_bounds(windowLayer);
  GRect bounds = layer_get_unobstructed_bounds(windowLayer);

  int new_height = bounds.size.h;
  int diff = full_bounds.size.h - bounds.size.h;
  int shift_up = diff / 2;

  GRect shiftingFrame = GRect(0, 0, full_bounds.size.w, new_height);
  layer_set_frame(shiftingLayer, shiftingFrame);

  layer_set_frame(ringLayer, GRect(0, 0, shiftingFrame.size.w, shiftingFrame.size.h));

  int new_center_height = new_height - 2 * EDGE_THICKNESS;
  if (new_center_height < 0) new_center_height = 0; // Prevent negative values
  GRect centerFrame = GRect(
      EDGE_THICKNESS, EDGE_THICKNESS,
      shiftingFrame.size.w - 2 * EDGE_THICKNESS, new_center_height);
  layer_set_frame(centerLayer, centerFrame);

  layer_set_frame(text_layer_get_layer(timeLayer),
      GRect(0, TIME_LAYER_YPOS - shift_up, full_bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));
  layer_set_frame(text_layer_get_layer(dateLayer),
      GRect(0, DATE_LAYER_YPOS - shift_up, full_bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));

  layer_mark_dirty(ringLayer);
  layer_mark_dirty(centerLayer);
}

#ifdef PBL_RECT
static GPoint getPipPosition(int id, int numPips, GRect bounds) {
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
#endif

#ifdef PBL_ROUND
static void ring_layer_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  int thickness = 16;
  int strokeWidth = 3;
  int hourShift = 12;

  GRect innerBounds = GRect(bounds.origin.x + thickness / 2, bounds.origin.y + thickness / 2, bounds.size.w - thickness, bounds.size.h - thickness);

  // Draw the stroke and day ring
  graphics_context_set_fill_color(ctx, globalSettings.ringStrokeColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, EDGE_THICKNESS, 0, TRIG_MAX_ANGLE);

  // Get time and sun position
  time_t now = time(NULL);
  struct tm *timeInfo = localtime(&now);
  int hour = timeInfo->tm_hour;
  int minute = timeInfo->tm_min;

  // Shift time by 12 hours so that it starts at the bottom
  int shiftedHour = (hour + hourShift) % 24;
  float progress = ((shiftedHour % 24) + (minute / 60.0f)) / 24.0f;
  
  // Calculate sun position using polar coordinates
  int angle = (int)(TRIG_MAX_ANGLE * progress);
  GPoint sunPos = gpoint_from_polar(innerBounds, GOvalScaleModeFitCircle, angle);

  // Apply the same 12-hour shift to the sunrise and sunset times
  int shiftedSunriseMinute = (currentSolarInfo.sunriseMinute + hourShift * 60) % (24 * 60);
  int shiftedSunsetMinute = (currentSolarInfo.sunsetMinute + hourShift * 60) % (24 * 60);

  // Calculate sunrise and sunset positions using polar coordinates
  int dayStartAngle = (int)((shiftedSunriseMinute / 1440.0f) * TRIG_MAX_ANGLE);
  int dayEndAngle = (int)((shiftedSunsetMinute / 1440.0f) * TRIG_MAX_ANGLE);

  // Note: this will break if there isn't daylight at noon
  // Draw the top left area
  graphics_context_set_fill_color(ctx, globalSettings.ringDayColor);
  graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, thickness, 0, dayEndAngle);

  // Draw the top right area
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
  graphics_fill_circle(ctx, sunPos, 7);
  graphics_draw_circle(ctx, sunPos, 7);
}
#else
static void ring_layer_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  int thickness = 16;
  int strokeWidth = 3;
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
  time_t now = time(NULL);
  struct tm *timeInfo = localtime(&now);
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

static void update_clock() {
  time_t rawTime;
  struct tm *timeInfo;

  time(&rawTime);
  timeInfo = localtime(&rawTime);

  // set time string
  if (clock_is_24h_style() && !FORCE_12H) {
    // use 24 hour format
    strftime(timeText, TIME_STR_LEN, "%H:%M", timeInfo);
  } else {
    // use 12 hour format
    strftime(timeText, TIME_STR_LEN, "%I:%M", timeInfo);
  }

  // now trim leading 0's
  if (timeText[0] == '0') {
    // shuffle everyone back by 1
    for (int i = 0; i < TIME_STR_LEN; i++) {
      timeText[i] = timeText[i + 1];
    }
  }

  // ensure colors are updated based on settings
  window_set_background_color(mainWindow, globalSettings.ringStrokeColor);
  text_layer_set_text_color(timeLayer, globalSettings.timeColor);
  text_layer_set_text_color(dateLayer, globalSettings.subtextPrimaryColor);

  // display this time on the TextLayer
  text_layer_set_text(timeLayer, timeText);

  // display the date
  strftime(dateText, DATE_STR_LEN, "%a, %b %e", timeInfo);
  to_uppercase(dateText);
  text_layer_set_text(dateLayer, dateText);
  
  // if sunrise/sunset has not yet been calculated, do that
  if(currentSolarInfo.sunriseMinute == 0 && currentSolarInfo.sunriseMinute == 0) {
    currentSolarInfo = solarUtils_recalculateSolarData();
  }

  // redraw solar ring layer
  layer_mark_dirty(ringLayer);
}

#ifdef PBL_ROUND
static void center_layer_update_proc(Layer *layer, GContext *ctx) {
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
#else
static void center_layer_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, globalSettings.bgColor);
  
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);

  int innerPadding = 0;

  // Corrections to fix symmetry, probably due to some kind of odd numbers
  bounds.origin.x += innerPadding;
  bounds.origin.y += innerPadding;
  bounds.size.w -= innerPadding * innerPadding + 1;
  bounds.size.h -= innerPadding * innerPadding + 1;

  int numPips = 24;
  int pip_length = 2;
  int long_pip_length = 3; // Longer for cardinal directions

  for (int i = 0; i < numPips; i++) {
    bool is_main_pip = ((i - (numPips / 8)) % (numPips / 4) == 0);
    int length = is_main_pip ? long_pip_length : pip_length;

    // Set color based on pip type
    graphics_context_set_stroke_color(ctx, is_main_pip ? globalSettings.pipColorPrimary
                                                       : globalSettings.pipColorSecondary);
    graphics_context_set_stroke_width(ctx, 3);

    GPoint start = getPipPosition(i, numPips, bounds);

    // Contract bounds inward for end position
    GRect contracted_bounds = bounds;
    contracted_bounds.origin.x += length;
    contracted_bounds.origin.y += length;
    contracted_bounds.size.w -= 2 * length;
    contracted_bounds.size.h -= 2 * length;

    GPoint end = getPipPosition(i, numPips, contracted_bounds);

    graphics_draw_line(ctx, start, end);
  }
}
#endif

// settings might have changed, so recalculate solar data and refresh screen
void onSettingsChanged() {
    currentSolarInfo = solarUtils_recalculateSolarData();

    APP_LOG(APP_LOG_LEVEL_INFO, "I guess settings canged");
    
    update_clock();
}

// Event fires frequently, while obstruction is appearing or disappearing
static void onUnobstructedAreaChange(AnimationProgress progress, void *context) {
  quickViewLayerReposition();
}

// Event fires once, after obstruction appears or disappears
static void onUnobstructedAreaDidChange(void *context) {
  quickViewLayerReposition();
}

static void main_window_load(Window *window) {
  //  Get fonts
  timeFont = fonts_get_system_font(PBL_IF_ROUND_ELSE(FONT_KEY_LECO_38_BOLD_NUMBERS, FONT_KEY_LECO_32_BOLD_NUMBERS));
  dateFont = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);

  // Get information about the Window
  windowLayer = window_get_root_layer(window);
  window_set_background_color(window, globalSettings.ringStrokeColor);
  GRect bounds = layer_get_bounds(windowLayer);

  shiftingLayer = layer_create(bounds);
  layer_add_child(windowLayer, shiftingLayer);


  // Create central rectangle
  GRect centerFrame = GRect(
      bounds.origin.x + EDGE_THICKNESS, bounds.origin.y + EDGE_THICKNESS,
      bounds.size.w - EDGE_THICKNESS * 2, bounds.size.h - EDGE_THICKNESS * 2);
  centerLayer = layer_create(centerFrame);
  layer_set_update_proc(centerLayer, center_layer_update_proc);
  layer_add_child(shiftingLayer, centerLayer);

  // Create ring layer
  ringLayer = layer_create(bounds);
  layer_set_update_proc(ringLayer, ring_layer_update_proc);
  layer_add_child(shiftingLayer, ringLayer);

  // Create time TextLayer
  timeLayer =
      text_layer_create(GRect(0, TIME_LAYER_YPOS, bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));
  ;
  text_layer_set_background_color(timeLayer, GColorClear);
  text_layer_set_font(timeLayer, timeFont);
  text_layer_set_text_alignment(timeLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(timeLayer));

  // Create date TextLayer
  dateLayer =
      text_layer_create(GRect(0, DATE_LAYER_YPOS, bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));
  text_layer_set_background_color(dateLayer, GColorClear);
  text_layer_set_font(dateLayer, dateFont);
  text_layer_set_text_alignment(dateLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(dateLayer));

  // Subscribe to the unobstructed area events
  UnobstructedAreaHandlers handlers = {
    .change = onUnobstructedAreaChange,
    .did_change = onUnobstructedAreaDidChange
  };
  unobstructed_area_service_subscribe(handlers, NULL);

  // just in case quick view is open on load
  quickViewLayerReposition();

  // Make sure the time is displayed from the start
  update_clock();  
}

static void main_window_unload(Window *window) {
  // Destroy everything
  text_layer_destroy(timeLayer);
  text_layer_destroy(dateLayer);
  layer_destroy(ringLayer);
  layer_destroy(centerLayer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_clock();


}

// static void day_tick_handler(struct tm *tick_time, TimeUnits units_changed) {
//   // make sure we recalculate once per day
//   currentSolarInfo = solarUtils_recalculateSolarData();
//   update_clock();
// }

static void init() {
  #ifdef FORCE_BACKLIGHT
  light_enable(true);
  #endif

  // load those settings
  Settings_init();

  // init the messaging thing
  messaging_init(onSettingsChanged);

  // Create main Window element and assign to pointer
  mainWindow = window_create();

  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(
      mainWindow,
      (WindowHandlers){.load = main_window_load, .unload = main_window_unload});

  window_stack_push(mainWindow, true);

  // Register with TickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
  // tick_timer_service_subscribe(DAY_UNIT, day_tick_handler);
}

static void deinit() { window_destroy(mainWindow); }

int main(void) {
  init();
  app_event_loop();
  deinit();
}
