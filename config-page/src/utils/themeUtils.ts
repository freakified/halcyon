import { Capabilities, Settings } from '../context/types';
import { SavedTheme } from '../hooks/useSavedThemes';

/** The settings a theme holds: only its own kind's keys */
export type ThemeSettings = Record<string, string>;

export interface Theme {
  name: string;
  settings: ThemeSettings;
}

/** The internal settings holding each picker's selection; never sent to the watch */
export type ThemeSelectionKey = 'SETTING_THEME' | 'SETTING_NIGHT_THEME' | 'SETTING_WIDGET_THEME';

export const THEME_SELECTION_KEYS: ThemeSelectionKey[] = [
  'SETTING_THEME',
  'SETTING_NIGHT_THEME',
  'SETTING_WIDGET_THEME',
];

/**
 * One kind of theme — day colors, night colors, widgets — and everything
 * the shared picker, custom panel and saved-theme storage need to know
 * about it.
 */
export interface ThemeKind {
  selectionKey: ThemeSelectionKey;
  /** localStorage key for this kind's saved themes; kinds may share one */
  storageKey: string;
  /** saved themes are named "<prefix> 1", "<prefix> 2", ... */
  savedNamePrefix: string;
  /** Heading of the import dialog */
  importTitle: string;
  /** the preset list for this watch, default first */
  presets: (capabilities: Capabilities) => Theme[];
  /**
   * This kind's settings picked out of anything theme-shaped (the live
   * settings, a preset), coerced for comparison. Null when there's
   * nothing of this kind in it.
   */
  normalize: (raw: Record<string, unknown>) => ThemeSettings | null;
  /** Live settings into the form they're saved and shared in */
  toSaved: (settings: ThemeSettings) => ThemeSettings;
  /** Saved or shared settings (in any form we've ever exported) into live settings */
  fromSaved: (settings: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Combines light, neutral and dark themes into a single list, ensuring the first
 * theme is marked as the default.
 *
 * @param primaryThemes The first group of themes (e.g. light themes for day mode)
 * @param neutralThemes The second group of themes (e.g. neutral themes)
 * @param secondaryThemes The third group of themes (e.g. dark themes for day mode)
 */
export const prepareThemes = (
  primaryThemes: Theme[],
  neutralThemes: Theme[],
  secondaryThemes: Theme[],
): Theme[] => {
  const combined = [...primaryThemes, ...neutralThemes, ...secondaryThemes];

  return combined.map((theme, index) => {
    if (index === 0) {
      return {
        ...theme,
        name: `${theme.name} (Default)`,
      };
    }
    return theme;
  });
};

const themeMatches = (themeSettings: ThemeSettings | null, current: ThemeSettings) => {
  const keys = Object.keys(themeSettings ?? {});
  return keys.length > 0 && keys.every((key) => current[key] === themeSettings![key]);
};

/**
 * The picker id of the theme the current settings belong to: a saved
 * theme's id, a preset's index, or 'custom' when nothing matches. The
 * selection itself is never sent to the watch, so it's recovered from the
 * settings each time the page opens.
 */
export const matchThemeId = (
  kind: ThemeKind,
  settings: Settings,
  capabilities: Capabilities,
  savedThemes: SavedTheme[]
): string => {
  const current = kind.normalize({ ...settings }) ?? {};
  const matches = (theme: ThemeSettings) => themeMatches(kind.normalize(theme), current);

  // saved themes come first, mirroring the picker's own lookup order
  const saved = savedThemes.find((t) => matches(t.settings));
  if (saved) return saved.id;

  const index = kind.presets(capabilities).findIndex((t) => matches(t.settings));
  return index >= 0 ? index.toString() : 'custom';
};
