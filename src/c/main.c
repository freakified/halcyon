
#include <pebble.h>

// #define USE_FAKE_TIME
// #define FORCE_BACKLIGHT

#include "messaging.h"
#include "settings.h"
#include "solarUtils.h"
#include "utils.h"
#include "drawUtils.h"

#define FORCE_12H false
#define TIME_STR_LEN 6
#define DATE_STR_LEN 25

// various layer metrics
#define TIME_LAYER_YPOS PBL_IF_ROUND_ELSE(39, 34)
#define DATE_LAYER_YPOS PBL_IF_ROUND_ELSE(79, 68)
#define TEXT_LAYER_HEIGHT 60

// per-platform fonts
#ifdef PBL_PLATFORM_EMERY
  // the Time 2
  #define FONT_TIME_STANDARD FONT_KEY_LECO_42_NUMBERS
  #define FONT_DATE_STANDARD FONT_KEY_GOTHIC_24_BOLD
  #define FONT_TIME_LARGE    FONT_KEY_ROBOTO_BOLD_SUBSET_49
  #define FONT_DATE_LARGE    FONT_KEY_GOTHIC_28_BOLD
#elif defined(PBL_ROUND)
  // time round
  #define FONT_TIME_STANDARD FONT_KEY_LECO_38_BOLD_NUMBERS
  #define FONT_DATE_STANDARD FONT_KEY_GOTHIC_18_BOLD
  #define FONT_TIME_LARGE    FONT_KEY_LECO_42_NUMBERS
  #define FONT_DATE_LARGE    FONT_KEY_GOTHIC_24_BOLD
#else
  // regular pebbles
  #define FONT_TIME_STANDARD FONT_KEY_LECO_32_BOLD_NUMBERS
  #define FONT_DATE_STANDARD FONT_KEY_GOTHIC_18_BOLD
  #define FONT_TIME_LARGE    FONT_KEY_LECO_36_BOLD_NUMBERS
  #define FONT_DATE_LARGE    FONT_KEY_GOTHIC_24_BOLD
#endif

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

// Resize literally everything on quick view 
// I wonder if there is a more efficient way to do this
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
  if (new_center_height < 0) new_center_height = 0;
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
    solarUtils_recalculateSolarData();
  }

  // redraw solar ring layer
  layer_mark_dirty(ringLayer);
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
  bool useLargeFontSetting = false; // this will eventually be a user preference

  // use the platform-appropriate fonts we defined earlier
  timeFont = fonts_get_system_font(useLargeFontSetting ? FONT_TIME_LARGE : FONT_TIME_STANDARD);
  dateFont = fonts_get_system_font(useLargeFontSetting ? FONT_DATE_LARGE : FONT_DATE_STANDARD);

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

  // create ring layer
  ringLayer = layer_create(bounds);
  layer_set_update_proc(ringLayer, draw_ring_layer);
  layer_add_child(shiftingLayer, ringLayer);

  // create time TextLayer
  timeLayer =
      text_layer_create(GRect(0, TIME_LAYER_YPOS, bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));
  ;
  text_layer_set_background_color(timeLayer, GColorClear);
  text_layer_set_font(timeLayer, timeFont);
  text_layer_set_text_alignment(timeLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(timeLayer));

  // create date TextLayer
  dateLayer =
      text_layer_create(GRect(0, DATE_LAYER_YPOS, bounds.size.w - EDGE_THICKNESS * 2, TEXT_LAYER_HEIGHT));
  text_layer_set_background_color(dateLayer, GColorClear);
  text_layer_set_font(dateLayer, dateFont);
  text_layer_set_text_alignment(dateLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(dateLayer));

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
  text_layer_destroy(timeLayer);
  text_layer_destroy(dateLayer);
  layer_destroy(ringLayer);
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
