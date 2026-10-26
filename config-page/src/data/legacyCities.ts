/*
 * Halcyon used to store the alternate time zones as one of these city names.
 * The app converts them to zones (src/pkjs/legacy_cities.js, which this must
 * match), but this page can also be opened from an app that hasn't updated
 * yet, so it converts them on the way in and keeps the city key current on
 * the way out.
 *
 * Safe to delete once old installs have had time to update.
 */

export const LEGACY_CITY_ZONES: Record<string, string> = {
  'PAGO PAGO': 'Pacific/Pago_Pago',
  HONOLULU: 'Pacific/Honolulu',
  ANCHORAGE: 'America/Anchorage',
  VANCOUVER: 'America/Vancouver',
  'SAN FRANCISCO': 'America/Los_Angeles',
  EDMONTON: 'America/Edmonton',
  DENVER: 'America/Denver',
  'MEXICO CITY': 'America/Mexico_City',
  CHICAGO: 'America/Chicago',
  'NEW YORK': 'America/New_York',
  SANTIAGO: 'America/Santiago',
  HALIFAX: 'America/Halifax',
  'ST. JOHNS': 'America/St_Johns',
  'RIO DE JANEIRO': 'America/Sao_Paulo',
  'F. DE NORONHA': 'America/Noronha',
  PRAIA: 'Atlantic/Cape_Verde',
  UTC: 'UTC',
  LISBON: 'Europe/Lisbon',
  LONDON: 'Europe/London',
  MADRID: 'Europe/Madrid',
  PARIS: 'Europe/Paris',
  ROME: 'Europe/Rome',
  BERLIN: 'Europe/Berlin',
  STOCKHOLM: 'Europe/Stockholm',
  ATHENS: 'Europe/Athens',
  CAIRO: 'Africa/Cairo',
  JERUSALEM: 'Asia/Jerusalem',
  MOSCOW: 'Europe/Moscow',
  JEDDAH: 'Asia/Riyadh',
  TEHRAN: 'Asia/Tehran',
  DUBAI: 'Asia/Dubai',
  KABUL: 'Asia/Kabul',
  KARACHI: 'Asia/Karachi',
  DELHI: 'Asia/Kolkata',
  KATHMANDU: 'Asia/Kathmandu',
  DHAKA: 'Asia/Dhaka',
  YANGON: 'Asia/Yangon',
  BANGKOK: 'Asia/Bangkok',
  SINGAPORE: 'Asia/Singapore',
  'HONG KONG': 'Asia/Hong_Kong',
  BEIJING: 'Asia/Shanghai',
  TAIPEI: 'Asia/Taipei',
  SEOUL: 'Asia/Seoul',
  TOKYO: 'Asia/Tokyo',
  ADELAIDE: 'Australia/Adelaide',
  GUAM: 'Pacific/Guam',
  SYDNEY: 'Australia/Sydney',
  NOUMEA: 'Pacific/Noumea',
  WELLINGTON: 'Pacific/Auckland',
};

const ALT_KEYS = [
  { cityKey: 'SETTING_ALT_CITY', zoneKey: 'SETTING_ALT_ZONE' },
  { cityKey: 'SETTING_ALT_CITY2', zoneKey: 'SETTING_ALT_ZONE2' },
] as const;

/** Fills in zones for settings that only have the old city names. */
export const migrateLegacyCities = (settings: Record<string, unknown>): Record<string, unknown> => {
  const migrated = { ...settings };
  for (const { cityKey, zoneKey } of ALT_KEYS) {
    const zone = LEGACY_CITY_ZONES[String(migrated[cityKey])];
    if (!migrated[zoneKey] && zone) migrated[zoneKey] = zone;
  }
  return migrated;
};

/** The old city name for a zone, if it had one, for apps that predate zones. */
export const legacyCityForZone = (zone: string): string | undefined =>
  Object.keys(LEGACY_CITY_ZONES).find((city) => LEGACY_CITY_ZONES[city] === zone);
