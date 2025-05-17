#pragma once
#include <pebble.h>

#define CURRENT_SETTINGS_VERSION 1
#define SETTINGS_VERSION_PERSIST_KEY 1
#define SETTINGS_PERSIST_KEY 2

// default settings
#ifdef PBL_COLOR
  #define DEFAULT_TIME_COLOR              GColorBlack;
  #define DEFAULT_SUBTEXT_PRIMARY_COLOR   GColorBlack;
  #define DEFAULT_SUBTEXT_SECONDARY_COLOR GColorDarkGray;
  #define DEFAULT_BG_COLOR                GColorWhite;
  #define DEFAULT_PIP_COLOR_PRIMARY       GColorBlack;
  #define DEFAULT_PIP_COLOR_SECONDARY     GColorLightGray;
  #define DEFAULT_RING_STROKE_COLOR       GColorBlack;
  #define DEFAULT_RING_NIGHT_COLOR        GColorCobaltBlue;
  #define DEFAULT_RING_DAY_COLOR          GColorVividCerulean;
  #define DEFAULT_RING_SUNRISE_COLOR      GColorMelon;
  #define DEFAULT_RING_SUNSET_COLOR       GColorChromeYellow;
  #define DEFAULT_SUN_STROKE_COLOR        GColorBlack;
  #define DEFAULT_SUN_FILL_COLOR          GColorYellow;
#else
  #define DEFAULT_TIME_COLOR              GColorBlack;
  #define DEFAULT_SUBTEXT_PRIMARY_COLOR   GColorBlack;
  #define DEFAULT_SUBTEXT_SECONDARY_COLOR GColorBlack;
  #define DEFAULT_BG_COLOR                GColorWhite;
  #define DEFAULT_PIP_COLOR_PRIMARY       GColorBlack;
  #define DEFAULT_PIP_COLOR_SECONDARY     GColorBlack;
  #define DEFAULT_RING_STROKE_COLOR       GColorBlack;
  #define DEFAULT_RING_NIGHT_COLOR        GColorBlack;
  #define DEFAULT_RING_DAY_COLOR          GColorWhite;
  #define DEFAULT_RING_SUNRISE_COLOR      GColorLightGray;
  #define DEFAULT_RING_SUNSET_COLOR       GColorLightGray;
  #define DEFAULT_SUN_STROKE_COLOR        GColorBlack;
  #define DEFAULT_SUN_FILL_COLOR          GColorWhite;
#endif

// default settings, black and white

// typedef enum {
//   NO_VIBE = 0,
//   VIBE_EVERY_HOUR = 1,
//   VIBE_EVERY_HALF_HOUR = 2
// } VibeIntervalType;

typedef struct {
  // text colors
  GColor timeColor;
  GColor subtextPrimaryColor;
  GColor subtextSecondaryColor;

  // decoration colors
  GColor bgColor;
  GColor pipColorPrimary;
  GColor pipColorSecondary;
  GColor ringStrokeColor;
  GColor ringNightColor;
  GColor ringDayColor;
  GColor ringSunriseColor;
  GColor ringSunsetColor;
  GColor sunStrokeColor;
  GColor sunFillColor;

  bool useLargeFonts;

  // // general settings
  // uint8_t languageId;
  // bool showLeadingZero;
  // uint8_t clockFontId;

  // // vibration settings
  // bool btVibe;
  // VibeIntervalType hourlyVibe;

  // // sidebar settings
  // SidebarWidgetType widgets[3];
  // bool sidebarOnLeft;
  // bool useLargeFonts;
  // bool activateDisconnectIcon;
  
  // // weather widget settings
  // bool useMetric;

  // // battery meter widget settings
  // bool showBatteryPct;
  // bool disableAutobattery;

  // // alt tz widget settings
  // char altclockName[8];
  // int altclockOffset;

  // // health widget Settings
  // bool healthUseDistance;
  // bool healthUseRestfulSleep;
  // char decimalSeparator;

  // // dynamic settings (calculated based the currently-selected widgets)
  // bool disableWeather;
  // bool updateScreenEverySecond;
  // bool enableAutoBatteryWidget;
  // bool enableBeats;
  // bool enableAltTimeZone;

  // GColor iconFillColor;
  // GColor iconStrokeColor;
} Settings;


// !! all future settings should be added to the bottom of this structure
// !! do not remove fields from this structure, it will lead to unexpected behaviour
typedef struct {
  // text colors
  GColor timeColor;
  GColor subtextPrimaryColor;
  GColor subtextSecondaryColor;

  // decoration colors
  GColor bgColor;
  GColor pipColorPrimary;
  GColor pipColorSecondary;
  GColor ringStrokeColor;
  GColor ringNightColor;
  GColor ringDayColor;
  GColor ringSunriseColor;
  GColor ringSunsetColor;
  GColor sunStrokeColor;
  GColor sunFillColor;

  uint8_t useLargeFonts:1;
  
  // other appearance settings
  // uint8_t timeShowLeadingZero:1;

  // vibration settings
  // uint8_t btVibe:1;
  // int8_t hourlyVibe:7;

  // // battery meter widget settings
  // uint8_t showBatteryPct:1;
  // uint8_t disableAutobattery:1;

  // // health widget Settings
  // uint8_t healthUseDistance:1;

  // // alt tz widget settings
  // char altclockName[8];
  // int8_t altclockOffset;

  // // bluetooth disconnection icon
  // int8_t activateDisconnectIcon:1;
} StoredSettings;

extern Settings globalSettings;

void Settings_init();
void Settings_deinit();
void Settings_loadFromStorage();
void Settings_saveToStorage();
void Settings_updateDynamicSettings();
