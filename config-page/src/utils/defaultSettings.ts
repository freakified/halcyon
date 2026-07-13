import { Settings, Capabilities } from '../context/types';

// Locales whose users expect Fahrenheit/MPH/inches by default.
// Kept narrow (US only) since it flips the whole imperial/metric bundle.
const IMPERIAL_LOCALE_REGEX = /^(en|es)-US\b/i;

const detectImperialLocale = (): boolean => {
  try {
    const locale = navigator.language || (navigator.languages && navigator.languages[0]);
    return !!locale && IMPERIAL_LOCALE_REGEX.test(locale);
  } catch {
    return false;
  }
};

export const getDefaultSettings = (capabilities: Capabilities): Settings => ({
  SETTING_THEME: '0',
  SETTING_NIGHT_THEME: '0',
  SETTING_TIME_COLOR: '000000',
  SETTING_SUBTEXT_PRIMARY_COLOR: '000000',
  SETTING_SUBTEXT_SECONDARY_COLOR: capabilities.BW ? '000000' : '555555',
  SETTING_BG_COLOR: capabilities.BW ? 'FFFFFF' : 'FFFFFF',
  SETTING_PIP_COLOR_PRIMARY: '000000',
  SETTING_PIP_COLOR_SECONDARY: capabilities.BW ? '000000' : 'AAAAAA',
  SETTING_RING_STROKE_COLOR: '000000',
  SETTING_RING_NIGHT_COLOR: capabilities.BW ? '000000' : '0055AA',
  SETTING_RING_DAY_COLOR: capabilities.BW ? 'FFFFFF' : '00AAFF',
  SETTING_RING_SUNRISE_COLOR: capabilities.BW ? 'AAAAAA' : 'FFAAAA',
  SETTING_RING_SUNSET_COLOR: capabilities.BW ? 'AAAAAA' : 'FFAA00',
  SETTING_SUN_STROKE_COLOR: '000000',
  SETTING_SUN_FILL_COLOR: capabilities.BW ? 'FFFFFF' : 'FFFF00',
  SETTING_NIGHT_TIME_COLOR: 'FFFFFF',
  SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR: 'FFFFFF',
  SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR: capabilities.BW ? 'FFFFFF' : 'AAAAFF',
  SETTING_NIGHT_BG_COLOR: capabilities.BW ? '000000' : '000055',
  SETTING_NIGHT_PIP_COLOR_PRIMARY: 'FFFFFF',
  SETTING_NIGHT_PIP_COLOR_SECONDARY: capabilities.BW ? 'FFFFFF' : '0055AA',
  SETTING_NIGHT_RING_STROKE_COLOR: '000000',
  SETTING_NIGHT_RING_NIGHT_COLOR: capabilities.BW ? '000000' : '0000AA',
  SETTING_NIGHT_RING_DAY_COLOR: capabilities.BW ? 'FFFFFF' : '00AAFF',
  SETTING_NIGHT_RING_SUNRISE_COLOR: capabilities.BW ? 'AAAAAA' : '0055FF',
  SETTING_NIGHT_RING_SUNSET_COLOR: capabilities.BW ? 'AAAAAA' : '0055FF',
  SETTING_NIGHT_SUN_STROKE_COLOR: '000000',
  SETTING_NIGHT_SUN_FILL_COLOR: capabilities.BW ? 'FFFFFF' : 'FFFFFF',
  SETTING_USE_LARGE_FONTS: 0,
  SETTING_USE_PRIMARY_WIDGET_FONT: 0,
  SETTING_USE_NIGHT_THEME: 1,
  SETTING_PIP_VISIBILITY: 0,
  SETTING_SHOW_LEADING_ZERO: 0,
  // Widget slots default to format strings
  SETTING_WIDGET_UPPER_SECONDARY: '{temp}° ({thi}°/{tlo}°)',
  SETTING_WIDGET_UPPER_PRIMARY: '{cond}',
  SETTING_WIDGET_LOWER_PRIMARY: '{local_date}',
  SETTING_WIDGET_LOWER_SECONDARY: capabilities.HEALTH ? '{steps} {t:STEPS}' : '{t:BATTERY} {batt}%',
  SETTING_TEMP_UNIT: detectImperialLocale() ? 1 : 0,
  SETTING_LANGUAGE: 0,
  SETTING_ALT_CITY: 'SAN FRANCISCO',
  SETTING_ALT_LABEL: 'SFO',
  SETTING_ALT_CITY2: 'UTC',
  SETTING_ALT_LABEL2: 'UTC',
});
