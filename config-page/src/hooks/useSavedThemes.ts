import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { Settings } from '../context/types';
import { ThemeKind, ThemeSettings } from '../utils/themeUtils';

export interface SavedTheme {
    id: string;
    name: string;
    /** Stored in the kind's saved form (day keys for colors); live form once loaded */
    settings: ThemeSettings;
}

/** Convert any SETTING_NIGHT_* keys to their SETTING_* equivalents */
export function remapToDayKeys(settings: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
        result[key.replace(/^SETTING_NIGHT_/, 'SETTING_')] = value;
    }
    return result;
}

/** Convert SETTING_* keys to their SETTING_NIGHT_* equivalents */
export function remapToNightKeys(settings: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings)) {
        // Only remap keys that don't already have the NIGHT_ prefix
        result[key.replace(/^SETTING_(?!NIGHT_)/, 'SETTING_NIGHT_')] = value;
    }
    return result;
}

// The day and night pickers share one list of saved color themes, so the
// lists live here, one per storage key, rather than in each hook's state
const stores = new Map<string, SavedTheme[]>();
const listeners = new Set<() => void>();

function readStore(key: string): SavedTheme[] {
    if (!stores.has(key)) {
        try {
            const raw = localStorage.getItem(key);
            stores.set(key, raw ? JSON.parse(raw) : []);
        } catch {
            stores.set(key, []);
        }
    }
    return stores.get(key)!;
}

function writeStore(key: string, update: (themes: SavedTheme[]) => SavedTheme[]) {
    const themes = update(readStore(key));
    stores.set(key, themes);
    localStorage.setItem(key, JSON.stringify(themes));
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** A stored theme in the kind's live form, or null if nothing of the kind is left in it */
function toLive(kind: ThemeKind, theme: SavedTheme): SavedTheme | null {
    const settings = kind.normalize(kind.fromSaved(theme.settings));
    return settings ? { ...theme, settings } : null;
}

/** The user's saved themes of one kind, in live form */
export function loadSavedThemes(kind: ThemeKind): SavedTheme[] {
    return readStore(kind.storageKey)
        .map((theme) => toLive(kind, theme))
        .filter((theme): theme is SavedTheme => theme !== null);
}

function getNextName(themes: SavedTheme[], prefix: string): string {
    let max = 0;
    for (const t of themes) {
        const match = t.name.match(new RegExp(`^${prefix} (\\d+)$`));
        if (match) max = Math.max(max, parseInt(match[1], 10));
    }
    return `${prefix} ${max + 1}`;
}

function generateId(): string {
    return `saved_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useSavedThemes(kind: ThemeKind) {
    const stored = useSyncExternalStore(subscribe, () => readStore(kind.storageKey));

    const savedThemes = useMemo(
        () => stored
            .map((theme) => toLive(kind, theme))
            .filter((theme): theme is SavedTheme => theme !== null),
        [stored, kind]
    );

    /** Store live settings as a new theme, returned in live form */
    const addTheme = useCallback(
        (settings: ThemeSettings, name?: string): SavedTheme => {
            const theme: SavedTheme = {
                id: generateId(),
                name: name || getNextName(savedThemes, kind.savedNamePrefix),
                settings: kind.toSaved(settings),
            };
            // Prepend so the list is newest-first
            writeStore(kind.storageKey, (prev) => [theme, ...prev]);
            return { ...theme, settings };
        },
        [savedThemes, kind]
    );

    /** Capture the current settings as a new saved theme */
    const saveTheme = useCallback(
        (settings: Settings): SavedTheme => addTheme(kind.normalize({ ...settings }) ?? {}),
        [addTheme, kind]
    );

    const deleteTheme = useCallback(
        (id: string) => writeStore(kind.storageKey, (prev) => prev.filter((t) => t.id !== id)),
        [kind]
    );

    /**
     * Import a theme from JSON. Color themes are accepted with either day or
     * night keys, whichever picker they're imported into.
     */
    const importTheme = useCallback(
        (json: string): { success: boolean; error?: string; theme?: SavedTheme } => {
            try {
                const parsed = JSON.parse(json);

                // Accept either { settings: { ... } } or a flat { SETTING_...: ... } object
                const raw: Record<string, unknown> =
                    parsed.settings && typeof parsed.settings === 'object'
                        ? parsed.settings
                        : parsed;

                const settings = kind.normalize(kind.fromSaved(raw));
                if (!settings) {
                    return {
                        success: false,
                        error: 'No valid theme settings found in the pasted JSON.',
                    };
                }

                const theme = addTheme(settings, typeof parsed.name === 'string' ? parsed.name : undefined);
                return { success: true, theme };
            } catch {
                return { success: false, error: 'Invalid JSON. Please check and try again.' };
            }
        },
        [addTheme, kind]
    );

    /** Serialize this kind's part of some live settings to a shareable JSON string */
    const exportTheme = useCallback(
        (settings: Record<string, unknown>): string =>
            JSON.stringify(kind.toSaved(kind.normalize(settings) ?? {}), null, 2),
        [kind]
    );

    return { savedThemes, saveTheme, deleteTheme, importTheme, exportTheme };
}
