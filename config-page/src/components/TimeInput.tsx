import React from 'react';
import { useConfig } from '../context/PebbleConfigContext';
import { minutesToTimeValue, timeValueToMinutes } from '../utils/solarTimes';
import { FormItem } from './FormItem';

type MinuteSettingKey = 'SETTING_MANUAL_SUNRISE_MINUTE' | 'SETTING_MANUAL_SUNSET_MINUTE';

interface TimeInputProps {
  label: string;
  description?: string;
  /** Setting that stores the time as minutes since midnight */
  messageKey: MinuteSettingKey;
}

export const TimeInput: React.FC<TimeInputProps> = ({ label, description, messageKey }) => {
  const { settings, updateSetting } = useConfig();
  const inputId = React.useId();
  const minutes = settings[messageKey];

  // Keep a local draft so a half-edited field isn't snapped back to the saved
  // value while the user is still typing.
  const [draft, setDraft] = React.useState(() => minutesToTimeValue(minutes));
  React.useEffect(() => setDraft(minutesToTimeValue(minutes)), [minutes]);

  return (
    <FormItem
      label={label}
      description={description}
      className="halite-text-input halite-time-input"
      htmlFor={inputId}
    >
      <input
        id={inputId}
        className="halite-input"
        type="time"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          const nextMinutes = timeValueToMinutes(event.target.value);
          if (nextMinutes !== null) updateSetting(messageKey, nextMinutes);
        }}
        onBlur={() => setDraft(minutesToTimeValue(minutes))}
      />
    </FormItem>
  );
};
