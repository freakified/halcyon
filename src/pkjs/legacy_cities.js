// ---- Pre-IANA world time settings ----
//
// Halcyon used to store the alternate time zones as one of these city names
// (SETTING_ALT_CITY / SETTING_ALT_CITY2). They're converted to IANA zone ids
// once, on the phone. The label is what the watch was showing for the city,
// for settings saved without one. Must match config-page/src/data/legacyCities.ts.
//
// Safe to delete once old installs have had time to update.

var LEGACY_CITIES = {
  'PAGO PAGO':      { zone: 'Pacific/Pago_Pago',   label: 'PPG' },
  'HONOLULU':       { zone: 'Pacific/Honolulu',    label: 'HNL' },
  'ANCHORAGE':      { zone: 'America/Anchorage',   label: 'ANC' },
  'VANCOUVER':      { zone: 'America/Vancouver',   label: 'YVR' },
  'SAN FRANCISCO':  { zone: 'America/Los_Angeles', label: 'SFO' },
  'EDMONTON':       { zone: 'America/Edmonton',    label: 'YEG' },
  'DENVER':         { zone: 'America/Denver',      label: 'DEN' },
  'MEXICO CITY':    { zone: 'America/Mexico_City', label: 'MEX' },
  'CHICAGO':        { zone: 'America/Chicago',     label: 'CHI' },
  'NEW YORK':       { zone: 'America/New_York',    label: 'NYC' },
  'SANTIAGO':       { zone: 'America/Santiago',    label: 'SCL' },
  'HALIFAX':        { zone: 'America/Halifax',     label: 'YHZ' },
  'ST. JOHNS':      { zone: 'America/St_Johns',    label: 'YYT' },
  'RIO DE JANEIRO': { zone: 'America/Sao_Paulo',   label: 'RIO' },
  'F. DE NORONHA':  { zone: 'America/Noronha',     label: 'FDN' },
  'PRAIA':          { zone: 'Atlantic/Cape_Verde', label: 'RAI' },
  'UTC':            { zone: 'UTC',                 label: 'UTC' },
  'LISBON':         { zone: 'Europe/Lisbon',       label: 'LIS' },
  'LONDON':         { zone: 'Europe/London',       label: 'LON' },
  'MADRID':         { zone: 'Europe/Madrid',       label: 'MAD' },
  'PARIS':          { zone: 'Europe/Paris',        label: 'PAR' },
  'ROME':           { zone: 'Europe/Rome',         label: 'ROM' },
  'BERLIN':         { zone: 'Europe/Berlin',       label: 'BER' },
  'STOCKHOLM':      { zone: 'Europe/Stockholm',    label: 'STO' },
  'ATHENS':         { zone: 'Europe/Athens',       label: 'ATH' },
  'CAIRO':          { zone: 'Africa/Cairo',        label: 'CAI' },
  'JERUSALEM':      { zone: 'Asia/Jerusalem',      label: 'JRS' },
  'MOSCOW':         { zone: 'Europe/Moscow',       label: 'MOW' },
  'JEDDAH':         { zone: 'Asia/Riyadh',         label: 'JED' },
  'TEHRAN':         { zone: 'Asia/Tehran',         label: 'THR' },
  'DUBAI':          { zone: 'Asia/Dubai',          label: 'DXB' },
  'KABUL':          { zone: 'Asia/Kabul',          label: 'KBL' },
  'KARACHI':        { zone: 'Asia/Karachi',        label: 'KHI' },
  'DELHI':          { zone: 'Asia/Kolkata',        label: 'DEL' },
  'KATHMANDU':      { zone: 'Asia/Kathmandu',      label: 'KTM' },
  'DHAKA':          { zone: 'Asia/Dhaka',          label: 'DAC' },
  'YANGON':         { zone: 'Asia/Yangon',         label: 'RGN' },
  'BANGKOK':        { zone: 'Asia/Bangkok',        label: 'BKK' },
  'SINGAPORE':      { zone: 'Asia/Singapore',      label: 'SIN' },
  'HONG KONG':      { zone: 'Asia/Hong_Kong',      label: 'HKG' },
  'BEIJING':        { zone: 'Asia/Shanghai',       label: 'BJS' },
  'TAIPEI':         { zone: 'Asia/Taipei',         label: 'TPE' },
  'SEOUL':          { zone: 'Asia/Seoul',          label: 'SEL' },
  'TOKYO':          { zone: 'Asia/Tokyo',          label: 'TYO' },
  'ADELAIDE':       { zone: 'Australia/Adelaide',  label: 'ADL' },
  'GUAM':           { zone: 'Pacific/Guam',        label: 'GUM' },
  'SYDNEY':         { zone: 'Australia/Sydney',    label: 'SYD' },
  'NOUMEA':         { zone: 'Pacific/Noumea',      label: 'NOU' },
  'WELLINGTON':     { zone: 'Pacific/Auckland',    label: 'WLG' }
};

// Moves an old city setting over to its zone (keeping any label the user
// had). Settings that already have a zone keep it; the city key is dropped
// either way. Returns true if `settings` changed.
function migrate(settings, cityKey, zoneKey, labelKey) {
  if (!settings || settings[cityKey] === undefined) return false;

  var city = LEGACY_CITIES[settings[cityKey]];
  if (!settings[zoneKey] && city) {
    settings[zoneKey] = city.zone;
    if (!settings[labelKey]) {
      settings[labelKey] = city.label;
    }
  }

  delete settings[cityKey];
  return true;
}

module.exports = {
  migrate: migrate
};
