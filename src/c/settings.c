#include <pebble.h>
#include "settings.h"

Settings globalSettings;

void Settings_init() {
  Settings_loadFromStorage();
}

void Settings_deinit() {
  Settings_saveToStorage();
}

void Settings_loadFromStorage() {
  // set all the defaults!
  // text colors
  globalSettings.timeColor = DEFAULT_TIME_COLOR;
  globalSettings.subtextPrimaryColor = DEFAULT_SUBTEXT_PRIMARY_COLOR;
  globalSettings.subtextSecondaryColor = DEFAULT_SUBTEXT_SECONDARY_COLOR;

  // decoration colors
  globalSettings.bgColor = DEFAULT_BG_COLOR;
  globalSettings.pipColorPrimary = DEFAULT_PIP_COLOR_PRIMARY;
  globalSettings.pipColorSecondary = DEFAULT_PIP_COLOR_SECONDARY;
  globalSettings.ringStrokeColor = DEFAULT_RING_STROKE_COLOR;
  globalSettings.ringNightColor = DEFAULT_RING_NIGHT_COLOR;
  globalSettings.ringDayColor = DEFAULT_RING_DAY_COLOR;
  globalSettings.ringSunriseColor = DEFAULT_RING_SUNRISE_COLOR;
  globalSettings.ringSunsetColor = DEFAULT_RING_SUNSET_COLOR;
  globalSettings.sunStrokeColor = DEFAULT_SUN_STROKE_COLOR;
  globalSettings.sunFillColor = DEFAULT_SUN_FILL_COLOR;

  // metrics
  globalSettings.useLargeFonts = false;

  // globalSettings.widgets[0] = PBL_IF_HEALTH_ELSE(HEALTH, BATTERY_METER);
  // globalSettings.widgets[1] = EMPTY;
  // globalSettings.widgets[2] = DATE;

  // globalSettings.activateDisconnectIcon = true;
  // strncpy(globalSettings.altclockName, "ALT", sizeof(globalSettings.altclockName));
  // globalSettings.decimalSeparator = '.';
  // globalSettings.showBatteryPct = true;

  if (persist_exists(SETTINGS_PERSIST_KEY)) {
    StoredSettings storedSettings;
    persist_read_data(SETTINGS_PERSIST_KEY, &storedSettings, sizeof(StoredSettings));
    memcpy(&globalSettings, &storedSettings, sizeof(StoredSettings));
  }

  Settings_updateDynamicSettings();
}

void Settings_saveToStorage() {
  Settings_updateDynamicSettings();
  StoredSettings storedSettings;
  memcpy(&storedSettings, &globalSettings, sizeof(StoredSettings));
  persist_write_data(SETTINGS_PERSIST_KEY, &storedSettings, sizeof(StoredSettings));
  persist_write_int(SETTINGS_VERSION_PERSIST_KEY, CURRENT_SETTINGS_VERSION);
}

void Settings_updateDynamicSettings() {
  // there are none right now but we'll get back to that.
//   globalSettings.disableWeather = true;
//   globalSettings.updateScreenEverySecond = false;
//   globalSettings.enableAutoBatteryWidget = true;
//   globalSettings.enableBeats = false;
//   globalSettings.enableAltTimeZone = false;

//   for(int i = 0; i < 3; i++) {
//     // if there are any weather widgets, enable weather checking
//     // if(globalSettings.widgets[i] == WEATHER_CURRENT ||
//     //    globalSettings.widgets[i] == WEATHER_FORECAST_TODAY) {
//     if(globalSettings.widgets[i] == WEATHER_CURRENT) {
//       globalSettings.disableWeather = false;
//     }

//     // if any widget is "seconds", we'll need to update the sidebar every second
//     if(globalSettings.widgets[i] == SECONDS) {
//       globalSettings.updateScreenEverySecond = true;
//     }

//     // if any widget is "battery", disable the automatic battery indication
//     if(globalSettings.widgets[i] == BATTERY_METER) {
//       globalSettings.enableAutoBatteryWidget = false;
//     }

//     // if any widget is "beats", enable the beats calculation
//     if(globalSettings.widgets[i] == BEATS) {
//       globalSettings.enableBeats = true;
//     }

//     // if any widget is "alt_time_zone", enable the alternative time calculation
//     if(globalSettings.widgets[i] == ALT_TIME_ZONE) {
//       globalSettings.enableAltTimeZone = true;
//     }
//   }

//   // temp: if the sidebar is black, use inverted colors for icons
//   if(gcolor_equal(globalSettings.sidebarColor, GColorBlack)) {
//     globalSettings.iconFillColor = GColorBlack;
//     globalSettings.iconStrokeColor = globalSettings.sidebarTextColor; // exciting
//   } else {
//     globalSettings.iconFillColor = GColorWhite;
//     globalSettings.iconStrokeColor = GColorBlack;
//   }
}
