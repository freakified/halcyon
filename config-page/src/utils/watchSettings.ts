import type { Settings } from '../context/types';
import { THEME_SELECTION_KEYS } from './themeUtils';

// New PBWs opt in explicitly. Older phone scripts never advertise this key.
export const supportsSolarThemes = (search: string) =>
  new URLSearchParams(search).get('solarThemes') === '1';

export function settingsForWatch(settings: Settings, solarThemes: boolean) {
  const result: Record<string, unknown> = { ...settings };
  THEME_SELECTION_KEYS.forEach(key => delete result[key]);
  if (!solarThemes) delete result.SETTING_DYNAMIC_SOLAR_THEME;
  return result;
}
