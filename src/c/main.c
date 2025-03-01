#include <pebble.h>
#include "utils.h"
#include "messaging.h"
#include "bgpicker.h"

#define FORCE_BACKLIGHT
#define FORCE_12H true
#define TIME_STR_LEN 6
#define DATE_STR_LEN 25

// default colors
#define BASE_BG_COLOR GColorBlack
#define CENTER_BG_COLOR GColorWhite

// windows and layers
static Window* mainWindow;
static TextLayer* timeLayer;
static TextLayer* dateLayer;
static Layer* centerLayer;

// fonts
static GFont timeFont;
static GFont dateFont;

// long-lived strings
static char timeText[TIME_STR_LEN];
static char dateText[DATE_STR_LEN];

static void update_clock() {
  time_t rawTime;
  struct tm* timeInfo;

  time(&rawTime);
  timeInfo = localtime(&rawTime);

  // set time string
  if(clock_is_24h_style() && !FORCE_12H) {
    // use 24 hour format
    strftime(timeText, TIME_STR_LEN, "%H:%M", timeInfo);
  } else {
    // use 12 hour format
    strftime(timeText, TIME_STR_LEN, "%I:%M", timeInfo);
  }

  //now trim leading 0's
  if(timeText[0] == '0') {
    //shuffle everyone back by 1
    for(int i = 0; i < TIME_STR_LEN; i++) {
      timeText[i] = timeText[i + 1];
    }
  }

  // display this time on the TextLayer
  text_layer_set_text(timeLayer, timeText);

  // display the date
  strftime(dateText, DATE_STR_LEN, "%a, %b %e", timeInfo);
  to_uppercase(dateText);
  text_layer_set_text(dateLayer, dateText);

  // forces the the background image to update, reflecting changes immediately
  // bitmap_layer_set_bitmap(bgLayer, bgpicker_getCurrentBG(timeInfo));

  if(timeInfo->tm_hour == 0 && timeInfo->tm_min == 0) {
    bgpicker_updateLocation(bgpicker_location);
  }
}

static void center_layer_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);
}

static void main_window_load(Window *window) {
  //Create GBitmap, then set to created BitmapLayer
  // bgLayer = bitmap_layer_create(GRect(0, 0, 144, 168));
  // layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(bgLayer));
  // 
  // Get fonts
  timeFont = fonts_get_system_font(FONT_KEY_LECO_32_BOLD_NUMBERS);
  dateFont = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);

   // Get information about the Window
  Layer *window_layer = window_get_root_layer(window);
  window_set_background_color(window, BASE_BG_COLOR);
  GRect bounds = layer_get_bounds(window_layer);

  // Create central rectangle
  GRect centerFrame = GRect(bounds.origin.x + 20, bounds.origin.y + 20, bounds.size.w - 40, bounds.size.h - 40);
  centerLayer = layer_create(centerFrame);
  layer_set_update_proc(centerLayer, center_layer_update_proc);
  layer_add_child(window_layer, centerLayer);

  // Create time TextLayer
  timeLayer = text_layer_create(GRect(0, 34, bounds.size.w - 40, 40));;
  text_layer_set_background_color(timeLayer, GColorClear);
  text_layer_set_text_color(timeLayer, GColorBlack);
  text_layer_set_font(timeLayer, timeFont);
  text_layer_set_text_alignment(timeLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(timeLayer));

  // Create date TextLayer
  dateLayer = text_layer_create(
      GRect(0, 64, bounds.size.w - 40, 20));
  text_layer_set_background_color(dateLayer, GColorClear);
  // text_layer_set_background_color(dateLayer, GColorKellyGreen);
  text_layer_set_font(dateLayer, dateFont);
  text_layer_set_text_alignment(dateLayer, GTextAlignmentCenter);
  layer_add_child(centerLayer, text_layer_get_layer(dateLayer));

  // recalculate the sunrise/sunset times
  bgpicker_updateLocation(bgpicker_location);

  // Make sure the time is displayed from the start
  update_clock();
}

static void main_window_unload(Window *window) {
  //Destroy 
  bgpicker_destruct();

  // Destroy TextLayer
  text_layer_destroy(timeLayer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_clock();
}


static void init() {
  #ifdef FORCE_BACKLIGHT
  light_enable(true);
  #endif

  // load background images
  bgpicker_init();

  // init the messaging thing
  messaging_init();

  // Create main Window element and assign to pointer
  mainWindow = window_create();

  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(mainWindow, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });

  // Show the Window on the watch, with animated=true
  window_stack_push(mainWindow, true);

  // Register with TickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
}

static void deinit() {
  // Destroy Window
  window_destroy(mainWindow);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
