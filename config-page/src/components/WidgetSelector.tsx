import React from 'react';
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { WatchPreview } from './WatchPreview';
import { useCapabilities, useConfig } from '../context/PebbleConfigContext';
import { getWidgetOptions, WidgetOption, WIDGET_TOKENS, WidgetToken } from '../data/widgetTypes';
import { renderPreview } from '../data/i18nPreview';

type WidgetSettingKey =
    | 'SETTING_WIDGET_UPPER_SECONDARY'
    | 'SETTING_WIDGET_UPPER_PRIMARY'
    | 'SETTING_WIDGET_LOWER_PRIMARY'
    | 'SETTING_WIDGET_LOWER_SECONDARY';

const CUSTOM_VALUE = '__custom__';
const MAX_WIDGET_FORMAT_LENGTH = 47;

const isPresetValue = (value: string, options: WidgetOption[]) =>
    options.some((option) => option.value === value && option.value !== CUSTOM_VALUE);

const compareLabels = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' });

const compareCategories = (a: string, b: string) => {
    if (a === 'Custom') return 1;
    if (b === 'Custom') return -1;
    return compareLabels(a, b);
};

const sortByLabel = <T extends { label: string }>(items: T[]) =>
    [...items].sort((a, b) => compareLabels(a.label, b.label));

const groupTokens = (tokens: WidgetToken[]) => {
    const groups: Record<string, WidgetToken[]> = {};
    tokens.forEach((token) => {
        if (!groups[token.category]) groups[token.category] = [];
        groups[token.category].push(token);
    });
    return groups;
};

const getVisibleTokens = (hasHealth: boolean, hasHrm: boolean) =>
    WIDGET_TOKENS.filter((token) => {
        if (token.requires === 'health') return hasHealth;
        if (token.requires === 'hrm') return hasHrm;
        return true;
    });

interface WidgetSlotControlProps {
    label: string;
    messageKey: WidgetSettingKey;
    options: WidgetOption[];
    tokens: WidgetToken[];
    lang: number;
    isImperial: boolean;
}

interface CustomWidgetModalProps {
    isOpen: boolean;
    label: string;
    value: string;
    preview: string;
    tokens: WidgetToken[];
    onOpenChange: (isOpen: boolean) => void;
    onChange: (value: string) => void;
}

const CustomWidgetModal: React.FC<CustomWidgetModalProps> = ({
    isOpen,
    label,
    value,
    preview,
    tokens,
    onOpenChange,
    onChange,
}) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const inputId = React.useId();
    const tokenGroups = React.useMemo(() => groupTokens(tokens), [tokens]);

    React.useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isOpen]);

    const insertToken = (token: string) => {
        const input = inputRef.current;
        const start = input?.selectionStart ?? value.length;
        const end = input?.selectionEnd ?? value.length;
        const insertion = `${token} `;
        const nextValue = (value.slice(0, start) + insertion + value.slice(end)).slice(0, MAX_WIDGET_FORMAT_LENGTH);
        const nextCursor = Math.min(start + insertion.length, MAX_WIDGET_FORMAT_LENGTH);

        onChange(nextValue);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(nextCursor, nextCursor);
        });
    };

    const handleDone = (close: () => void) => {
        onChange(value.trim());
        close();
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="halite-color-modal-overlay"
            isDismissable
        >
            <Modal className="halite-color-modal widget-custom-modal">
                <Dialog className="halite-color-dialog">
                    {({ close }) => (
                        <>
                            <div className="halite-color-modal-header">
                                <Heading slot="title">{label}</Heading>
                                <Button className="halite-color-modal-close" onPress={close}>
                                    ×
                                </Button>
                            </div>
                            <div className="widget-custom-modal-content">
                                <div className="widget-custom-preview" aria-live="polite">
                                    <span>Preview</span>
                                    <strong>{preview || 'Empty'}</strong>
                                </div>
                                <label className="widget-custom-input-label" htmlFor={inputId}>Custom format</label>
                                <input
                                    ref={inputRef}
                                    id={inputId}
                                    className="halite-input widget-custom-input"
                                    value={value}
                                    maxLength={MAX_WIDGET_FORMAT_LENGTH}
                                    placeholder="Enter text or select a token..."
                                    onChange={(event) => onChange(event.target.value)}
                                    spellCheck={false}
                                />
                                <div className="widget-token-panel" aria-label={`${label} token inserter`}>
                                    {Object.entries(tokenGroups)
                                        .sort(([a], [b]) => compareCategories(a, b))
                                        .map(([category, groupTokens]) => (
                                        <div className="widget-token-group" key={category}>
                                            <div className="widget-token-group-label">{category}</div>
                                            <div className="widget-token-grid">
                                                {sortByLabel(groupTokens).map((token) => (
                                                    <button
                                                        className="widget-token-button"
                                                        key={token.token}
                                                        type="button"
                                                        onClick={() => insertToken(token.token)}
                                                        title={`Insert ${token.token}`}
                                                    >
                                                        <span>{token.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="widget-custom-footer">
                                    <Button className="widget-custom-done-button" onPress={() => handleDone(close)}>
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

const WidgetSlotControl: React.FC<WidgetSlotControlProps> = ({
    label,
    messageKey,
    options,
    tokens,
    lang,
    isImperial,
}) => {
    const { settings, updateSetting } = useConfig();
    const selectId = React.useId();
    const value = String(settings[messageKey] ?? '');
    const altLabel = String(settings.SETTING_ALT_LABEL || 'TYO');
    const altLabel2 = String(settings.SETTING_ALT_LABEL2 || 'UTC');
    const matchesPreset = isPresetValue(value, options);
    const [isCustom, setIsCustom] = React.useState(() => value !== '' && !matchesPreset);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false);
    const [lastCustomValues, setLastCustomValues] = React.useState<Partial<Record<WidgetSettingKey, string>>>({});

    React.useEffect(() => {
        if (value && !isPresetValue(value, options)) {
            setIsCustom(true);
        }
    }, [options, value]);

    const selectValue = isCustom || !matchesPreset ? CUSTOM_VALUE : value;
    const preview = renderPreview(value, lang, isImperial, altLabel, altLabel2);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextValue = event.target.value;
        if (nextValue === CUSTOM_VALUE) {
            setIsCustom(true);
            updateSetting(messageKey, lastCustomValues[messageKey] ?? '');
            setIsEditorOpen(true);
            return;
        }

        setIsCustom(false);
        updateSetting(messageKey, nextValue);
    };

    const updateCustomValue = (nextValue: string) => {
        const cappedValue = nextValue.slice(0, MAX_WIDGET_FORMAT_LENGTH);
        setIsCustom(true);
        setLastCustomValues((prev) => ({ ...prev, [messageKey]: cappedValue }));
        updateSetting(messageKey, cappedValue);
    };

    return (
        <div className="widget-slot-control">
            <label className="widget-slot-label" htmlFor={selectId}>{label}</label>
            <div className="widget-select-row">
                <select id={selectId} value={selectValue} onChange={handleSelectChange}>
                    {options
                        .filter((option) => !option.category)
                        .sort((a, b) => compareLabels(a.label, b.label))
                        .map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    {Object.entries(
                        options
                            .filter((option) => option.category)
                            .reduce<Record<string, WidgetOption[]>>((groups, option) => {
                                const category = option.category || '';
                                if (!groups[category]) groups[category] = [];
                                groups[category].push(option);
                                return groups;
                            }, {}),
                    )
                        .sort(([a], [b]) => compareCategories(a, b))
                        .map(([category, groupOptions]) => (
                        <optgroup key={category} label={category}>
                            {sortByLabel(groupOptions).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                {isCustom && (
                    <Button
                        className="widget-custom-edit-button"
                        onPress={() => setIsEditorOpen(true)}
                        aria-label={`Edit ${label} custom widget`}
                    >
                        <svg aria-hidden="true" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
                    </Button>
                )}
            </div>

            {isCustom && (
                <div className="widget-custom-editor">
                    <CustomWidgetModal
                        isOpen={isEditorOpen}
                        label={label}
                        value={value}
                        preview={preview}
                        tokens={tokens}
                        onOpenChange={setIsEditorOpen}
                        onChange={updateCustomValue}
                    />
                </div>
            )}
        </div>
    );
};

export const WidgetSelector: React.FC<{ showPreview?: boolean }> = ({ showPreview = true }) => {
    const capabilities = useCapabilities();
    const { settings } = useConfig();
    const lang = Number(settings.SETTING_LANGUAGE) || 0;
    const isImperial = Number(settings.SETTING_TEMP_UNIT) === 1;
    const altLabel = String(settings.SETTING_ALT_LABEL || 'TYO');
    const altLabel2 = String(settings.SETTING_ALT_LABEL2 || 'UTC');
    const isRound = capabilities.ROUND && !capabilities.RECT;
    const widgetOptions = React.useMemo(
        () => getWidgetOptions(lang, !!capabilities.HEALTH, !!capabilities.HRM, isImperial, altLabel, altLabel2),
        [lang, capabilities.HEALTH, capabilities.HRM, isImperial, altLabel, altLabel2],
    );
    const widgetTokens = React.useMemo(
        () => getVisibleTokens(!!capabilities.HEALTH, !!capabilities.HRM),
        [capabilities.HEALTH, capabilities.HRM],
    );

    return (
        <div className="widget-selector-container">
            {showPreview && (
                <div className={`widget-selector-preview ${isRound ? 'round' : 'rect'}`}>
                    <WatchPreview />
                </div>
            )}
            <div className="widget-selector-controls">
                <WidgetSlotControl
                    label="Upper text 2"
                    messageKey="SETTING_WIDGET_UPPER_SECONDARY"
                    options={widgetOptions}
                    tokens={widgetTokens}
                    lang={lang}
                    isImperial={isImperial}
                />
                <WidgetSlotControl
                    label="Upper text 1"
                    messageKey="SETTING_WIDGET_UPPER_PRIMARY"
                    options={widgetOptions}
                    tokens={widgetTokens}
                    lang={lang}
                    isImperial={isImperial}
                />
                <WidgetSlotControl
                    label="Lower text 1"
                    messageKey="SETTING_WIDGET_LOWER_PRIMARY"
                    options={widgetOptions}
                    tokens={widgetTokens}
                    lang={lang}
                    isImperial={isImperial}
                />
                <WidgetSlotControl
                    label="Lower text 2"
                    messageKey="SETTING_WIDGET_LOWER_SECONDARY"
                    options={widgetOptions}
                    tokens={widgetTokens}
                    lang={lang}
                    isImperial={isImperial}
                />
            </div>
        </div>
    );
};
