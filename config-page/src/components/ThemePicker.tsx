import React from 'react';
import { useCapabilities, useConfig } from '../context/PebbleConfigContext';
import { FormItem } from './FormItem';
import { GridList, GridListItem, Text } from 'react-aria-components';
import { WatchPreview, WatchPreviewProps } from './WatchPreview';
import { SavedTheme } from '../hooks/useSavedThemes';
import { Theme, ThemeSelectionKey } from '../utils/themeUtils';
import customIconUrl from '../assets/custom-icon.svg';

export const ThemePicker: React.FC<{
  label?: string;
  messageKey: ThemeSelectionKey;
  themes: Theme[];
  watchPreviewProps?: Partial<WatchPreviewProps>;
  /** Saved themes, already in live form */
  savedThemes?: SavedTheme[];
  /** Image on the Custom card */
  customIcon?: string;
}> = ({ label, messageKey, themes, watchPreviewProps, savedThemes = [], customIcon = customIconUrl }) => {
  const { settings, updateSetting, updateSettings } = useConfig();
  const capabilities = useCapabilities();
  const currentValue = settings[messageKey];
  const isRound = capabilities.ROUND && !capabilities.RECT;

  const handleThemeChange = (themeId: string) => {
    if (themeId === 'custom') {
      updateSetting(messageKey, themeId);
      return;
    }

    // Check saved themes first
    const theme = savedThemes.find((t) => t.id === themeId) ?? themes[parseInt(themeId, 10)];

    // the selection and the theme's settings land together, so nothing
    // ever sees one without the other
    updateSettings({ ...theme?.settings, [messageKey]: themeId });
  };

  const themeList = React.useMemo(() => [
    { id: 'custom', name: 'Custom', settings: {}, isSaved: false },
    ...savedThemes.map((t) => ({
      id: t.id,
      name: t.name,
      settings: t.settings,
      isSaved: true,
    })),
    ...themes.map((theme, index) => ({
      id: index.toString(),
      name: theme.name,
      settings: theme.settings,
      isSaved: false,
    })),
  ], [themes, savedThemes]);

  return (
    <FormItem className="halite-theme-picker">
      <GridList
        items={themeList}
        selectionMode="single"
        selectedKeys={[String(currentValue)]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected) handleThemeChange(selected);
        }}
        layout='grid'
        aria-label={label}
        className="halite-theme-grid"
      >
        {(item) => (
          <GridListItem id={item.id} className={`halite-theme-card ${isRound ? 'round' : 'rect'}`} textValue={item.name}>
            <div className={`halite-theme-card-preview ${isRound ? 'round' : 'rect'}`}>
              {item.id === 'custom' ? (
                <div className={`halite-custom-icon ${isRound ? 'round' : 'rect'}`}>
                  <img src={customIcon} alt="" width={40} height={38} />
                </div>
              ) : (
                <WatchPreview overrideSettings={item.settings} {...watchPreviewProps} />
              )}
            </div>
            <Text className="halite-theme-card-label">
              {item.name}
            </Text>
          </GridListItem>
        )}
      </GridList>
    </FormItem>
  );
};
