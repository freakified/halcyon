#include <pebble.h>

// #define USE_FAKE_TIME
// #define FORCE_BACKLIGHT

#include "messaging.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"
#include "drawUtils.h"
#include "text_metrics.h"

#define FORCE_12H false
#define TIME_STR_LEN 6
#define DATE_STR_LEN 25

// windows and layers
static Window *mainWindow;
static Layer *windowLayer;
static Layer *shiftingLayer;
static Layer *centerLayer;
static Layer *ringLayer;
static Layer *infoLayer;

// long-lived strings
static char timeText[TIME_STR_LEN];
static char dateText[DATE_STR_LEN];

static void draw_center_text(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  bool useLargeFontSetting = globalSettings.useLargeFonts;
  
  GFont time_font = fonts_get_system_font(useLargeFontSetting ? FONT_TIME_LARGE : FONT_TIME_STANDARD);
  GFont date_font = fonts_get_system_font(useLargeFontSetting ? FONT_DATE_LARGE : FONT_DATE_STANDARD);

  int time_height = useLargeFontSetting ? FONT_TIME_LARGE_HEIGHT : FONT_TIME_STANDARD_HEIGHT;
  int time_offset = useLargeFontSetting ? FONT_TIME_LARGE_OFFSET : FONT_TIME_STANDARD_OFFSET;

  int date_height = useLargeFontSetting ? FONT_DATE_LARGE_HEIGHT : FONT_DATE_STANDARD_HEIGHT;
  int date_offset = useLargeFontSetting ? FONT_DATE_LARGE_OFFSET : FONT_DATE_STANDARD_OFFSET;

  int total_height = time_height + LINE_PADDING + date_height;
  int start_y = (bounds.size.h - total_height) / 2;

  // Turn these on to debug graphics layout
  //  graphics_context_set_fill_color(ctx, GColorRed);
  // graphics_fill_rect(ctx, GRect(0, start_y, bounds.size.w, time_height), 0, GCornerNone);
  //    graphics_context_set_fill_color(ctx, GColorGreen);
  // graphics_fill_rect(ctx, GRect(0, start_y + time_height + LINE_PADDING, bounds.size.w, date_height), 0, GCornerNone);


  graphics_context_set_text_color(ctx, globalSettings.timeColor);
  graphics_draw_text(ctx, timeText, time_font,
                     GRect(0, start_y - time_offset, bounds.size.w, time_height),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);


  graphics_context_set_text_color(ctx, globalSettings.subtextPrimaryColor);
  graphics_draw_text(ctx, dateText, date_font,
                     GRect(0, start_y + time_height + LINE_PADDING - date_offset, bounds.size.w, date_height),
                     GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
}

// Resize literally everything on quick view 
static void quickViewLayerReposition() {
  GRect full_bounds = layer_get_bounds(windowLayer);
  GRect bounds = layer_get_unobstructed_bounds(windowLayer);

  // Resize the shifting and center layer based on the current unobstructed bounds
  layer_set_frame(shiftingLayer, GRect(0, 0, full_bounds.size.w, bounds.size.h));
  layer_set_frame(ringLayer, GRect(0, 0, full_bounds.size.w, bounds.size.h));

  GRect centerFrame = GRect(
    EDGE_THICKNESS, EDGE_THICKNESS,
    full_bounds.size.w - 2 * EDGE_THICKNESS,
    bounds.size.h - 2 * EDGE_THICKNESS);
  layer_set_frame(centerLayer, centerFrame);

  // Resize the infoLayer to match the new centerLayer
  layer_set_frame(infoLayer, GRect(0, 0, centerFrame.size.w, centerFrame.size.h));

  // Mark everything as dirty to redraw
  layer_mark_dirty(ringLayer);
  layer_mark_dirty(centerLayer);
}

static void update_clock() {
  struct tm *timeInfo = getCurrentTime();

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

  // display the date
  strftime(dateText, DATE_STR_LEN, "%a, %b %e", timeInfo);
  to_uppercase(dateText);
  
  // if sunrise/sunset has not yet been calculated, do that
  if(currentSolarInfo.sunriseMinute == 0 && currentSolarInfo.sunriseMinute == 0) {
    solarUtils_recalculateSolarData();
  }

  // redraw solar ring layer
  layer_mark_dirty(ringLayer);
  layer_mark_dirty(centerLayer);
}

// settings might have changed, so recalculate solar data and refresh screen
void onSettingsChanged() {
    solarUtils_recalculateSolarData();

    APP_LOG(APP_LOG_LEVEL_INFO, "I guess settings changed");
    
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
  // get information about the Window
  windowLayer = window_get_root_layer(window);
  window_set_background_color(window, globalSettings.ringStrokeColor);
  GRect bounds = layer_get_bounds(windowLayer);

  shiftingLayer = layer_create(bounds);
  layer_add_child(windowLayer, shiftingLayer);

  // create central rectangle
  GRect centerFrame = GRect(
      bounds.origin.x + EDGE_THICKNESS, bounds.origin.y + EDGE_THICKNESS,
      bounds.size.w - EDGE_THICKNESS * 2, bounds.size.h - EDGE_THICKNESS * 2);
  centerLayer = layer_create(centerFrame);
  layer_set_update_proc(centerLayer, draw_center_layer);

  layer_add_child(shiftingLayer, centerLayer);

  infoLayer = layer_create(layer_get_bounds(centerLayer));
  layer_set_update_proc(infoLayer, draw_center_text);
  layer_add_child(centerLayer, infoLayer);

  // create ring layer
  ringLayer = layer_create(bounds);
  layer_set_update_proc(ringLayer, draw_ring_layer);
  layer_add_child(shiftingLayer, ringLayer);

  // subscribe to the unobstructed area events
  UnobstructedAreaHandlers handlers = {
    .change = onUnobstructedAreaChange,
    .did_change = onUnobstructedAreaDidChange
  };
  unobstructed_area_service_subscribe(handlers, NULL);

  // just in case quick view is open on load
  quickViewLayerReposition();

  // make sure the time is displayed from the start
  update_clock();
}

static void main_window_unload(Window *window) {
  // destroy everything
  layer_destroy(ringLayer);
  layer_destroy(infoLayer);
  layer_destroy(centerLayer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_clock();
}

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
