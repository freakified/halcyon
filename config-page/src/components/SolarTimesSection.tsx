import React from 'react';
import { useConfig } from '../context/PebbleConfigContext';
import { getDaySummary, getManualSolarError } from '../utils/solarTimes';
import { Section } from './Section';
import { TimeInput } from './TimeInput';
import { Toggle } from './Toggle';

export const SolarTimesSection: React.FC = () => {
  const { settings } = useConfig();
  const isManual = !!settings.SETTING_USE_MANUAL_SOLAR_TIMES;
  const error = getManualSolarError(settings);
  const daySummary = getDaySummary(
    settings.SETTING_MANUAL_SUNRISE_MINUTE,
    settings.SETTING_MANUAL_SUNSET_MINUTE,
  );

  return (
    <Section title="Sunrise & Sunset">
      <Toggle
        label="Manual sunrise & sunset times"
        description="Use fixed times for the ring and night theme instead of calculating them from your location"
        messageKey="SETTING_USE_MANUAL_SOLAR_TIMES"
      />
      {isManual && (
        <>
          <TimeInput label="Sunrise" messageKey="SETTING_MANUAL_SUNRISE_MINUTE" />
          <TimeInput label="Sunset" messageKey="SETTING_MANUAL_SUNSET_MINUTE" />
          {error ? (
            <div className="halite-item halite-error" role="alert">
              {error}
            </div>
          ) : (
            <div className="halite-item halite-description">{daySummary}</div>
          )}
        </>
      )}
    </Section>
  );
};
