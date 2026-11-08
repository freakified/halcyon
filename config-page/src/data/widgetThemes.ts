// Widget presets: a format string for each of the four widget slots.
//
// The first preset is the default and is the default widgets themselves
// (utils/defaultSettings.ts), so a fresh install shows it selected.

import { Capabilities, Settings } from '../context/types';
import { getDefaultSettings } from '../utils/defaultSettings';
import { prepareThemes, Theme } from '../utils/themeUtils';
import { isAvailable, WIDGETS } from './widgetTypes';

/** The widget slots, in the order they appear on the watch, top to bottom */
export const WIDGET_KEYS: (keyof Settings)[] = [
  'SETTING_WIDGET_UPPER_SECONDARY',
  'SETTING_WIDGET_UPPER_PRIMARY',
  'SETTING_WIDGET_LOWER_PRIMARY',
  'SETTING_WIDGET_LOWER_SECONDARY',
];

// Most presets build widgets of their own out of tokens, the way the
// widget selector's "Custom…" option does, so they show off what it can
// do; the built-in widgets (data/widgetTypes.ts) are the building blocks.
// Words come from {t:...} tokens rather than literal text, so every
// preset reads right in every language. A slot holds 47 characters, and
// the watch stores what's left after the phone fills in its own tokens
// (weather, sun times, labels), so that has to fit too.
const {
  NONE, DATE, ALT_TZ, ALT_TZ2, NUMERIC_DATE, DAY_NUMBER, WEEK_NUMBER, NEXT_SOLAR,
  STEPS, DISTANCE, HEART_RATE, BATTERY, ALARM,
  FORECAST, CONDITION, HUMIDITY, WIND, UV_INDEX, DEW_POINT, RAIN,
} = WIDGETS;
const SUN_TIMES = '{sunrise} / {sunset}';

export interface WidgetSlots {
  upperSecondary: string;
  upperPrimary: string;
  lowerPrimary: string;
  lowerSecondary: string;
}

export type FormFactor = 'small-rect' | 'large-rect' | 'small-round' | 'large-round';
export type WatchSize = FormFactor | 'small' | 'large' | 'rect' | 'round';
export type WidgetOverrides = Partial<Record<WatchSize, Partial<WidgetSlots>>>;

/** A preset: its name, its four slots, and any per-size overrides */
export interface PresetDefinition extends WidgetSlots, WidgetOverrides {
  name: string;
  /** Only offer the preset on watches with this capability */
  requires?: keyof Capabilities;
}

export const formFactor = (capabilities: Capabilities): FormFactor =>
  capabilities.ROUND
    ? capabilities.DISPLAY_260x260_ROUND ? 'large-round' : 'small-round'
    : capabilities.DISPLAY_200x228 ? 'large-rect' : 'small-rect';

/** The widget preset list for this watch, default first */
export const getWidgetThemes = (capabilities: Capabilities): Theme[] => {
  const defaults = getDefaultSettings(capabilities);
  const isLarge = capabilities.DISPLAY_200x228 || capabilities.DISPLAY_260x260_ROUND;
  const matchingSizes: WatchSize[] = [
    isLarge ? 'large' : 'small',
    capabilities.ROUND ? 'round' : 'rect',
    formFactor(capabilities),
  ];

  const preset = ({
    name,
    requires,
    upperSecondary,
    upperPrimary,
    lowerPrimary,
    lowerSecondary,
    ...overrides
  }: PresetDefinition): Theme | null => {
    if (!isAvailable({ requires }, capabilities)) return null;

    const slots: WidgetSlots = Object.assign(
      { upperSecondary, upperPrimary, lowerPrimary, lowerSecondary },
      ...matchingSizes.map((size) => overrides[size]),
    );

    return {
      name,
      settings: {
        SETTING_WIDGET_UPPER_SECONDARY: slots.upperSecondary,
        SETTING_WIDGET_UPPER_PRIMARY: slots.upperPrimary,
        SETTING_WIDGET_LOWER_PRIMARY: slots.lowerPrimary,
        SETTING_WIDGET_LOWER_SECONDARY: slots.lowerSecondary,
      },
    };
  };

  const presets = [
    preset({
      name: 'Default',
      upperSecondary: defaults.SETTING_WIDGET_UPPER_SECONDARY,
      upperPrimary: defaults.SETTING_WIDGET_UPPER_PRIMARY,
      lowerPrimary: defaults.SETTING_WIDGET_LOWER_PRIMARY,
      lowerSecondary: defaults.SETTING_WIDGET_LOWER_SECONDARY,
    }),
    preset({
      name: 'Minimal',
      upperSecondary: NONE,
      upperPrimary: NONE,
      lowerPrimary: DATE,
      lowerSecondary: NONE,
    }),
    preset({
      name: 'World Traveler',
      upperSecondary: ALT_TZ,
      upperPrimary: ALT_TZ2,
      lowerPrimary: NUMERIC_DATE,
      lowerSecondary: BATTERY,
    }),
    preset({
      name: 'Workday',
      requires: 'ALARMS',
      upperSecondary: `{batt}% · {alarm}`,
      upperPrimary: DATE,
      lowerPrimary: FORECAST,
      lowerSecondary: RAIN,
    }),
    preset({
      name: 'Marathon',
      requires: 'HRM',
      upperSecondary: `${UV_INDEX} ${RAIN}`,
      upperPrimary: NUMERIC_DATE,
      lowerPrimary: HEART_RATE,
      lowerSecondary: `${STEPS} ${DISTANCE}`,
    }),
    preset({
      name: 'Storm Advisory',
      upperSecondary: WIND,
      upperPrimary: '{temp}° {cond}',
      lowerPrimary: DATE,
      lowerSecondary: RAIN,
      large: {
        upperSecondary: `${WIND} · {hum}%`,
        lowerSecondary: `${RAIN} · ${DEW_POINT}`,
      },
    }),
    preset({
      name: 'Carpe Diem',
      upperSecondary: WEEK_NUMBER,
      upperPrimary: SUN_TIMES,
      lowerPrimary: DATE,
      lowerSecondary: `${DAY_NUMBER} · {year}`,
    }),
    preset({
      name: 'Outside',
      upperPrimary: `{thi}°/{tlo} ${RAIN}`,
      upperSecondary: '{temp}° {cond}',
      lowerSecondary: NUMERIC_DATE,
      lowerPrimary: `${NEXT_SOLAR} · ${UV_INDEX}`,
      round: {
        upperPrimary: `{thi}°/{tlo} ${RAIN}`,
        upperSecondary: '{temp}° {cond}',
        lowerSecondary: NUMERIC_DATE,
        lowerPrimary: `${NEXT_SOLAR} · ${UV_INDEX}`,
      },
    }),

    // Tier 3
    // Tier 4
    preset({
      name: 'Rise and Shine',
      upperSecondary: '{cond_day}',
      upperPrimary: STEPS,
      lowerPrimary: SUN_TIMES,
      lowerSecondary: DATE,
      large: {
        upperSecondary: `${UV_INDEX} · {cond_day}`,
      },
    }),
  ];

  // drop the presets this watch can't show
  return prepareThemes(presets.filter((theme): theme is Theme => theme !== null));
};
