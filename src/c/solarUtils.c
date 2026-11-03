#include "solarUtils.h"
#include <pebble.h>

SolarInfo currentSolarInfo = {
  .sunriseMinute = DEFAULT_SUNRISE_TIME,
  .sunsetMinute  = DEFAULT_SUNSET_TIME
};

void solarUtils_init() {
  if (persist_exists(SOLAR_DATA_KEY)) {
    persist_read_data(SOLAR_DATA_KEY, &currentSolarInfo, sizeof(SolarInfo));
  }
}

void solarUtils_setSolarMinutes(int sunrise, int sunset) {
  currentSolarInfo.sunriseMinute = sunrise;
  currentSolarInfo.sunsetMinute = sunset;
  persist_write_data(SOLAR_DATA_KEY, &currentSolarInfo, sizeof(SolarInfo));
}

void solarUtils_updateLocation(LocationInfo loc) {
  // Location is used by JS to compute solar data; persist it for reference
  if (loc.lat != 0 && loc.lng != 0) {
    persist_write_data(LOCATION_DATA_KEY, &loc, sizeof(LocationInfo));
  }
  // Sunrise/sunset calculations are now performed on the JS side.
  // The minutes are pushed back via WEATHER_SUNRISE_MINUTE / WEATHER_SUNSET_MINUTE
  // message keys and set directly into currentSolarInfo in messaging.c.
}

void solarUtils_recalculateSolarData() {
  // No-op: solar data now comes from JS.
  // Retained so call sites in main.c don't need changes.
}

bool isNightTime(int currentMinutes) {
  int sunrise = currentSolarInfo.sunriseMinute;
  int sunset = currentSolarInfo.sunsetMinute;

  // Sunset can come before sunrise (manual times, or a manual location far
  // from the phone's time zone), in which case daytime wraps past midnight.
  bool result = sunrise <= sunset
                    ? (currentMinutes >= sunset || currentMinutes < sunrise)
                    : (currentMinutes >= sunset && currentMinutes < sunrise);

  APP_LOG(APP_LOG_LEVEL_DEBUG,
          "isNightTime: current=%d, sunrise=%d, sunset=%d, result=%d",
          currentMinutes, currentSolarInfo.sunriseMinute,
          currentSolarInfo.sunsetMinute, result);

  return result;
}
