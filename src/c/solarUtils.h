#pragma once

/*
 * Responsible for managing the sunrise/sunset calculation
 */

// default day times
#define DAY_END_MINUTE 1440
#define TWILIGHT_DURATION 30
#define SUNRISE_DURATION 60

// default sunrise at 6:00am, default sunset at 6:00pm:
#define DEFAULT_SUNRISE_TIME 360
#define DEFAULT_SUNSET_TIME 1080

// persistent storage
#define LOCATION_DATA_KEY 50

typedef struct {
  float lat;
  float lng;
  float tzOffset;
  time_t lastUpdatedTime;
} LocationInfo;

typedef struct {
  int sunsetMinute;
  int sunriseMinute;
} SolarInfo;

/*
 * Updates the location, causing the sunrise and sunset values
 * to recalculate.
 */
void solarUtils_updateLocation(LocationInfo loc);

/*
 * Recalculates sunrise/sunset times, returning them as a SolarInfo struct
 */
SolarInfo solarUtils_recalculateSolarData();