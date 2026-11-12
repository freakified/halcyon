#include "settings.h"
#include "solarUtils.h"
#include "solar_theme.h"
#include "utils.h"
#include "widgets.h"
#include <pebble.h>

Settings globalSettings;

static void populateStoredSettingsExtra(StoredSettingsExtra *storedSettingsExtra) {
  strncpy(storedSettingsExtra->altCityLabel, globalSettings.altCityLabel,
          ALT_CITY_LABEL_LEN);
  storedSettingsExtra->altCityLabel[ALT_CITY_LABEL_LEN - 1] = '\0';
  storedSettingsExtra->altCityUtcOffset = globalSettings.altCityUtcOffset;
  strncpy(storedSettingsExtra->altCity2Label, globalSettings.altCity2Label,
          ALT_CITY_LABEL_LEN);
  storedSettingsExtra->altCity2Label[ALT_CITY_LABEL_LEN - 1] = '\0';
  storedSettingsExtra->altCity2UtcOffset = globalSettings.altCity2UtcOffset;
  storedSettingsExtra->localUtcOffset = globalSettings.localUtcOffset;
  storedSettingsExtra->usePrimaryFontForAllWidgets =
      globalSettings.usePrimaryFontForAllWidgets;
  storedSettingsExtra->enableStatusBar = globalSettings.enableStatusBar;
  storedSettingsExtra->statusShowConnection =
      globalSettings.statusShowConnection;
}

void Settings_init() { Settings_loadFromStorage(); }

void Settings_deinit() { Settings_saveToStorage(); }

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

  // night theme colors
  globalSettings.nightTimeColor = DEFAULT_NIGHT_TIME_COLOR;
  globalSettings.nightSubtextPrimaryColor = DEFAULT_NIGHT_SUBTEXT_PRIMARY_COLOR;
  globalSettings.nightSubtextSecondaryColor =
      DEFAULT_NIGHT_SUBTEXT_SECONDARY_COLOR;
  globalSettings.nightBgColor = DEFAULT_NIGHT_BG_COLOR;
  globalSettings.nightPipColorPrimary = DEFAULT_NIGHT_PIP_COLOR_PRIMARY;
  globalSettings.nightPipColorSecondary = DEFAULT_NIGHT_PIP_COLOR_SECONDARY;
  globalSettings.nightRingStrokeColor = DEFAULT_NIGHT_RING_STROKE_COLOR;
  globalSettings.nightRingNightColor = DEFAULT_NIGHT_RING_NIGHT_COLOR;
  globalSettings.nightRingDayColor = DEFAULT_NIGHT_RING_DAY_COLOR;
  globalSettings.nightRingSunriseColor = DEFAULT_NIGHT_RING_SUNRISE_COLOR;
  globalSettings.nightRingSunsetColor = DEFAULT_NIGHT_RING_SUNSET_COLOR;
  globalSettings.nightSunStrokeColor = DEFAULT_NIGHT_SUN_STROKE_COLOR;
  globalSettings.nightSunFillColor = DEFAULT_NIGHT_SUN_FILL_COLOR;

  // various appearance settings
  globalSettings.useNightTheme = true;
  globalSettings.dynamicSolarTheme = persist_exists(SETTINGS_DYNAMIC_SOLAR_KEY)
      && persist_read_bool(SETTINGS_DYNAMIC_SOLAR_KEY);
  globalSettings.useLargeFonts = false;
  globalSettings.showLeadingZero = false;
  globalSettings.pipVisibility = PIP_SHOW_ALL;
  globalSettings.tempUnit = TEMP_UNIT_CELSIUS;
  globalSettings.language = 0;

  // widget slot defaults
  // Weather-dependent slots use placeholders until JS sends real data.
  // This prevents raw tokens like "{temp}°" from flashing on first run.
  strncpy(globalSettings.widgetUpperSecondary, "--° (--° / --°)",
          WIDGET_TEXT_LEN);
  strncpy(globalSettings.widgetUpperPrimary, "--", WIDGET_TEXT_LEN);
  // Lower-primary defaults to the {local_date} super-token; widgets.c expands
  // it at render time using the active language's idiomatic format.
  strncpy(globalSettings.widgetLowerPrimary, "{local_date}", WIDGET_TEXT_LEN);
#if defined(PBL_HEALTH)
  strncpy(globalSettings.widgetLowerSecondary, "{steps} {t:STEPS}",
          WIDGET_TEXT_LEN);
#else
  strncpy(globalSettings.widgetLowerSecondary, "{t:BATTERY} {batt}%",
          WIDGET_TEXT_LEN);
#endif
  strncpy(globalSettings.altCityLabel, "TYO", ALT_CITY_LABEL_LEN);
  globalSettings.altCityLabel[ALT_CITY_LABEL_LEN - 1] = '\0';
  globalSettings.altCityUtcOffset = 540;
  strncpy(globalSettings.altCity2Label, "UTC", ALT_CITY_LABEL_LEN);
  globalSettings.altCity2Label[ALT_CITY_LABEL_LEN - 1] = '\0';
  globalSettings.altCity2UtcOffset = 0;
  globalSettings.localUtcOffset = 0;
  globalSettings.usePrimaryFontForAllWidgets = false;
  globalSettings.enableStatusBar = true;
  globalSettings.statusShowConnection = false;

  if (persist_exists(SETTINGS_PERSIST_KEY)) {
    const int stored_size = persist_get_size(SETTINGS_PERSIST_KEY);
    if (stored_size > 0) {
      // Settings storage is append-only: defaults above cover fields that did
      // not exist in older persisted blobs.
      const int read_size = stored_size < (int)sizeof(StoredSettings)
                                ? stored_size
                                : (int)sizeof(StoredSettings);
      persist_read_data(SETTINGS_PERSIST_KEY, &globalSettings, read_size);
    }
  }

  if (persist_exists(SETTINGS_EXTRA_PERSIST_KEY)) {
    const int stored_size = persist_get_size(SETTINGS_EXTRA_PERSIST_KEY);
    if (stored_size > 0) {
      StoredSettingsExtra storedSettingsExtra;
      memset(&storedSettingsExtra, 0, sizeof(StoredSettingsExtra));
      populateStoredSettingsExtra(&storedSettingsExtra);
      const int read_size = stored_size < (int)sizeof(StoredSettingsExtra)
                                ? stored_size
                                : (int)sizeof(StoredSettingsExtra);
      persist_read_data(SETTINGS_EXTRA_PERSIST_KEY, &storedSettingsExtra,
                        read_size);

      strncpy(globalSettings.altCityLabel, storedSettingsExtra.altCityLabel,
              ALT_CITY_LABEL_LEN);
      globalSettings.altCityLabel[ALT_CITY_LABEL_LEN - 1] = '\0';
      globalSettings.altCityUtcOffset = storedSettingsExtra.altCityUtcOffset;
      strncpy(globalSettings.altCity2Label, storedSettingsExtra.altCity2Label,
              ALT_CITY_LABEL_LEN);
      globalSettings.altCity2Label[ALT_CITY_LABEL_LEN - 1] = '\0';
      globalSettings.altCity2UtcOffset = storedSettingsExtra.altCity2UtcOffset;
      globalSettings.localUtcOffset = storedSettingsExtra.localUtcOffset;
      globalSettings.usePrimaryFontForAllWidgets =
          storedSettingsExtra.usePrimaryFontForAllWidgets;
      globalSettings.enableStatusBar = storedSettingsExtra.enableStatusBar;
      globalSettings.statusShowConnection =
          storedSettingsExtra.statusShowConnection;
    }
  }

  Settings_updateDynamicSettings();
}

void Settings_saveToStorage() {
  Settings_updateDynamicSettings();
  StoredSettings storedSettings;
  memcpy(&storedSettings, &globalSettings, sizeof(StoredSettings));
  persist_write_data(SETTINGS_PERSIST_KEY, &storedSettings,
                     sizeof(StoredSettings));

  StoredSettingsExtra storedSettingsExtra;
  memset(&storedSettingsExtra, 0, sizeof(StoredSettingsExtra));
  populateStoredSettingsExtra(&storedSettingsExtra);
  persist_write_data(SETTINGS_EXTRA_PERSIST_KEY, &storedSettingsExtra,
                     sizeof(StoredSettingsExtra));

  persist_write_int(SETTINGS_VERSION_PERSIST_KEY, CURRENT_SETTINGS_VERSION);
  if (!persist_exists(SETTINGS_DYNAMIC_SOLAR_KEY) ||
      persist_read_bool(SETTINGS_DYNAMIC_SOLAR_KEY) != globalSettings.dynamicSolarTheme) {
    persist_write_bool(SETTINGS_DYNAMIC_SOLAR_KEY, globalSettings.dynamicSolarTheme);
  }
}

static int16_t get_local_utc_offset(void) {
  time_t now = time(NULL);
  struct tm local_time = *localtime(&now);
  struct tm utc_time = *gmtime(&now);

  int day_delta = local_time.tm_yday - utc_time.tm_yday;
  if (local_time.tm_year > utc_time.tm_year) {
    day_delta = 1;
  } else if (local_time.tm_year < utc_time.tm_year) {
    day_delta = -1;
  } else if (day_delta > 1) {
    day_delta = -1;
  } else if (day_delta < -1) {
    day_delta = 1;
  }

  return (int16_t)((day_delta * 24 + local_time.tm_hour - utc_time.tm_hour) *
                       60 +
                   local_time.tm_min - utc_time.tm_min);
}

void Settings_updateDynamicSettings() {
  globalSettings.localUtcOffset = get_local_utc_offset();
}

ColorTheme getCurrentColorTheme() {
  ColorTheme theme = {0};

  // Get current time in minutes since midnight
  struct tm *timeInfo = getCurrentTime();
  int currentMinutes = timeInfo->tm_hour * 60 + timeInfo->tm_min;

  bool useNight = globalSettings.useNightTheme && isNightTime(currentMinutes);
#ifdef PBL_COLOR
  SolarThemeState solar = {0};
  bool dynamic = globalSettings.dynamicSolarTheme && globalSettings.useNightTheme;
  if (dynamic) {
    solar = solar_theme_state(currentMinutes,
        currentSolarInfo.sunriseMinute, currentSolarInfo.sunsetMinute);
    useNight = solar.night;
    theme.solar = solar;
  }
#endif

  if (useNight) {
    theme.timeColor = globalSettings.nightTimeColor;
    theme.subtextPrimaryColor = globalSettings.nightSubtextPrimaryColor;
    theme.subtextSecondaryColor = globalSettings.nightSubtextSecondaryColor;
    theme.bgColor = globalSettings.nightBgColor;
    theme.pipColorPrimary = globalSettings.nightPipColorPrimary;
    theme.pipColorSecondary = globalSettings.nightPipColorSecondary;
    theme.ringStrokeColor = globalSettings.nightRingStrokeColor;
    theme.ringNightColor = globalSettings.nightRingNightColor;
    theme.ringDayColor = globalSettings.nightRingDayColor;
    theme.ringSunriseColor = globalSettings.nightRingSunriseColor;
    theme.ringSunsetColor = globalSettings.nightRingSunsetColor;
    theme.sunStrokeColor = globalSettings.nightSunStrokeColor;
    theme.sunFillColor = globalSettings.nightSunFillColor;
  } else {
    theme.timeColor = globalSettings.timeColor;
    theme.subtextPrimaryColor = globalSettings.subtextPrimaryColor;
    theme.subtextSecondaryColor = globalSettings.subtextSecondaryColor;
    theme.bgColor = globalSettings.bgColor;
    theme.pipColorPrimary = globalSettings.pipColorPrimary;
    theme.pipColorSecondary = globalSettings.pipColorSecondary;
    theme.ringStrokeColor = globalSettings.ringStrokeColor;
    theme.ringNightColor = globalSettings.ringNightColor;
    theme.ringDayColor = globalSettings.ringDayColor;
    theme.ringSunriseColor = globalSettings.ringSunriseColor;
    theme.ringSunsetColor = globalSettings.ringSunsetColor;
    theme.sunStrokeColor = globalSettings.sunStrokeColor;
    theme.sunFillColor = globalSettings.sunFillColor;
  }

#ifdef PBL_COLOR
  if (dynamic && solar.event) {
    SolarRingPalette day = {globalSettings.ringNightColor.argb,
        globalSettings.ringDayColor.argb, globalSettings.ringSunriseColor.argb,
        globalSettings.ringSunsetColor.argb};
    SolarRingPalette night = {globalSettings.nightRingNightColor.argb,
        globalSettings.nightRingDayColor.argb, globalSettings.nightRingSunriseColor.argb,
        globalSettings.nightRingSunsetColor.argb};
    SolarRingPalette ring = solar_theme_ring(solar, day, night);
    theme.ringNightColor.argb = ring.night;
    theme.ringDayColor.argb = ring.day;
    theme.ringSunriseColor.argb = ring.sunrise;
    theme.ringSunsetColor.argb = ring.sunset;

    int dayWeight = solar_theme_day_weight(solar);
#define BLEND(field, nightField) \
    theme.field.argb = solar_theme_blend(globalSettings.nightField.argb, \
        globalSettings.field.argb, dayWeight)
    BLEND(ringStrokeColor, nightRingStrokeColor);
    BLEND(sunFillColor, nightSunFillColor);
    BLEND(sunStrokeColor, nightSunStrokeColor);
#undef BLEND
    theme.bgColor = getSolarBackgroundColor(&theme, 0);
    GColor edge = getSolarBackgroundColor(&theme, 256);
#define READABLE(field, nightField, bg) \
    theme.field.argb = solar_theme_readable(globalSettings.field.argb, \
        globalSettings.nightField.argb, bg.argb)
    READABLE(timeColor, nightTimeColor, theme.bgColor);
    READABLE(subtextPrimaryColor, nightSubtextPrimaryColor, theme.bgColor);
    READABLE(subtextSecondaryColor, nightSubtextSecondaryColor, theme.bgColor);
    READABLE(pipColorPrimary, nightPipColorPrimary, edge);
    READABLE(pipColorSecondary, nightPipColorSecondary, edge);
#undef READABLE
  }
#endif
  return theme;
}

GColor getSolarBackgroundColor(const ColorTheme *theme, int radius) {
#ifdef PBL_COLOR
  if (theme->solar.event) {
    return (GColor){.argb = solar_theme_blend(globalSettings.nightBgColor.argb,
        globalSettings.bgColor.argb, solar_theme_background_weight(theme->solar, radius))};
  }
#endif
  return theme->bgColor;
}
