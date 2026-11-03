#include "messaging.h"
#include "settings.h"
#include "solarUtils.h"
#include "weather_icon.h"
#include <pebble.h>

void (*message_processed_callback)(void);
void (*request_failed_callback)(void);

void messaging_init(void (*processed_callback)(void),
                    void (*failed_callback)(void)) {
  message_processed_callback = processed_callback;
  request_failed_callback = failed_callback;

  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  app_message_open(768, 64);
}

void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // Process configuration data
  Tuple *timeColor_tuple = dict_find(iterator, MESSAGE_KEY_SETTING_TIME_COLOR);
  Tuple *subTextPrimaryColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_SUBTEXT_PRIMARY_COLOR);
  Tuple *subTextSecondaryColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_SUBTEXT_SECONDARY_COLOR);
  Tuple *bgColor_tuple = dict_find(iterator, MESSAGE_KEY_SETTING_BG_COLOR);
  Tuple *pipColorPrimary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_PIP_COLOR_PRIMARY);
  Tuple *pipColorSecondary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_PIP_COLOR_SECONDARY);
  Tuple *ringStrokeColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_RING_STROKE_COLOR);
  Tuple *ringNightColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_RING_NIGHT_COLOR);
  Tuple *ringDayColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_RING_DAY_COLOR);
  Tuple *ringSunriseColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_RING_SUNRISE_COLOR);
  Tuple *ringSunsetColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_RING_SUNSET_COLOR);
  Tuple *sunStrokeColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_SUN_STROKE_COLOR);
  Tuple *sunFillColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_SUN_FILL_COLOR);

  // night theme colors
  Tuple *nightTimeColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_TIME_COLOR);
  Tuple *nightSubTextPrimaryColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR);
  Tuple *nightSubTextSecondaryColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR);
  Tuple *nightBgColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_BG_COLOR);
  Tuple *nightPipColorPrimary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_PIP_COLOR_PRIMARY);
  Tuple *nightPipColorSecondary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_PIP_COLOR_SECONDARY);
  Tuple *nightRingStrokeColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_RING_STROKE_COLOR);
  Tuple *nightRingNightColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_RING_NIGHT_COLOR);
  Tuple *nightRingDayColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_RING_DAY_COLOR);
  Tuple *nightRingSunriseColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_RING_SUNRISE_COLOR);
  Tuple *nightRingSunsetColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_RING_SUNSET_COLOR);
  Tuple *nightSunStrokeColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_SUN_STROKE_COLOR);
  Tuple *nightSunFillColor_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_NIGHT_SUN_FILL_COLOR);

  Tuple *useNightTheme_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_USE_NIGHT_THEME);

  Tuple *useLargeFonts_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_USE_LARGE_FONTS);

  Tuple *usePrimaryFontForAllWidgets_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_USE_PRIMARY_WIDGET_FONT);

  Tuple *showLeadingZero_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_SHOW_LEADING_ZERO);

  Tuple *pipVisibility_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_PIP_VISIBILITY);

  Tuple *widgetUpperSecondary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_WIDGET_UPPER_SECONDARY);
  Tuple *widgetUpperPrimary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_WIDGET_UPPER_PRIMARY);
  Tuple *widgetLowerPrimary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_WIDGET_LOWER_PRIMARY);
  Tuple *widgetLowerSecondary_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_WIDGET_LOWER_SECONDARY);

  Tuple *weatherSunriseMinute_tuple =
      dict_find(iterator, MESSAGE_KEY_WEATHER_SUNRISE_MINUTE);
  Tuple *weatherSunsetMinute_tuple =
      dict_find(iterator, MESSAGE_KEY_WEATHER_SUNSET_MINUTE);
  Tuple *weatherIconCurrent_tuple =
      dict_find(iterator, MESSAGE_KEY_WEATHER_ICON_CURRENT);
  Tuple *weatherIconDay_tuple =
      dict_find(iterator, MESSAGE_KEY_WEATHER_ICON_DAY);
  Tuple *tempUnit_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_TEMP_UNIT);
  Tuple *language_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_LANGUAGE);
  Tuple *altCityLabel_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_ALT_CITY_LABEL);
  Tuple *altCityUtcOffset_tuple =
      dict_find(iterator, MESSAGE_KEY_ALT_CITY_UTC_OFFSET);
  Tuple *altCity2Label_tuple =
      dict_find(iterator, MESSAGE_KEY_SETTING_ALT_CITY2_LABEL);
  Tuple *altCity2UtcOffset_tuple =
      dict_find(iterator, MESSAGE_KEY_ALT_CITY2_UTC_OFFSET);
  Tuple *localUtcOffset_tuple =
      dict_find(iterator, MESSAGE_KEY_LOCAL_UTC_OFFSET);

  if (timeColor_tuple != NULL) {
    globalSettings.timeColor = GColorFromHEX(timeColor_tuple->value->int32);
  }

  if (subTextPrimaryColor_tuple != NULL) {
    globalSettings.subtextPrimaryColor =
        GColorFromHEX(subTextPrimaryColor_tuple->value->int32);
  }

  if (subTextSecondaryColor_tuple != NULL) {
    globalSettings.subtextSecondaryColor =
        GColorFromHEX(subTextSecondaryColor_tuple->value->int32);
  }

  if (bgColor_tuple != NULL) {
    globalSettings.bgColor = GColorFromHEX(bgColor_tuple->value->int32);
  }

  if (pipColorPrimary_tuple != NULL) {
    globalSettings.pipColorPrimary =
        GColorFromHEX(pipColorPrimary_tuple->value->int32);
  }

  if (pipColorSecondary_tuple != NULL) {
    globalSettings.pipColorSecondary =
        GColorFromHEX(pipColorSecondary_tuple->value->int32);
  }

  if (ringStrokeColor_tuple != NULL) {
    globalSettings.ringStrokeColor =
        GColorFromHEX(ringStrokeColor_tuple->value->int32);
  }

  if (ringNightColor_tuple != NULL) {
    globalSettings.ringNightColor =
        GColorFromHEX(ringNightColor_tuple->value->int32);
  }

  if (ringDayColor_tuple != NULL) {
    globalSettings.ringDayColor =
        GColorFromHEX(ringDayColor_tuple->value->int32);
  }

  if (ringSunriseColor_tuple != NULL) {
    globalSettings.ringSunriseColor =
        GColorFromHEX(ringSunriseColor_tuple->value->int32);
  }

  if (ringSunsetColor_tuple != NULL) {
    globalSettings.ringSunsetColor =
        GColorFromHEX(ringSunsetColor_tuple->value->int32);
  }

  if (sunStrokeColor_tuple != NULL) {
    globalSettings.sunStrokeColor =
        GColorFromHEX(sunStrokeColor_tuple->value->int32);
  }

  if (sunFillColor_tuple != NULL) {
    globalSettings.sunFillColor =
        GColorFromHEX(sunFillColor_tuple->value->int32);
  }

  // night theme colors
  if (nightTimeColor_tuple != NULL) {
    globalSettings.nightTimeColor =
        GColorFromHEX(nightTimeColor_tuple->value->int32);
  }

  if (nightSubTextPrimaryColor_tuple != NULL) {
    globalSettings.nightSubtextPrimaryColor =
        GColorFromHEX(nightSubTextPrimaryColor_tuple->value->int32);
  }

  if (nightSubTextSecondaryColor_tuple != NULL) {
    globalSettings.nightSubtextSecondaryColor =
        GColorFromHEX(nightSubTextSecondaryColor_tuple->value->int32);
  }

  if (nightBgColor_tuple != NULL) {
    globalSettings.nightBgColor =
        GColorFromHEX(nightBgColor_tuple->value->int32);
  }

  if (nightPipColorPrimary_tuple != NULL) {
    globalSettings.nightPipColorPrimary =
        GColorFromHEX(nightPipColorPrimary_tuple->value->int32);
  }

  if (nightPipColorSecondary_tuple != NULL) {
    globalSettings.nightPipColorSecondary =
        GColorFromHEX(nightPipColorSecondary_tuple->value->int32);
  }

  if (nightRingStrokeColor_tuple != NULL) {
    globalSettings.nightRingStrokeColor =
        GColorFromHEX(nightRingStrokeColor_tuple->value->int32);
  }

  if (nightRingNightColor_tuple != NULL) {
    globalSettings.nightRingNightColor =
        GColorFromHEX(nightRingNightColor_tuple->value->int32);
  }

  if (nightRingDayColor_tuple != NULL) {
    globalSettings.nightRingDayColor =
        GColorFromHEX(nightRingDayColor_tuple->value->int32);
  }

  if (nightRingSunriseColor_tuple != NULL) {
    globalSettings.nightRingSunriseColor =
        GColorFromHEX(nightRingSunriseColor_tuple->value->int32);
  }

  if (nightRingSunsetColor_tuple != NULL) {
    globalSettings.nightRingSunsetColor =
        GColorFromHEX(nightRingSunsetColor_tuple->value->int32);
  }

  if (nightSunStrokeColor_tuple != NULL) {
    globalSettings.nightSunStrokeColor =
        GColorFromHEX(nightSunStrokeColor_tuple->value->int32);
  }

  if (nightSunFillColor_tuple != NULL) {
    globalSettings.nightSunFillColor =
        GColorFromHEX(nightSunFillColor_tuple->value->int32);
  }

  if (useLargeFonts_tuple != NULL) {
    globalSettings.useLargeFonts = (bool)useLargeFonts_tuple->value->int8;
  }

  if (usePrimaryFontForAllWidgets_tuple != NULL) {
    globalSettings.usePrimaryFontForAllWidgets =
        (bool)usePrimaryFontForAllWidgets_tuple->value->int8;
  }

  if (useNightTheme_tuple != NULL) {
    globalSettings.useNightTheme = (bool)useNightTheme_tuple->value->int8;
  }

  if (pipVisibility_tuple != NULL) {
    APP_LOG(APP_LOG_LEVEL_INFO, "Received pipVisibility: %d",
            (int)pipVisibility_tuple->value->int8);
    globalSettings.pipVisibility =
        (PipVisibilityType)pipVisibility_tuple->value->int8;
  }

  if (showLeadingZero_tuple != NULL) {
    globalSettings.showLeadingZero = (bool)showLeadingZero_tuple->value->int8;
  }

  if (widgetUpperSecondary_tuple != NULL) {
    strncpy(globalSettings.widgetUpperSecondary,
            widgetUpperSecondary_tuple->value->cstring, WIDGET_TEXT_LEN);
    globalSettings.widgetUpperSecondary[WIDGET_TEXT_LEN - 1] = '\0';
  }
  if (widgetUpperPrimary_tuple != NULL) {
    strncpy(globalSettings.widgetUpperPrimary,
            widgetUpperPrimary_tuple->value->cstring, WIDGET_TEXT_LEN);
    globalSettings.widgetUpperPrimary[WIDGET_TEXT_LEN - 1] = '\0';
  }
  if (widgetLowerPrimary_tuple != NULL) {
    strncpy(globalSettings.widgetLowerPrimary,
            widgetLowerPrimary_tuple->value->cstring, WIDGET_TEXT_LEN);
    globalSettings.widgetLowerPrimary[WIDGET_TEXT_LEN - 1] = '\0';
  }
  if (widgetLowerSecondary_tuple != NULL) {
    strncpy(globalSettings.widgetLowerSecondary,
            widgetLowerSecondary_tuple->value->cstring, WIDGET_TEXT_LEN);
    globalSettings.widgetLowerSecondary[WIDGET_TEXT_LEN - 1] = '\0';
  }

  if (weatherSunriseMinute_tuple != NULL) {
    solarUtils_setSolarMinutes((int)weatherSunriseMinute_tuple->value->int32,
                               currentSolarInfo.sunsetMinute);
  }

  if (weatherSunsetMinute_tuple != NULL) {
    solarUtils_setSolarMinutes(currentSolarInfo.sunriseMinute,
                               (int)weatherSunsetMinute_tuple->value->int32);
  }

  if (weatherIconCurrent_tuple != NULL) {
    weather_icon_set_current(
        (WeatherIcon)weatherIconCurrent_tuple->value->int8);
  }

  if (weatherIconDay_tuple != NULL) {
    weather_icon_set_day((WeatherIcon)weatherIconDay_tuple->value->int8);
  }

  if (tempUnit_tuple != NULL) {
    globalSettings.tempUnit = (TempUnitType)tempUnit_tuple->value->int8;
  }

  if (language_tuple != NULL) {
    globalSettings.language = (uint8_t)language_tuple->value->int8;
  }

  if (altCityLabel_tuple != NULL) {
    strncpy(globalSettings.altCityLabel, altCityLabel_tuple->value->cstring,
            ALT_CITY_LABEL_LEN);
    globalSettings.altCityLabel[ALT_CITY_LABEL_LEN - 1] = '\0';
  }

  if (altCityUtcOffset_tuple != NULL) {
    globalSettings.altCityUtcOffset =
        (int16_t)altCityUtcOffset_tuple->value->int32;
  }

  if (altCity2Label_tuple != NULL) {
    strncpy(globalSettings.altCity2Label, altCity2Label_tuple->value->cstring,
            ALT_CITY_LABEL_LEN);
    globalSettings.altCity2Label[ALT_CITY_LABEL_LEN - 1] = '\0';
  }

  if (altCity2UtcOffset_tuple != NULL) {
    globalSettings.altCity2UtcOffset =
        (int16_t)altCity2UtcOffset_tuple->value->int32;
  }

  if (localUtcOffset_tuple != NULL) {
    globalSettings.localUtcOffset =
        (int16_t)localUtcOffset_tuple->value->int32;
  }

  Settings_saveToStorage();

  message_processed_callback();
}

void inbox_dropped_callback(AppMessageResult reason, void *context) {
  // APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

void outbox_failed_callback(DictionaryIterator *iterator,
                            AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed: %d", (int)reason);
  // The watch only ever sends REQUEST_UPDATE via the outbox, so any failure
  // here means the heartbeat didn't reach the phone — ask main to retry soon.
  if (request_failed_callback) request_failed_callback();
}

void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  // APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

void messaging_request_update() {
  DictionaryIterator *iter;
  AppMessageResult result = app_message_outbox_begin(&iter);

  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Failed to begin outbox: %d", (int)result);
    if (request_failed_callback) request_failed_callback();
    return;
  }

  dict_write_int8(iter, MESSAGE_KEY_REQUEST_UPDATE, 1);
  dict_write_int8(iter, MESSAGE_KEY_WATCH_IS_24H,
                  clock_is_24h_style() ? 1 : 0);

  result = app_message_outbox_send();
  if (result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Failed to send outbox: %d", (int)result);
    if (request_failed_callback) request_failed_callback();
  }
}
