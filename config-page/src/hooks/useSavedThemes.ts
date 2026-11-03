import { useState, useCallback, useEffect } from 'react';
import { Settings } from '../context/types';

export interface SavedTheme {
    id: string;
    name: string;
    /** Always stored with day-style (SETTING_*) keys as the canonical format */
    settings: Record<string, string>;
}

const STORAGE_KEY = 'halcyon-saved-themes';

/** Color setting keys for a day theme — the canonical storage format */
export const DAY_THEME_KEYS: (keyof Settings)[] = [
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
    'SETTING_ALARM_COLOR',
];

/** Night-mode equivalents of DAY_THEME_KEYS, in the same order */
export const NIGHT_THEME_KEYS: (keyof Settings)[] = [
    'SETTING_NIGHT_TIME_COLOR',
    'SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR',
    'SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR',
    'SETTING_NIGHT_BG_COLOR',
    'SETTING_NIGHT_PIP_COLOR_PRIMARY',
    'SETTING_NIGHT_PIP_COLOR_SECONDARY',
    'SETTING_NIGHT_RING_STROKE_COLOR',
    'SETTING_NIGHT_RING_NIGHT_COLOR',
    'SETTING_NIGHT_RING_DAY_COLOR',
    'SETTING_NIGHT_RING_SUNRISE_COLOR',
    'SETTING_NIGHT_RING_SUNSET_COLOR',
    'SETTING_NIGHT_SUN_STROKE_COLOR',
    'SETTING_NIGHT_SUN_FILL_COLOR',
    'SETTING_NIGHT_ALARM_COLOR',
];

/** Convert any SETTING_NIGHT_* keys to their SETTING_* equivalents */
export function remapToDayKeys(settings: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
        result[key.replace(/^SETTING_NIGHT_/, 'SETTING_')] = value;
    }
    return result;
}

/** Convert SETTING_* keys to their SETTING_NIGHT_* equivalents */
export function remapToNightKeys(settings: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
        // Only remap keys that don't already have the NIGHT_ prefix
        result[key.replace(/^SETTING_(?!NIGHT_)/, 'SETTING_NIGHT_')] = value;
    }
    return result;
}

function loadFromStorage(): SavedTheme[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveToStorage(themes: SavedTheme[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

function getNextName(themes: SavedTheme[]): string {
    let max = 0;
    for (const t of themes) {
        const match = t.name.match(/^Saved Theme (\d+)$/);
        if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return `Saved Theme ${max + 1}`;
}

function generateId(): string {
    return `saved_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useSavedThemes() {
    const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(loadFromStorage);

    // Persist on change
    useEffect(() => {
        saveToStorage(savedThemes);
    }, [savedThemes]);

    /**
     * Capture the current settings as a new saved theme.
     * Pass `isNight: true` when saving from the night panel so night-mode
     * keys are captured and then normalized to day-key format for storage.
     */
    const saveTheme = useCallback(
        (settings: Settings, isNight: boolean): SavedTheme => {
            const keys = isNight ? NIGHT_THEME_KEYS : DAY_THEME_KEYS;
            const captured: Record<string, string> = {};
            for (const key of keys) {
                captured[key] = String(settings[key]);
            }
            const theme: SavedTheme = {
                id: generateId(),
                name: getNextName(savedThemes),
                // Always store in day-key format regardless of which panel saved it
                settings: isNight ? remapToDayKeys(captured) : captured,
            };
            // Prepend so the list is newest-first
            setSavedThemes((prev) => [theme, ...prev]);
            return theme;
        },
        [savedThemes]
    );

    const deleteTheme = useCallback((id: string) => {
        setSavedThemes((prev) => prev.filter((t) => t.id !== id));
    }, []);

    /**
     * Import a theme from JSON. Accepts both day-key and night-key exports —
     * any SETTING_NIGHT_* keys are automatically remapped to SETTING_* before storing.
     */
    const importTheme = useCallback(
        (json: string): { success: boolean; error?: string; theme?: SavedTheme } => {
            try {
                const parsed = JSON.parse(json);

                // Accept either { settings: { ... } } or a flat { SETTING_...: ... } object
                const raw: Record<string, string> =
                    parsed.settings && typeof parsed.settings === 'object'
                        ? parsed.settings
                        : parsed;

                // Normalize to day-key format (transparently handles both day and night exports)
                const daySettings = remapToDayKeys(raw);

                // Validate that at least some expected keys are present
                const validKeys = DAY_THEME_KEYS.filter((k) => k in daySettings);
                if (validKeys.length === 0) {
                    return {
                        success: false,
                        error: 'No valid theme settings found in the pasted JSON.',
                    };
                }

                // Keep only recognized day-format keys
                const colorSettings: Record<string, string> = {};
                for (const key of DAY_THEME_KEYS) {
                    if (key in daySettings) colorSettings[key] = daySettings[key];
                }

                const theme: SavedTheme = {
                    id: generateId(),
                    name: parsed.name || getNextName(savedThemes),
                    settings: colorSettings,
                };
                setSavedThemes((prev) => [theme, ...prev]);
                return { success: true, theme };
            } catch {
                return { success: false, error: 'Invalid JSON. Please check and try again.' };
            }
        },
        [savedThemes]
    );

    /**
     * Serialize settings to a shareable JSON string.
     * Always outputs day-key format regardless of whether the input uses
     * day or night keys, so shared themes are always in a consistent format.
     */
    const exportTheme = useCallback((settings: Record<string, string>): string => {
        return JSON.stringify(remapToDayKeys(settings), null, 2);
    }, []);

    return { savedThemes, saveTheme, deleteTheme, importTheme, exportTheme };
}
