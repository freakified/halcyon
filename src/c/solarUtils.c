#include <pebble.h>
#include "solarUtils.h"
#include "sun_calc.h"

void solarUtils_updateLocation(LocationInfo loc) {
  // save the new location data to persistent storage
  persist_write_data(LOCATION_DATA_KEY, &loc, sizeof(LocationInfo));

  solarUtils_recalculateSolarData();
}

// Using the stored location OR the defaults, returns the sunrise and sunset
SolarInfo solarUtils_recalculateSolarData() {
  // if (persist_exists(LOCATION_DATA_KEY)) {
  if (false) {
    LocationInfo loc;
    persist_read_data(LOCATION_DATA_KEY, &loc, sizeof(LocationInfo));

    APP_LOG(APP_LOG_LEVEL_DEBUG,
            "Calculating with location: Lat: %d, Lng: %d, TZ: %d ",
            (int)(loc.lat * 100), (int)(loc.lng * 100),
            (int)(loc.tzOffset * 100));

    // determine what day it is, since we'll need this
    time_t rawTime;
    struct tm *timeInfo;
    time(&rawTime);
    timeInfo = localtime(&rawTime);

    // get the sunrise/sunset data
    float sunRiseTime, sunSetTime;
    int sunRiseMin, sunSetMin;

    APP_LOG(APP_LOG_LEVEL_DEBUG,
            "Params 1: Year: %d, Month: %d, Day: %d, Z: %d",
            (int)timeInfo->tm_year, (int)timeInfo->tm_mon,
            (int)timeInfo->tm_mday, (int)ZENITH_OFFICIAL);

    sunRiseTime =
        calcSunRise(timeInfo->tm_year, timeInfo->tm_mon + 1, timeInfo->tm_mday,
                    loc.lat, loc.lng, ZENITH_OFFICIAL);
    sunSetTime =
        calcSunSet(timeInfo->tm_year, timeInfo->tm_mon + 1, timeInfo->tm_mday,
                   loc.lat, loc.lng, ZENITH_OFFICIAL);

    APP_LOG(APP_LOG_LEVEL_DEBUG, "Sunrise Time Initial R: %d, S: %d",
            (int)(sunRiseTime * 100), (int)(sunSetTime * 100));

    sunRiseTime = adjustTimezone(sunRiseTime, loc.tzOffset);
    sunSetTime = adjustTimezone(sunSetTime, loc.tzOffset);

    // for some reason, we have to add/subtract 12 hours (720 minutes)
    sunRiseMin = (int)(sunRiseTime * 60) - 720;
    sunSetMin = (int)(sunSetTime * 60) + 720;

    APP_LOG(APP_LOG_LEVEL_DEBUG, "Sunrise Time Initial R: %d, S: %d",
            (int)(sunRiseTime * 100), (int)(sunSetTime * 100));

    APP_LOG(APP_LOG_LEVEL_DEBUG, "Sunrise recalculated! R: %d, S: %d",
            sunRiseMin, sunSetMin);

    SolarInfo solarInfo = {
      sunsetMinute : sunSetMin,
      sunriseMinute : sunRiseMin
    };
    return solarInfo;
  } else {
    // otherwise, just use the default data
    SolarInfo solarInfo = {
      sunsetMinute : DEFAULT_SUNSET_TIME,
      sunriseMinute : DEFAULT_SUNRISE_TIME
    };

    return solarInfo;
  }
}
