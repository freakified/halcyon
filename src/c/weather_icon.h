#pragma once

#include <pebble.h>

#define WEATHER_ICON_TOKEN "{weather_icon}"
#define WEATHER_ICON_DAY_TOKEN "{weather_icon_day}"
#define WEATHER_ICON_SIZE 25

typedef enum {
  WEATHER_ICON_UNKNOWN = 0,
  WEATHER_ICON_CLEAR = 1,
  WEATHER_ICON_MOSTLY_CLEAR = 2,
  WEATHER_ICON_PARTLY_CLOUDY = 3,
  WEATHER_ICON_CLOUDY = 4,
  WEATHER_ICON_FOG = 5,
  WEATHER_ICON_DRIZZLE = 6,
  WEATHER_ICON_RAIN = 7,
  WEATHER_ICON_SNOW = 8,
  WEATHER_ICON_THUNDERSTORM = 9
} WeatherIcon;

void weather_icon_set_current(WeatherIcon icon);
void weather_icon_set_day(WeatherIcon icon);
WeatherIcon weather_icon_get_current(void);
WeatherIcon weather_icon_get_day(void);
bool weather_icon_draw(GContext *ctx, bool daily, GRect slot_bounds,
                       GColor foreground, GColor background);
void weather_icon_deinit(void);
