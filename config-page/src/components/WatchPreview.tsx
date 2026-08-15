import React from 'react';
import { useCapabilities, useConfig } from '../context/PebbleConfigContext';
import { Settings } from '../context/types';
import { getPreviewForValue } from '../data/widgetTypes';

const WeatherIconPreview: React.FC<{ background: string }> = ({ background }) => (
    <svg
        aria-label="Partly cloudy weather icon preview"
        className="halite-weather-icon-preview"
        viewBox="0 0 25 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path
            d="M12.5 3.5 10.5 5.5v3l2 2h3l2-2v-3l-2-2Z"
            fill={background}
        />
        <path d="M6.5.5l2 2M21.5.5l-2 2M20.5 7.5h3M4.5 7.5h3" />
        <path
            d="m21.5 23.5 2-2v-4l-2-2h-6l-3-3h-4l-3 3h-3l-2 2v4l2 2Z"
            fill={background}
        />
        <path d="m5.5 15.5 3 3" />
    </svg>
);

export interface WatchPreviewProps {
    overrideSettings?: Partial<Settings>;
    isNight?: boolean;
};

export const WatchPreview: React.FC<WatchPreviewProps> = ({ overrideSettings, isNight = false }) => {
    const { settings } = useConfig();
    const capabilities = useCapabilities();

    const effectiveSettings = { ...settings, ...overrideSettings };
    const isRound = capabilities.ROUND && !capabilities.RECT;
    const previewDimensions = isRound ? { width: 180, height: 180 } : { width: 144, height: 168 };
    const altLabel = String(effectiveSettings.SETTING_ALT_LABEL || 'TYO');
    const altLabel2 = String(effectiveSettings.SETTING_ALT_LABEL2 || 'UTC');
    const secondaryWidgetFontClass = Number(effectiveSettings.SETTING_USE_PRIMARY_WIDGET_FONT) === 1
        ? 'primary'
        : 'secondary';

    const getHex = (color: string) => {
        if (!color) return '#000000';
        return color.startsWith('#') ? color : `#${color}`;
    };

    const color = (daySetting: keyof Settings, nightSetting: keyof Settings) => (
        getHex(!isNight ? String(effectiveSettings[daySetting]) : String(effectiveSettings[nightSetting]))
    );

    const renderWidget = (value: string | undefined): React.ReactNode => {
        if (value === '{weather_icon}' || value === '{weather_icon_day}') {
            return (
                <WeatherIconPreview
                    background={getHex(
                        isNight
                            ? effectiveSettings.SETTING_NIGHT_BG_COLOR
                            : effectiveSettings.SETTING_BG_COLOR,
                    )}
                />
            );
        }
        return getPreviewForValue(
            value,
            Number(effectiveSettings.SETTING_LANGUAGE) || 0,
            Number(effectiveSettings.SETTING_TEMP_UNIT) === 1,
            altLabel,
            altLabel2,
        );
    };

    return (
        <div className={`halite-watch-preview-container ${isRound ? 'round' : 'rect'}`}>
            <div
                className={`halite-watch-face ${isRound ? 'round' : 'rect'}`}
                style={previewDimensions}
            >
                {isRound ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="180"
                        height="180"
                        viewBox="0 0 180 180"
                        fill="none"
                        className="halite-watch-preview"
                    >
                        <path id="SETTING_BG_COLOR" fill={color('SETTING_BG_COLOR', 'SETTING_NIGHT_BG_COLOR')} d="M164 90c0 40.869-33.131 74-74 74-40.87 0-74-33.131-74-74 0-40.87 33.13-74 74-74 40.869 0 74 33.13 74 74Z" />
                        <path id="SETTING_PIP_COLOR_PRIMARY" fill={color('SETTING_PIP_COLOR_PRIMARY', 'SETTING_NIGHT_PIP_COLOR_PRIMARY')} fillRule="evenodd" d="M157 89h5v2h-5v-2ZM89 23v-5h2v5h-2Zm0 139v-5h2v5h-2ZM18 89h5v2h-5v-2Zm120.083 47.669 3.536 3.535-1.414 1.415-3.536-3.536 1.414-1.414ZM39.795 38.381l3.536 3.536-1.414 1.414-3.536-3.536 1.414-1.414Zm3.535 99.702-3.535 3.536-1.414-1.414 3.536-3.536 1.414 1.414Zm98.289-98.288-3.536 3.536-1.414-1.415 3.535-3.535 1.415 1.414Z" clipRule="evenodd" />
                        <g id="SETTING_PIP_COLOR_SECONDARY" fill={color('SETTING_PIP_COLOR_SECONDARY', 'SETTING_NIGHT_PIP_COLOR_SECONDARY')} fillRule="evenodd" clipRule="evenodd">
                            <path d="m106.892 23.092.777-2.897 1.932.517-.777 2.898-1.932-.518ZM70.399 159.288l.776-2.898 1.932.518-.776 2.898-1.932-.518Zm53.235-129.544 1.5-2.598 1.732 1-1.5 2.598-1.732-1Zm-70.5 122.11 1.5-2.598 1.732 1-1.5 2.598-1.732-1ZM71.175 23.61l-.776-2.898 1.932-.517.776 2.897-1.932.518Zm36.494 136.195-.776-2.897 1.931-.518.777 2.898-1.932.517ZM54.634 30.744l-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm70.5 122.11-1.5-2.598 1.732-1 1.5 2.598-1.732 1Z" />
                            <path d="m54.634 30.744-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm70.5 122.11-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm-95.39-96.488-2.598-1.5 1-1.732 2.598 1.5-1 1.732Zm122.11 70.5-2.598-1.5 1-1.732 2.598 1.5-1 1.732ZM23.092 73.108l-2.897-.777.517-1.932 2.898.777-.518 1.931Zm136.196 36.493-2.898-.777.518-1.932 2.898.777-.518 1.932Zm-135.678-.776-2.898.776-.518-1.932 2.898-.776.518 1.932ZM159.805 72.33l-2.897.777-.518-1.932 2.898-.776.517 1.932ZM30.744 125.366l-2.598 1.5-1-1.732 2.598-1.5 1 1.732Zm122.11-70.5-2.598 1.5-1-1.732 2.598-1.5 1 1.732Z" />
                        </g>
                        <path id="SETTING_RING_NIGHT_COLOR" fill={color('SETTING_RING_NIGHT_COLOR', 'SETTING_NIGHT_RING_NIGHT_COLOR')} d="M.544 99.885a90 90 0 0 0 178.886.224l-16.037-1.812A73.86 73.86 0 0 1 40.689 144.99a73.86 73.86 0 0 1-24.103-46.878L.544 99.885Z" />
                        <path id="SETTING_RING_DAY_COLOR" fill={color('SETTING_RING_DAY_COLOR', 'SETTING_NIGHT_RING_DAY_COLOR')} d="M179.385 79.497A90.002 90.002 0 0 0 30.515 22.46 90 90 0 0 0 .685 78.92L16.7 80.906a73.861 73.861 0 0 1 146.655.473l16.029-1.883Z" />
                        <path id="SETTING_RING_SUNRISE_COLOR" fill={color('SETTING_RING_SUNRISE_COLOR', 'SETTING_NIGHT_RING_SUNRISE_COLOR')} d="M.555 80.018a90 90 0 0 0-.15 18.51l16.066-1.53a73.86 73.86 0 0 1 .124-15.19l-16.04-1.79Z" />
                        <path id="SETTING_RING_SUNSET_COLOR" fill={color('SETTING_RING_SUNSET_COLOR', 'SETTING_NIGHT_RING_SUNSET_COLOR')} d="M179.551 98.977a89.957 89.957 0 0 0-.122-19.096l-16.036 1.815a73.892 73.892 0 0 1 .1 15.671l16.058 1.61Z" />
                        <g id="SETTING_RING_STROKE_COLOR" fill={color('SETTING_RING_STROKE_COLOR', 'SETTING_NIGHT_RING_STROKE_COLOR')}>
                            <path d="M.797 78.047a90 90 0 0 0-.37 3.189l16.063 1.572c.085-.875.187-1.747.303-2.618L.797 78.047ZM.342 97.844c.094 1.066.206 2.13.337 3.192l16.017-1.979c-.107-.871-.2-1.745-.276-2.62L.342 97.844ZM179.59 81.416a92.206 92.206 0 0 0-.364-3.19l-16 2.111c.115.871.214 1.744.298 2.618l16.066-1.54Zm-.205 19.089a87.38 87.38 0 0 0 .317-3.194L163.617 96c-.072.875-.159 1.75-.261 2.622l16.029 1.883Z" />
                            <path fillRule="evenodd" d="M90 161c39.212 0 71-31.788 71-71s-31.788-71-71-71-71 31.788-71 71 31.788 71 71 71Zm0 3c40.869 0 74-33.131 74-74 0-40.87-33.131-74-74-74-40.87 0-74 33.13-74 74 0 40.869 33.13 74 74 74Z" clipRule="evenodd" />
                        </g>
                        <path id="SETTING_SUN_FILL_COLOR" transform={isNight ? "translate(59, 153)" : undefined} fill={color('SETTING_SUN_FILL_COLOR', 'SETTING_NIGHT_SUN_FILL_COLOR')} d="M69 13.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
                        <path id="SETTING_SUN_STROKE_COLOR" transform={isNight ? "translate(59, 153)" : undefined} fill={color('SETTING_SUN_STROKE_COLOR', 'SETTING_NIGHT_SUN_STROKE_COLOR')} fillRule="evenodd" d="M60.5 19a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 3a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="144"
                        height="168"
                        viewBox="0 0 144 168"
                        fill="none"
                        className="halite-watch-preview"
                    >
                        <path id="SETTING_RING_NIGHT_COLOR" fill={color('SETTING_RING_NIGHT_COLOR', 'SETTING_NIGHT_RING_NIGHT_COLOR')} d="M0 86h144v82H0z" />
                        <path id="SETTING_RING_DAY_COLOR" fill={color('SETTING_RING_DAY_COLOR', 'SETTING_NIGHT_RING_DAY_COLOR')} d="M0 0h144v82H0z" />
                        <path id="SETTING_RING_SUNRISE_COLOR" fill={color('SETTING_RING_SUNRISE_COLOR', 'SETTING_NIGHT_RING_SUNRISE_COLOR')} d="M19 72v25H0V72h19Z" />
                        <path id="SETTING_RING_SUNSET_COLOR" fill={color('SETTING_RING_SUNSET_COLOR', 'SETTING_NIGHT_RING_SUNSET_COLOR')} d="M144 72v25h-19V72h19Z" />
                        <path id="SETTING_BG_COLOR" fill={color('SETTING_BG_COLOR', 'SETTING_NIGHT_BG_COLOR')} d="M16 16h112v136H16z" />
                        <path id="SETTING_PIP_COLOR_SECONDARY" fill={color('SETTING_PIP_COLOR_SECONDARY', 'SETTING_NIGHT_PIP_COLOR_SECONDARY')} d="M17 19.121 19.12 17l4.243 4.243-2.122 2.12L17 19.122ZM125.243 17l2.121 2.121-4.243 4.243L121 21.243 125.243 17ZM17 149.243l2.121 2.121 4.243-4.243L21.242 145 17 149.243ZM125.243 151.364l2.121-2.121-4.243-4.243-2.121 2.121 4.243 4.243ZM15.83 105.404l5.949-.783.391 2.975-5.948.783-.392-2.975ZM16.49 38.275l5.796 1.553-.777 2.897-5.795-1.553.777-2.897ZM33.275 151.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.776ZM34.827 22.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM90.595 145.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM87.621 21.779l.783-5.95 2.975.392-.784 5.95-2.974-.392ZM51.62 151.778l.784-5.948 2.974.391-.783 5.949-2.974-.392ZM54.595 15.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM106.827 152.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM105.275 21.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.777ZM122.221 104.621l5.949.783-.391 2.975-5.949-.783.391-2.975ZM121.714 39.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM15.714 127.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM16.221 60.621l5.95.783-.392 2.975-5.95-.783.392-2.975ZM122.49 126.275l5.796 1.552-.777 2.898-5.795-1.553.776-2.897ZM121.83 61.404l5.949-.783.391 2.975-5.948.783-.392-2.975Z" />
                        <path id="SETTING_PIP_COLOR_PRIMARY" fill={color('SETTING_PIP_COLOR_PRIMARY', 'SETTING_NIGHT_PIP_COLOR_PRIMARY')} d="M17 83h6v3h-6v-3ZM70 23v-5h3v5h-3ZM70 151v-6h3v6h-3ZM121 83h6v3h-6v-3Z" />
                        <g id="SETTING_RING_STROKE_COLOR" fill={color('SETTING_RING_STROKE_COLOR', 'SETTING_NIGHT_RING_STROKE_COLOR')} fillRule="evenodd" clipRule="evenodd">
                            <path d="M125 19H19v130h106V19ZM16 16v136h112V16H16Z" />
                            <path d="M0 97h19V72H0v3h16v19H0v3ZM144 72h-19v25h19v-3h-16V75h16v-3Z" />
                        </g>
                        <path id="SETTING_SUN_FILL_COLOR" transform={isNight ? "translate(53, 151)" : undefined} fill={color('SETTING_SUN_FILL_COLOR', 'SETTING_NIGHT_SUN_FILL_COLOR')} d="M52 8.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
                        <path id="SETTING_SUN_STROKE_COLOR" transform={isNight ? "translate(53, 151)" : undefined} fill={color('SETTING_SUN_STROKE_COLOR', 'SETTING_NIGHT_SUN_STROKE_COLOR')} fillRule="evenodd" d="M43.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 3a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" clipRule="evenodd" />
                    </svg>
                )}
                <div className="halite-watch-preview-content">
                    {effectiveSettings.SETTING_WIDGET_UPPER_SECONDARY && (
                        <div className={`halite-watch-preview-widget ${secondaryWidgetFontClass} upper`} style={{ color: getHex(isNight ? effectiveSettings.SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR : effectiveSettings.SETTING_SUBTEXT_SECONDARY_COLOR) }}>
                            {renderWidget(effectiveSettings.SETTING_WIDGET_UPPER_SECONDARY)}
                        </div>
                    )}
                    {effectiveSettings.SETTING_WIDGET_UPPER_PRIMARY && (
                        <div className="halite-watch-preview-widget primary upper" style={{ color: getHex(isNight ? effectiveSettings.SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR : effectiveSettings.SETTING_SUBTEXT_PRIMARY_COLOR) }}>
                            {renderWidget(effectiveSettings.SETTING_WIDGET_UPPER_PRIMARY)}
                        </div>
                    )}
                    <div className="halite-watch-time" style={{ color: color('SETTING_TIME_COLOR', 'SETTING_NIGHT_TIME_COLOR') }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="22" viewBox="0 0 80 22" fill="currentColor">
                            <path d="M0 4.48V0h8.96v17.92h4.48v4.48H0v-4.48h4.48V4.48zM16.493 22.4V0h15.68v22.4zm4.48-17.92v13.44h6.72V4.48zM36.329 22.4v-4.48h4.48v4.48zm0-13.44V4.48h4.48v4.48zM60.658 0v22.4h-15.68v-4.48h11.2v-4.48h-8.96V8.96h8.96V4.48h-11.2V0zM64.814 22.4V0h15.68v22.4zm11.2-8.96h-6.72v4.48h6.72zm-6.72-4.48h6.72V4.48h-6.72z" />
                        </svg>
                    </div>
                    {effectiveSettings.SETTING_WIDGET_LOWER_PRIMARY && (
                        <div className="halite-watch-preview-widget primary lower" style={{ color: getHex(!isNight ? effectiveSettings.SETTING_SUBTEXT_PRIMARY_COLOR : effectiveSettings.SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR) }}>
                            {renderWidget(effectiveSettings.SETTING_WIDGET_LOWER_PRIMARY)}
                        </div>
                    )}
                    {effectiveSettings.SETTING_WIDGET_LOWER_SECONDARY && (
                        <div className={`halite-watch-preview-widget ${secondaryWidgetFontClass} lower`} style={{ color: getHex(!isNight ? effectiveSettings.SETTING_SUBTEXT_SECONDARY_COLOR : effectiveSettings.SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR) }}>
                            {renderWidget(effectiveSettings.SETTING_WIDGET_LOWER_SECONDARY)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
