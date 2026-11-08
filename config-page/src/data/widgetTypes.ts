// Widget type definitions — shared between the config page Select dropdowns
// and the WatchPreview component. Previews are computed at render time so they
// reflect the user's selected language.

import { Capabilities } from '../context/types';
import { renderPreview } from './i18nPreview';

export interface WidgetOption {
  value: string;
  label: string;
  preview: string;
  category?: string;
}

/** Anything only offered on watches with a given capability */
interface RequiresCapability {
  /** Only offer this on watches with this capability */
  requires?: keyof Capabilities;
}

export const isAvailable = (item: RequiresCapability, capabilities: Capabilities): boolean =>
  !item.requires || !!capabilities[item.requires];

export interface WidgetToken extends RequiresCapability {
  token: string;
  label: string;
  category: string;
}

export type WidgetTokenId = string;

interface WidgetOptionTemplate extends RequiresCapability {
  value: string;
  label: string;
  category?: string;
}

/**
 * The built-in widgets' format strings, by name. The widget selector lists
 * these; presets and defaults build on them too, so they stay in step.
 */
export const WIDGETS = {
  NONE: '',
  // Date/time
  DATE: '{local_date}',
  ALT_TZ: '{alt_tz}',
  ALT_TZ2: '{alt_tz2}',
  NUMERIC_DATE: '{year}-{month_num}-{day0}',
  DAY_NUMBER: '{t:DAY} {day_of_year}',
  WEEK_NUMBER: '{t:WEEK} {week_of_year}',
  YEAR: '{year}',
  // Solar
  NEXT_SOLAR: '{next_solar}',
  // Health
  STEPS: '{steps} {t:STEPS}',
  DISTANCE: '{dist} {dist_unit}',
  HEART_RATE: '{hr} {t:BPM}',
  // Device
  BATTERY: '{t:BATTERY} {batt}%',
  ALARM: '{alarm}',
  // Weather
  FORECAST: '{temp}° ({thi}°/{tlo}°)',
  CONDITION: '{cond}',
  HUMIDITY: '{hum}% {t:HUMIDITY}',
  WIND: '{wind} {wind_unit} {wind_dir}',
  UV_INDEX: '{t:UV} {uv}',
  DEW_POINT: '{t:DPT} {dew}°',
  RAIN: '{t:RAIN} {pop}%',
} as const;

const WIDGET_TEMPLATES: WidgetOptionTemplate[] = [
  { value: WIDGETS.NONE, label: 'None' },
  // Date/time
  { value: WIDGETS.DATE, label: 'Date', category: 'Date & Time' },
  { value: WIDGETS.ALT_TZ, label: 'Alternate Time Zone 1', category: 'World Time' },
  { value: WIDGETS.ALT_TZ2, label: 'Alternate Time Zone 2', category: 'World Time' },
  { value: WIDGETS.NUMERIC_DATE, label: 'Numeric Date', category: 'Date & Time' },
  { value: WIDGETS.DAY_NUMBER, label: 'Day Number', category: 'Date & Time' },
  { value: WIDGETS.WEEK_NUMBER, label: 'Week Number', category: 'Date & Time' },
  { value: WIDGETS.YEAR, label: 'Year', category: 'Date & Time' },
  // Solar
  { value: WIDGETS.NEXT_SOLAR, label: 'Next sunrise/sunset', category: 'Solar' },
  // Health
  { value: WIDGETS.STEPS, label: 'Steps', category: 'Health', requires: 'HEALTH' },
  { value: WIDGETS.DISTANCE, label: 'Distance Walked', category: 'Health', requires: 'HEALTH' },
  { value: WIDGETS.HEART_RATE, label: 'Current Heart Rate', category: 'Health', requires: 'HRM' },
  // Device
  { value: WIDGETS.BATTERY, label: 'Battery %', category: 'Device' },
  { value: WIDGETS.ALARM, label: 'Next Alarm', category: 'Device', requires: 'ALARMS' },
  // Weather
  { value: WIDGETS.FORECAST, label: 'Temperature (Current & Forecast)', category: 'Weather' },
  { value: WIDGETS.CONDITION, label: 'Current Condition', category: 'Weather' },
  { value: WIDGETS.HUMIDITY, label: 'Humidity', category: 'Weather' },
  { value: WIDGETS.WIND, label: 'Wind', category: 'Weather' },
  { value: WIDGETS.UV_INDEX, label: 'UV Index', category: 'Weather' },
  { value: WIDGETS.DEW_POINT, label: 'Dew Point', category: 'Weather' },
  { value: WIDGETS.RAIN, label: 'Chance of Rain', category: 'Weather' },
  // Custom
  { value: '__custom__', label: 'Custom…', category: 'Custom' },
];

export const WIDGET_TOKENS: WidgetToken[] = [
  { token: '{local_date}', label: 'Local Date', category: 'Date & Time' },
  { token: '{alt_tz}', label: 'Alt TZ Full', category: 'World Time' },
  { token: '{alt_tz_label}', label: 'Alt TZ Label', category: 'World Time' },
  { token: '{alt_tz_time}', label: 'Alt TZ Time', category: 'World Time' },
  { token: '{alt_tz_day}', label: 'Alt TZ Day', category: 'World Time' },
  { token: '{alt_tz2}', label: 'Alt TZ 2 Full', category: 'World Time' },
  { token: '{alt_tz2_label}', label: 'Alt TZ 2 Label', category: 'World Time' },
  { token: '{alt_tz2_time}', label: 'Alt TZ 2 Time', category: 'World Time' },
  { token: '{alt_tz2_day}', label: 'Alt TZ 2 Day', category: 'World Time' },
  { token: '{day_name}', label: 'Day Name', category: 'Date & Time' },
  { token: '{month_name}', label: 'Month Name', category: 'Date & Time' },
  { token: '{day0}', label: 'Day (Leading Zero)', category: 'Date & Time' },
  { token: '{day}', label: 'Day', category: 'Date & Time' },
  { token: '{month_num}', label: 'Month No.', category: 'Date & Time' },
  { token: '{year}', label: 'Year', category: 'Date & Time' },
  { token: '{year_short}', label: 'Abbreviated Year', category: 'Date & Time' },
  { token: '{day_of_year}', label: 'Day No.', category: 'Date & Time' },
  { token: '{week_of_year}', label: 'Week No.', category: 'Date & Time' },
  { token: '{sunrise}', label: 'Sunrise', category: 'Solar' },
  { token: '{sunset}', label: 'Sunset', category: 'Solar' },
  { token: '{next_solar}', label: 'Next sunrise/sunset', category: 'Solar' },
  { token: '{next_solar_label}', label: 'Rise/Set Label', category: 'Solar' },
  { token: '{next_solar_time}', label: 'Solar Time', category: 'Solar' },
  { token: '{steps}', label: 'Steps', category: 'Health & Device', requires: 'HEALTH' },
  { token: '{dist}', label: 'Distance', category: 'Health & Device', requires: 'HEALTH' },
  { token: '{dist_unit}', label: 'Dist. Unit', category: 'Health & Device', requires: 'HEALTH' },
  { token: '{hr}', label: 'Heart Rate', category: 'Health & Device', requires: 'HRM' },
  { token: '{batt}', label: 'Battery', category: 'Health & Device' },
  { token: '{alarm}', label: 'Next Alarm', category: 'Health & Device', requires: 'ALARMS' },
  { token: '{temp}', label: 'Temp', category: 'Weather' },
  { token: '{thi}', label: 'High', category: 'Weather' },
  { token: '{tlo}', label: 'Low', category: 'Weather' },
  { token: '{cond}', label: 'Condition', category: 'Weather' },
  { token: '{cond_day}', label: 'Day Cond.', category: 'Weather' },
  { token: '{hum}', label: 'Humidity', category: 'Weather' },
  { token: '{wind}', label: 'Wind', category: 'Weather' },
  { token: '{wind_unit}', label: 'Wind Unit', category: 'Weather' },
  { token: '{wind_dir}', label: 'Wind Dir.', category: 'Weather' },
  { token: '{uv}', label: 'UV', category: 'Weather' },
  { token: '{rain}', label: 'Rain', category: 'Weather' },
  { token: '{pop}', label: 'Rain %', category: 'Weather' },
  { token: '{dew}', label: 'Dew Point', category: 'Weather' },
  { token: '{temp_unit}', label: 'Temp Unit', category: 'Weather' },
];

export const ALT_TIMEZONE_WIDGET_IDS = ['alt_tz', 'alt_tz_label', 'alt_tz_time', 'alt_tz_day'];

export const ALT_TIMEZONE2_WIDGET_IDS = ['alt_tz2', 'alt_tz2_label', 'alt_tz2_time', 'alt_tz2_day'];

export const WEATHER_WIDGET_IDS = WIDGET_TOKENS.filter((token) => token.category === 'Weather').map(
  (token) => token.token,
);

const normalizeWidgetTokenId = (id: WidgetTokenId) =>
  id.startsWith('{') && id.endsWith('}') ? id : `{${id}}`;

export const containsWidgets = (
  widgetValues: Array<string | null | undefined>,
  tokenIds: WidgetTokenId[],
): boolean => {
  const tokens = tokenIds.map(normalizeWidgetTokenId);
  return widgetValues.some((value) => tokens.some((token) => value?.includes(token)));
};

/** The tokens the custom widget editor offers on this watch */
export const getWidgetTokens = (capabilities: Capabilities): WidgetToken[] =>
  WIDGET_TOKENS.filter((token) => isAvailable(token, capabilities));

export const getWidgetOptions = (
  lang: number,
  capabilities: Capabilities,
  isImperial: boolean = false,
  altLabel: string = 'TYO',
  altLabel2: string = 'UTC',
): WidgetOption[] => {
  return WIDGET_TEMPLATES.filter((t) => isAvailable(t, capabilities))
    .map((t) => {
      const preview =
        t.value && t.value !== '__custom__'
          ? renderPreview(t.value, lang, isImperial, altLabel, altLabel2)
          : '';
      return { value: t.value, label: t.label, preview, category: t.category };
    });
};

// Look up the rendered preview for a stored format string. Used by WatchPreview
// when the saved value matches a preset (or even if it doesn't — we just
// substitute tokens against the current language).
export const getPreviewForValue = (
  value: string | undefined,
  lang: number,
  isImperial: boolean = false,
  altLabel: string = 'TYO',
  altLabel2: string = 'UTC',
): string => {
  if (!value) return '';
  if (value === '__custom__') return '';
  return renderPreview(value, lang, isImperial, altLabel, altLabel2);
};
