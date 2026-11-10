import React from 'react';
import { useConfig } from '../context/PebbleConfigContext';
import { legacyCityForZone } from '../data/legacyCities';
import { defaultAltLabel, timeZoneOptions, withTimeZoneValue } from '../data/timeZones';
import { Section } from './Section';
import { Select } from './Select';
import { TextInput } from './TextInput';

type AltTimezoneZoneKey = 'SETTING_ALT_ZONE' | 'SETTING_ALT_ZONE2';
type AltTimezoneCityKey = 'SETTING_ALT_CITY' | 'SETTING_ALT_CITY2';
type AltTimezoneLabelKey = 'SETTING_ALT_LABEL' | 'SETTING_ALT_LABEL2';

interface AltTimezoneSectionProps {
  title: string;
  zoneKey: AltTimezoneZoneKey;
  cityKey: AltTimezoneCityKey;
  labelKey: AltTimezoneLabelKey;
}

const ALT_LABEL_MAX_LENGTH = 6;

const normalizeAltLabel = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ALT_LABEL_MAX_LENGTH);

export const AltTimezoneSection: React.FC<AltTimezoneSectionProps> = ({
  title,
  zoneKey,
  cityKey,
  labelKey,
}) => {
  const { settings, updateSetting } = useConfig();
  const zoneOptions = React.useMemo(() => timeZoneOptions(), []);
  const zone = String(settings[zoneKey]);

  const handleZoneChange = (value: string) => {
    updateSetting(zoneKey, value);
    updateSetting(labelKey, defaultAltLabel(value));

    // an app that predates zones only reads the city
    const legacyCity = legacyCityForZone(value);
    if (legacyCity) updateSetting(cityKey, legacyCity);
  };

  return (
    <Section title={title}>
      <Select
        label="Time Zone"
        messageKey={zoneKey}
        options={withTimeZoneValue(zoneOptions, zone)}
        value={zone}
        onChange={handleZoneChange}
        className="halite-alt-time-control"
      />
      <TextInput
        label="Label"
        messageKey={labelKey}
        value={String(settings[labelKey] ?? defaultAltLabel(zone))}
        maxLength={ALT_LABEL_MAX_LENGTH}
        normalizeValue={normalizeAltLabel}
        spellCheck={false}
        className="halite-alt-time-control"
      />
    </Section>
  );
};
