import React, { useState } from 'react';
import { Button } from 'react-aria-components';
import { WatchPreview, WatchPreviewProps } from './WatchPreview';
import { ImportThemeModal } from './ImportThemeModal';
import { SavedTheme, remapToNightKeys } from '../hooks/useSavedThemes';
import { useCapabilities, useConfig } from '../context/PebbleConfigContext';
import { Settings } from '../context/types';
import { copyToClipboard } from '../utils/clipboard';
import { Icon, ICONS } from './Icon';

interface CustomThemePanelProps {
  /** The currently selected theme ID */
  themeId: string;
  /** The saved theme object, if a saved theme is selected */
  savedTheme?: SavedTheme;
  /** Props forwarded to WatchPreview */
  watchPreviewProps?: Partial<WatchPreviewProps>;
  /** Called to save current settings as a new theme */
  onSave: (settings: Settings) => SavedTheme;
  /** Called to delete a saved theme */
  onDelete: (id: string) => void;
  /** Called to import a theme from JSON */
  onImport: (json: string) => { success: boolean; error?: string };
  /** Called to export a theme to JSON string */
  onExport: (settings: Record<string, string>) => string;
  /** Called when themes change and we need to select a new one */
  onSelectTheme: (themeId: string) => void;
}

export const CustomThemePanel: React.FC<CustomThemePanelProps> = ({
  themeId,
  savedTheme,
  watchPreviewProps,
  onSave,
  onDelete,
  onImport,
  onExport,
  onSelectTheme,
}) => {
  const { settings } = useConfig();
  const capabilities = useCapabilities();
  const [importOpen, setImportOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const isCustom = themeId === 'custom';
  const isSaved = !!savedTheme;
  const isRound = capabilities.ROUND && !capabilities.RECT;
  const isNight = watchPreviewProps?.isNight ?? false;

  const handleSave = () => {
    const theme = onSave(settings);
    onSelectTheme(theme.id);
  };

  const handleShare = async () => {
    const settingsToExport = isSaved ? savedTheme!.settings : getVisibleSettings();
    const json = onExport(settingsToExport);
    const success = await copyToClipboard(json);
    if (success) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } else {
      // Ultimate fallback
      prompt('Copy this theme JSON:', json);
    }
  };

  const handleDelete = () => {
    if (savedTheme) {
      onDelete(savedTheme.id);
      onSelectTheme('custom');
    }
  };

  const handleImport = (json: string) => {
    const result = onImport(json);
    if (result.success) {
      // The imported theme is now in the list
    }
    return result;
  };

  /** Extract color settings from the current live settings */
  const getVisibleSettings = (): Record<string, string> => {
    const colorSettings: Record<string, string> = {};
    const keys = Object.keys(settings).filter(
      (k) => k.startsWith('SETTING_') && k.includes('COLOR')
    );
    for (const key of keys) {
      const isNightKey = key.startsWith('SETTING_NIGHT_');
      if (isNight ? isNightKey : !isNightKey) {
        colorSettings[key] = String(settings[key as keyof Settings]);
      }
    }
    return colorSettings;
  };

  return (
    <div className="halite-custom-panel">
      <div className={`halite-custom-panel-preview ${isRound ? 'round' : 'rect'}`}>
        <WatchPreview
          overrideSettings={isSaved
            ? (isNight ? remapToNightKeys(savedTheme!.settings) : savedTheme!.settings)
            : undefined
          }
          {...watchPreviewProps}
        />
      </div>
      <div className="halite-custom-actions">
        {isCustom && (
          <>
            <Button className="halite-custom-action-btn halite-custom-action-btn--primary" onPress={handleSave}>
              <Icon path={ICONS.SAVE} />
              Save
            </Button>
            <Button className="halite-custom-action-btn" onPress={handleShare}>
              <Icon path={ICONS.SHARE} />
              {copyFeedback ? 'Copied!' : 'Share'}
            </Button>
            <Button className="halite-custom-action-btn" onPress={() => setImportOpen(true)}>
              <Icon path={ICONS.IMPORT} />
              Import
            </Button>
          </>
        )}
        {!isCustom && (
          <>
            <Button className="halite-custom-action-btn" onPress={() => onSelectTheme('custom')}>
              <Icon path={ICONS.PALETTE} />
              Customize
            </Button>
            <Button className="halite-custom-action-btn" onPress={handleShare}>
              <Icon path={ICONS.SHARE} />
              {copyFeedback ? 'Copied!' : 'Share'}
            </Button>
            {isSaved && (
              <Button className="halite-custom-action-btn halite-custom-action-btn--danger" onPress={handleDelete}>
                <Icon path={ICONS.DELETE} />
                Delete
              </Button>
            )}
          </>
        )}
      </div>
      <ImportThemeModal
        isOpen={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
    </div>
  );
};
