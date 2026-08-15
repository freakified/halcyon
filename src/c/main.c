#include <pebble.h>

// #define FORCE_BACKLIGHT

#include "drawUtils.h"
#include "messaging.h"
#include "settings.h"
#include "solarUtils.h"
#include "text_metrics.h"
#include "utils.h"
#include "weather_icon.h"
#include "widgets.h"

#define FORCE_12H false
#define TIME_STR_LEN 6

// Heartbeat timer: the watch requests data from the phone on this interval
#define UPDATE_REQUEST_INTERVAL_MS (30 * 60 * 1000) // 30 minutes
#define UPDATE_REQUEST_INITIAL_DELAY_MS (3 * 1000)   // 3 seconds after startup
#define UPDATE_REQUEST_RETRY_MS (30 * 1000)          // fast retry after outbox fail

// windows and layers
static Window *mainWindow;
static Layer *windowLayer;
static Layer *shiftingLayer;
static Layer *centerLayer;
static Layer *ringLayer;
static Layer *infoLayer;
static bool s_quick_view_visible = false;

// Time string (populated each tick)
static char timeText[TIME_STR_LEN];

// Heartbeat timer for requesting data updates from the phone
static AppTimer *s_update_request_timer = NULL;

// ============================================================
// Slot descriptor — one per visible row in the layout
// ============================================================
typedef enum {
  SLOT_CONTENT_TEXT,
  SLOT_CONTENT_WEATHER_ICON_CURRENT,
  SLOT_CONTENT_WEATHER_ICON_DAY
} SlotContentType;

typedef struct {
  SlotContentType type;
  const char *text;
  GFont font;
  int height; // true pixel height from metrics
  int offset; // top dead-space offset from metrics
  GColor color;
} SlotDescriptor;

static SlotContentType get_slot_content_type(const char *text) {
  if (strcmp(text, WEATHER_ICON_TOKEN) == 0) {
    return SLOT_CONTENT_WEATHER_ICON_CURRENT;
  }
  if (strcmp(text, WEATHER_ICON_DAY_TOKEN) == 0) {
    return SLOT_CONTENT_WEATHER_ICON_DAY;
  }
  return SLOT_CONTENT_TEXT;
}

// Buffer storage for each of the 4 widget slots. Populated by
// update_widget_text() on the minute tick / settings change, then read by
// draw_center_text() on every redraw — so redraws stay allocation-free.
static char widgetTextUS[WIDGET_TEXT_LEN]; // upper secondary
static char widgetTextUP[WIDGET_TEXT_LEN]; // upper primary
static char widgetTextLP[WIDGET_TEXT_LEN]; // lower primary
static char widgetTextLS[WIDGET_TEXT_LEN]; // lower secondary

static void update_widget_text(void) {
  if (globalSettings.widgetUpperSecondary[0] != '\0') {
    widget_get_text(globalSettings.widgetUpperSecondary, widgetTextUS,
                    WIDGET_TEXT_LEN);
  } else {
    widgetTextUS[0] = '\0';
  }
  if (globalSettings.widgetUpperPrimary[0] != '\0') {
    widget_get_text(globalSettings.widgetUpperPrimary, widgetTextUP,
                    WIDGET_TEXT_LEN);
  } else {
    widgetTextUP[0] = '\0';
  }
  if (globalSettings.widgetLowerPrimary[0] != '\0') {
    widget_get_text(globalSettings.widgetLowerPrimary, widgetTextLP,
                    WIDGET_TEXT_LEN);
  } else {
    widgetTextLP[0] = '\0';
  }
  if (globalSettings.widgetLowerSecondary[0] != '\0') {
    widget_get_text(globalSettings.widgetLowerSecondary, widgetTextLS,
                    WIDGET_TEXT_LEN);
  } else {
    widgetTextLS[0] = '\0';
  }
}

static void draw_center_text(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  bool useLargeFont = globalSettings.useLargeFonts;

  bool useNightColors = false;
  if (globalSettings.useNightTheme) {
    struct tm *timeInfo = getCurrentTime();
    int currentMinutes = timeInfo->tm_hour * 60 + timeInfo->tm_min;
    useNightColors = isNightTime(currentMinutes);
  }

  // ---- Font selection ----
  GFont time_font = fonts_get_system_font(FONT_TIME);
  int time_height = FONT_TIME_HEIGHT;
  int time_offset = FONT_TIME_OFFSET;

  GFont primary_font = fonts_get_system_font(
      useLargeFont ? FONT_WIDGET_PRIMARY_LARGE : FONT_WIDGET_PRIMARY);
  int primary_height = useLargeFont ? FONT_WIDGET_PRIMARY_LARGE_HEIGHT
                                    : FONT_WIDGET_PRIMARY_HEIGHT;
  int primary_offset = useLargeFont ? FONT_WIDGET_PRIMARY_LARGE_OFFSET
                                    : FONT_WIDGET_PRIMARY_OFFSET;

  GFont secondary_font = fonts_get_system_font(
      useLargeFont ? FONT_WIDGET_SECONDARY_LARGE : FONT_WIDGET_SECONDARY);
  int secondary_height = useLargeFont ? FONT_WIDGET_SECONDARY_LARGE_HEIGHT
                                      : FONT_WIDGET_SECONDARY_HEIGHT;
  int secondary_offset = useLargeFont ? FONT_WIDGET_SECONDARY_LARGE_OFFSET
                                      : FONT_WIDGET_SECONDARY_OFFSET;

  // ---- Color selection ----
  GColor timeColor =
      useNightColors ? globalSettings.nightTimeColor : globalSettings.timeColor;
  GColor primaryColor = useNightColors ? globalSettings.nightSubtextPrimaryColor
                                       : globalSettings.subtextPrimaryColor;
  GColor secondaryColor = useNightColors
                              ? globalSettings.nightSubtextSecondaryColor
                              : globalSettings.subtextSecondaryColor;
  GColor backgroundColor =
      useNightColors ? globalSettings.nightBgColor : globalSettings.bgColor;

  // ---- Build ordered slot list (top to bottom) ----
  // We use a fixed-size array and fill only active (non-empty) slots.
#define MAX_SLOTS 5
  SlotDescriptor slots[MAX_SLOTS];
  int num_slots = 0;

// Helper macro to push a slot
#define PUSH_SLOT(txt, fnt, h, off, col)                                       \
  do {                                                                         \
    slots[num_slots].type = get_slot_content_type(txt);                        \
    slots[num_slots].text = (txt);                                             \
    slots[num_slots].font = (fnt);                                             \
    slots[num_slots].height = slots[num_slots].type == SLOT_CONTENT_TEXT        \
                                  ? (h)                                        \
                                  : WEATHER_ICON_SIZE;                         \
    slots[num_slots].offset = slots[num_slots].type == SLOT_CONTENT_TEXT        \
                                  ? (off)                                      \
                                  : 0;                                         \
    slots[num_slots].color = (col);                                            \
    num_slots++;                                                               \
  } while (0)

  // Upper secondary (topmost)
  if (!s_quick_view_visible && widgetTextUS[0] != '\0') {
    PUSH_SLOT(widgetTextUS,
              globalSettings.usePrimaryFontForAllWidgets ? primary_font
                                                          : secondary_font,
              globalSettings.usePrimaryFontForAllWidgets ? primary_height
                                                          : secondary_height,
              globalSettings.usePrimaryFontForAllWidgets ? primary_offset
                                                          : secondary_offset,
              secondaryColor);
  }

  // Upper primary
  if (widgetTextUP[0] != '\0') {
    PUSH_SLOT(widgetTextUP, primary_font, primary_height, primary_offset,
              primaryColor);
  }

  // Time (always present)
  PUSH_SLOT(timeText, time_font, time_height, time_offset, timeColor);

  // Lower primary
  if (widgetTextLP[0] != '\0') {
    PUSH_SLOT(widgetTextLP, primary_font, primary_height, primary_offset,
              primaryColor);
  }

  // Lower secondary (bottommost)
  if (!s_quick_view_visible && widgetTextLS[0] != '\0') {
    PUSH_SLOT(widgetTextLS,
              globalSettings.usePrimaryFontForAllWidgets ? primary_font
                                                          : secondary_font,
              globalSettings.usePrimaryFontForAllWidgets ? primary_height
                                                          : secondary_height,
              globalSettings.usePrimaryFontForAllWidgets ? primary_offset
                                                          : secondary_offset,
              secondaryColor);
  }

#undef PUSH_SLOT
#undef MAX_SLOTS

  // ---- Compute total height (with padding between each slot) ----
  int total_height = 0;
  for (int i = 0; i < num_slots; i++) {
    total_height += slots[i].height;
    if (i < num_slots - 1) {
      total_height += LINE_PADDING;
    }
  }

  // ---- Vertically center the block ----
  int y = (bounds.size.h - total_height) / 2;

  // ---- Draw each slot ----
  for (int i = 0; i < num_slots; i++) {
    SlotDescriptor *s = &slots[i];
    if (s->type == SLOT_CONTENT_TEXT) {
      graphics_context_set_text_color(ctx, s->color);
      graphics_draw_text(ctx, s->text, s->font,
                         GRect(0, y - s->offset, bounds.size.w, s->height),
                         GTextOverflowModeTrailingEllipsis,
                         GTextAlignmentCenter, NULL);
    } else {
      weather_icon_draw(ctx, s->type == SLOT_CONTENT_WEATHER_ICON_DAY,
                        GRect(0, y, bounds.size.w, s->height), s->color,
                        backgroundColor);
    }
    y += s->height + LINE_PADDING;
  }
}

// Resize literally everything on quick view
static void quickViewLayerReposition() {
  GRect full_bounds = layer_get_bounds(windowLayer);
  GRect bounds = layer_get_unobstructed_bounds(windowLayer);
  s_quick_view_visible = bounds.size.h < full_bounds.size.h;

  // Resize the shifting and center layer based on the current unobstructed
  // bounds
  layer_set_frame(shiftingLayer,
                  GRect(0, 0, full_bounds.size.w, bounds.size.h));
  layer_set_frame(ringLayer, GRect(0, 0, full_bounds.size.w, bounds.size.h));

  GRect centerFrame = GRect(EDGE_THICKNESS, EDGE_THICKNESS,
                            full_bounds.size.w - 2 * EDGE_THICKNESS,
                            bounds.size.h - 2 * EDGE_THICKNESS);
  layer_set_frame(centerLayer, centerFrame);

  layer_set_frame(infoLayer, GRect(0, centerFrame.origin.y, full_bounds.size.w,
                                   centerFrame.size.h));

  // Mark everything as dirty to redraw
  layer_mark_dirty(ringLayer);
  layer_mark_dirty(centerLayer);
  layer_mark_dirty(infoLayer);
}

static void update_clock() {
  Settings_updateDynamicSettings();

  struct tm *timeInfo = getCurrentTime();

  // set time string
  if (clock_is_24h_style() && !FORCE_12H) {
    strftime(timeText, TIME_STR_LEN, "%H:%M", timeInfo);
  } else {
    strftime(timeText, TIME_STR_LEN, "%I:%M", timeInfo);
  }

  if (!globalSettings.showLeadingZero) {
    if (timeText[0] == '0') {
      for (int i = 0; i < TIME_STR_LEN - 1; i++) {
        timeText[i] = timeText[i + 1];
      }
    }
  }

  // Re-parse widget format strings into static buffers; the layer update
  // callback only reads them, so redraws (e.g. obstruction animations) don't
  // re-parse on every frame.
  update_widget_text();

  // ensure colors are updated based on settings
  window_set_background_color(mainWindow,
                              getCurrentColorTheme().ringStrokeColor);

  // if sunrise/sunset has not yet been calculated, do that
  if (currentSolarInfo.sunriseMinute == DEFAULT_SUNRISE_TIME &&
      currentSolarInfo.sunsetMinute == DEFAULT_SUNSET_TIME) {
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
static void onUnobstructedAreaChange(AnimationProgress progress,
                                     void *context) {
  quickViewLayerReposition();
}

// Event fires once, after obstruction appears or disappears
static void onUnobstructedAreaDidChange(void *context) {
  quickViewLayerReposition();
}

static void main_window_load(Window *window) {
  // get information about the Window
  windowLayer = window_get_root_layer(window);
  window_set_background_color(window, getCurrentColorTheme().ringStrokeColor);
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

  infoLayer = layer_create(
      GRect(0, centerFrame.origin.y, bounds.size.w, centerFrame.size.h));
  layer_set_update_proc(infoLayer, draw_center_text);
  layer_add_child(shiftingLayer, infoLayer);

  // create ring layer
  ringLayer = layer_create(bounds);
  layer_set_update_proc(ringLayer, draw_ring_layer);
  layer_add_child(shiftingLayer, ringLayer);

  // subscribe to the unobstructed area events
  UnobstructedAreaHandlers handlers = {.change = onUnobstructedAreaChange,
                                       .did_change =
                                           onUnobstructedAreaDidChange};
  unobstructed_area_service_subscribe(handlers, NULL);

  // just in case quick view is open on load
  quickViewLayerReposition();

  // make sure the time is displayed from the start
  update_clock();
}

static void main_window_unload(Window *window) {
  // destroy everything
  weather_icon_deinit();
  layer_destroy(ringLayer);
  layer_destroy(infoLayer);
  layer_destroy(centerLayer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_clock();
}

#if defined(PBL_HEALTH)
static void health_handler(HealthEventType event, void *context) {
  if (event == HealthEventHeartRateUpdate) {
    update_clock();
  }
}
#endif

static void update_request_timer_callback(void *data);

static void schedule_next_update_request(uint32_t delay_ms) {
  if (s_update_request_timer) {
    app_timer_cancel(s_update_request_timer);
  }
  s_update_request_timer =
      app_timer_register(delay_ms, update_request_timer_callback, NULL);
}

static void update_request_timer_callback(void *data) {
  // Schedule the next normal-interval tick *first*, so that a sync outbox
  // failure inside messaging_request_update() can call on_request_failed()
  // and pull the next attempt forward without us clobbering it afterward.
  schedule_next_update_request(UPDATE_REQUEST_INTERVAL_MS);
  messaging_request_update();
}

static void on_request_failed(void) {
  schedule_next_update_request(UPDATE_REQUEST_RETRY_MS);
}

static void init() {
#ifdef FORCE_BACKLIGHT
  light_enable(true);
#endif

  // load those settings
  Settings_init();

  // init solar stuff
  solarUtils_init();

  // init the messaging thing
  messaging_init(onSettingsChanged, on_request_failed);

  // Create main Window element and assign to pointer
  mainWindow = window_create();

  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(
      mainWindow,
      (WindowHandlers){.load = main_window_load, .unload = main_window_unload});

  window_stack_push(mainWindow, true);

  // Register with TickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

#if defined(PBL_HEALTH)
  health_service_events_subscribe(health_handler, NULL);
#endif

  // Schedule initial update request with short delay to give PKJS time to start
  schedule_next_update_request(UPDATE_REQUEST_INITIAL_DELAY_MS);
}

static void deinit() {
  if (s_update_request_timer) {
    app_timer_cancel(s_update_request_timer);
  }
#if defined(PBL_HEALTH)
  health_service_events_unsubscribe();
#endif
  window_destroy(mainWindow);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
