import { Capabilities, Settings } from '../context/types';
import { remapToDayKeys, remapToNightKeys } from '../hooks/useSavedThemes';
import { prepareThemes, Theme, ThemeKind, ThemeSettings } from './themeUtils';
import { getWidgetThemes, WIDGET_KEYS } from '../data/widgetThemes';
import lightThemes from '../data/light-themes.json';
import neutralThemes from '../data/neutral-themes.json';
import darkThemes from '../data/dark-themes.json';
import lightThemesBw from '../data/light-themes-bw.json';
import neutralThemesBw from '../data/neutral-themes-bw.json';
import darkThemesBw from '../data/dark-themes-bw.json';

/** Color setting keys for a day theme — the canonical saved format */
const DAY_COLOR_KEYS: (keyof Settings)[] = [
  'SETTING_TIME_COLOR',
  'SETTING_SUBTEXT_PRIMARY_COLOR',
  'SETTING_SUBTEXT_SECONDARY_COLOR',
  'SETTING_BG_COLOR',
  'SETTING_PIP_COLOR_PRIMARY',
  'SETTING_PIP_COLOR_SECONDARY',
  'SETTING_RING_STROKE_COLOR',
  'SETTING_RING_NIGHT_COLOR',
  'SETTING_RING_DAY_COLOR',
  'SETTING_RING_SUNRISE_COLOR',
  'SETTING_RING_SUNSET_COLOR',
  'SETTING_SUN_STROKE_COLOR',
  'SETTING_SUN_FILL_COLOR',
];

/** Night-mode equivalents of DAY_COLOR_KEYS, in the same order */
const NIGHT_COLOR_KEYS = DAY_COLOR_KEYS.map((key) => key.replace('SETTING_', 'SETTING_NIGHT_'));

/** The given keys picked out of raw settings, as strings; null if none are there */
const pickKeys = (
  raw: Record<string, unknown>,
  keys: string[],
  coerce: (value: string) => string = (value) => value
): ThemeSettings | null => {
  const settings: ThemeSettings = {};
  keys.filter((key) => key in raw).forEach((key) => {
    settings[key] = coerce(String(raw[key] ?? ''));
  });
  return Object.keys(settings).length > 0 ? settings : null;
};

const normalizeColor = (value: string) => value.replace('#', '').toUpperCase();

const dayColorThemes = (capabilities: Capabilities): Theme[] =>
  capabilities.BW
    ? prepareThemes(lightThemesBw, neutralThemesBw, darkThemesBw)
    : prepareThemes(lightThemes, neutralThemes, darkThemes);

// night presets lead with the dark themes
const nightColorThemes = (capabilities: Capabilities): Theme[] =>
  (capabilities.BW
    ? prepareThemes(darkThemesBw, neutralThemesBw, lightThemesBw)
    : prepareThemes(darkThemes, neutralThemes, lightThemes)
  ).map((theme) => ({ ...theme, settings: remapToNightKeys(theme.settings) as ThemeSettings }));

// Day and night color themes share one saved list, kept with day keys, so
// a theme saved from either picker shows up in both
export const DAY_COLOR_THEMES: ThemeKind = {
  selectionKey: 'SETTING_THEME',
  storageKey: 'halcyon-saved-themes',
  savedNamePrefix: 'Saved Theme',
  importTitle: 'Import Theme',
  presets: dayColorThemes,
  normalize: (raw) => pickKeys(raw, DAY_COLOR_KEYS, normalizeColor),
  toSaved: (settings) => settings,
  fromSaved: remapToDayKeys,
};

export const NIGHT_COLOR_THEMES: ThemeKind = {
  ...DAY_COLOR_THEMES,
  selectionKey: 'SETTING_NIGHT_THEME',
  presets: nightColorThemes,
  normalize: (raw) => pickKeys(raw, NIGHT_COLOR_KEYS, normalizeColor),
  toSaved: (settings) => remapToDayKeys(settings) as ThemeSettings,
  fromSaved: remapToNightKeys,
};

export const WIDGET_THEMES: ThemeKind = {
  selectionKey: 'SETTING_WIDGET_THEME',
  storageKey: 'halcyon-saved-widget-themes',
  savedNamePrefix: 'Saved Widgets',
  importTitle: 'Import Widgets',
  presets: getWidgetThemes,
  normalize: (raw) => pickKeys(raw, WIDGET_KEYS),
  toSaved: (settings) => settings,
  fromSaved: (settings) => settings,
};

export const THEME_KINDS = [DAY_COLOR_THEMES, NIGHT_COLOR_THEMES, WIDGET_THEMES];
