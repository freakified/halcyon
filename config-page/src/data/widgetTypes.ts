// Widget type definitions — shared between the config page Select dropdowns
// and the WatchPreview component. Previews are computed at render time so they
// reflect the user's selected language.

import { renderPreview } from './i18nPreview';

export interface WidgetOption {
  value: string;
  label: string;
  preview: string;
  category?: string;
}

export interface WidgetToken {
  token: string;
  label: string;
  category: string;
  requires?: 'health' | 'hrm';
}

export type WidgetTokenId = string;

interface WidgetOptionTemplate {
  value: string;
  label: string;
  category?: string;
}

const WIDGET_TEMPLATES: WidgetOptionTemplate[] = [
  { value: '', label: 'None' },
  // Date/time
  { value: '{local_date}', label: 'Date', category: 'Date & Time' },
  { value: '{alt_tz}', label: 'Alternate Time Zone 1', category: 'World Time' },
  { value: '{alt_tz2}', label: 'Alternate Time Zone 2', category: 'World Time' },
  { value: '{year}-{month_num}-{day0}', label: 'Numeric Date', category: 'Date & Time' },
  { value: '{t:DAY} {day_of_year}', label: 'Day Number', category: 'Date & Time' },
  { value: '{t:WEEK} {week_of_year}', label: 'Week Number', category: 'Date & Time' },
  { value: '{year}', label: 'Year', category: 'Date & Time' },
  // Solar
  { value: '{next_solar}', label: 'Next sunrise/sunset', category: 'Solar' },
  // Health
  { value: '{steps} {t:STEPS}', label: 'Steps', category: 'Health' },
  { value: '{dist} {dist_unit}', label: 'Distance Walked', category: 'Health' },
  { value: '{hr} {t:BPM}', label: 'Current Heart Rate', category: 'Health' },
  // Device
  { value: '{t:BATTERY} {batt}%', label: 'Battery %', category: 'Device' },
  // Weather
  {
    value: '{temp}° ({thi}°/{tlo}°)',
    label: 'Temperature (Current & Forecast)',
    category: 'Weather',
  },
  { value: '{cond}', label: 'Current Condition', category: 'Weather' },
  { value: '{hum}% {t:HUMIDITY}', label: 'Humidity', category: 'Weather' },
  { value: '{wind} {wind_unit} {wind_dir}', label: 'Wind', category: 'Weather' },
  { value: '{t:UV} {uv}', label: 'UV Index', category: 'Weather' },
  { value: '{t:DPT} {dew}°', label: 'Dew Point', category: 'Weather' },
  { value: '{t:RAIN} {pop}%', label: 'Chance of Rain', category: 'Weather' },
  // Custom
  { value: '__custom__', label: 'Custom…', category: 'Custom' },
];

const HEALTH_LABELS = new Set(['Steps', 'Distance Walked']);
const HRM_LABELS = new Set(['Current Heart Rate']);

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
  { token: '{day_of_year}', label: 'Day No.', category: 'Date & Time' },
  { token: '{week_of_year}', label: 'Week No.', category: 'Date & Time' },
  { token: '{sunrise}', label: 'Sunrise', category: 'Solar' },
  { token: '{sunset}', label: 'Sunset', category: 'Solar' },
  { token: '{next_solar}', label: 'Next sunrise/sunset', category: 'Solar' },
  { token: '{next_solar_label}', label: 'Rise/Set Label', category: 'Solar' },
  { token: '{next_solar_time}', label: 'Solar Time', category: 'Solar' },
  { token: '{steps}', label: 'Steps', category: 'Health & Device', requires: 'health' },
  { token: '{dist}', label: 'Distance', category: 'Health & Device', requires: 'health' },
  { token: '{dist_unit}', label: 'Dist. Unit', category: 'Health & Device', requires: 'health' },
  { token: '{hr}', label: 'Heart Rate', category: 'Health & Device', requires: 'hrm' },
  { token: '{batt}', label: 'Battery', category: 'Health & Device' },
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

export const getWidgetOptions = (
  lang: number,
  hasHealth: boolean,
  hasHrm: boolean,
  isImperial: boolean = false,
  altLabel: string = 'TYO',
  altLabel2: string = 'UTC',
): WidgetOption[] => {
  return WIDGET_TEMPLATES.filter((t) => hasHealth || !HEALTH_LABELS.has(t.label))
    .filter((t) => hasHrm || !HRM_LABELS.has(t.label))
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
