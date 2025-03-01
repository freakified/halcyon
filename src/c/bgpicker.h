#pragma once

/*
 * Responsible for background picture selection.
 * Based on sunrise and sunset times, splits the day into several "day parts",
 * each of which is associated with a background image.
 */

#include "location_info.h"

// default day times
#define DAY_END_MINUTE 1440
#define TWILIGHT_DURATION 30
#define SUNRISE_DURATION 60

// default sunrise at 6:00am, default sunset at 6:00pm:
#define DEFAULT_SUNRISE_TIME 360
#define DEFAULT_SUNSET_TIME 1080

// persistent storage
#define BGPICKER_LOC_KEY 1

static LocationInfo bgpicker_location;

/*
 * Sets up the set of 7 dayparts with their respective background images,
 * and times.
 */
void bgpicker_init();

/*
 * Deallocates the current backround image
 */
void bgpicker_destruct();

/*
 * Returns a GBitmap pointer to the current background image,
 * based on the specified time.
 */
// GBitmap* bgpicker_getCurrentBG(const struct tm* time);

/*
 * Updates the location, causing the sunrise and sunset values
 * to recalculate.
 */
void bgpicker_updateLocation(LocationInfo loc);

/*
 * Sets the sunrise and sunset times, causing all dayparts' start/end
 * times to be updated
 */
static void bgpicker_setSunriseSunset(int sunriseMinute, int sunsetMinute);
