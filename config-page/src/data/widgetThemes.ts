// Widget presets: a format string for each of the four widget slots.
//
// The first preset is the default and is the default widgets themselves
// (utils/defaultSettings.ts), so a fresh install shows it selected.

import { Capabilities, Settings } from '../context/types';
import { getDefaultSettings } from '../utils/defaultSettings';
import { prepareThemes, Theme } from '../utils/themeUtils';

/** The widget slots, in the order they appear on the watch, top to bottom */
export const WIDGET_KEYS: (keyof Settings)[] = [
  'SETTING_WIDGET_UPPER_SECONDARY',
  'SETTING_WIDGET_UPPER_PRIMARY',
  'SETTING_WIDGET_LOWER_PRIMARY',
  'SETTING_WIDGET_LOWER_SECONDARY',
];

// Most presets build widgets of their own out of tokens, the way the
// widget selector's "Custom…" option does, so they show off what it can
// do. Words come from {t:...} tokens rather than literal text, so every
// preset reads right in every language. A slot holds 47 characters, and
// the watch stores what's left after the phone fills in its own tokens
// (weather, sun times, labels), so that has to fit too.
const NONE = '';
const DATE = '{local_date}';
const BATTERY = '{t:BATTERY} {batt}%';
const UV_INDEX = '{t:UV} {uv}';
const NEXT_SOLAR = '{next_solar}';
const SUN_TIMES = '{sunrise} / {sunset}';

const preset = (
  name: string,
  upperSecondary: string,
  upperPrimary: string,
  lowerPrimary: string,
  lowerSecondary: string,
): Theme => ({
  name,
  settings: {
    SETTING_WIDGET_UPPER_SECONDARY: upperSecondary,
    SETTING_WIDGET_UPPER_PRIMARY: upperPrimary,
    SETTING_WIDGET_LOWER_PRIMARY: lowerPrimary,
    SETTING_WIDGET_LOWER_SECONDARY: lowerSecondary,
  },
});

/** The widget preset list for this watch, default first */
export const getWidgetThemes = (capabilities: Capabilities): Theme[] => {
  const defaults = getDefaultSettings(capabilities);

  return prepareThemes(
    [
      preset(
        'Classic',
        defaults.SETTING_WIDGET_UPPER_SECONDARY,
        defaults.SETTING_WIDGET_UPPER_PRIMARY,
        defaults.SETTING_WIDGET_LOWER_PRIMARY,
        defaults.SETTING_WIDGET_LOWER_SECONDARY,
      ),
      preset('Minimal', NONE, NONE, DATE, NONE),
      preset('Sun Seeker', `${UV_INDEX} · {cond_day}`, NEXT_SOLAR, DATE, SUN_TIMES),
      preset(
        'Weather Station',
        `${UV_INDEX} · {hum}%`,
        '{temp}° {cond}',
        DATE,
        '{wind} {wind_unit} {wind_dir}',
      ),
      preset(
        'Beach Day',
        `{temp}° · ${UV_INDEX}`,
        NEXT_SOLAR,
        DATE,
        '{t:RAIN} {pop}% · {wind} {wind_unit}',
      ),
      ...(capabilities.HEALTH
        ? [
            preset(
              'Dashboard',
              BATTERY,
              '{steps} · {dist} {dist_unit}',
              DATE,
              capabilities.HRM ? `{hr} {t:BPM} · ${UV_INDEX}` : UV_INDEX,
            ),
          ]
        : []),
      preset('Almanac', '{t:WEEK} {week_of_year} {t:DAY} {day_of_year}', SUN_TIMES, DATE, '{year}'),
      preset(
        'Jet Lag',
        '{alt_tz2_label} {alt_tz2_time}',
        '{alt_tz_label} {alt_tz_time} {alt_tz_day}',
        DATE,
        NEXT_SOLAR,
      ),
    ],
    [],
    [],
  );
};
