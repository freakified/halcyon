export interface City {
  name: string;
  displayName: string;
  abbreviation: string;
  timezone: string;
  offset: number;
}

export const CITIES: City[] = [
  { name: "PAGO PAGO", displayName: "Pago Pago", abbreviation: "PPG", timezone: "America/Pacific", offset: -660 },
  { name: "HONOLULU", displayName: "Honolulu", abbreviation: "HNL", timezone: "America/Pacific", offset: -600 },
  { name: "ANCHORAGE", displayName: "Anchorage", abbreviation: "ANC", timezone: "America/Anchorage", offset: -540 },
  { name: "VANCOUVER", displayName: "Vancouver", abbreviation: "YVR", timezone: "America/Vancouver", offset: -480 },
  { name: "SAN FRANCISCO", displayName: "San Francisco", abbreviation: "SFO", timezone: "America/Los_Angeles", offset: -480 },
  { name: "PHOENIX", displayName: "Phoenix", abbreviation: "PHX", timezone: "America/Phoenix", offset: -480 },
  { name: "EDMONTON", displayName: "Edmonton", abbreviation: "YEG", timezone: "America/Edmonton", offset: -420 },
  { name: "DENVER", displayName: "Denver", abbreviation: "DEN", timezone: "America/Denver", offset: -420 },
  { name: "MEXICO CITY", displayName: "Mexico City", abbreviation: "MEX", timezone: "America/Mexico_City", offset: -360 },
  { name: "CHICAGO", displayName: "Chicago", abbreviation: "CHI", timezone: "America/Chicago", offset: -360 },
  { name: "NEW YORK", displayName: "New York", abbreviation: "NYC", timezone: "America/New_York", offset: -300 },
  { name: "SANTIAGO", displayName: "Santiago", abbreviation: "SCL", timezone: "America/Santiago", offset: -240 },
  { name: "HALIFAX", displayName: "Halifax", abbreviation: "YHZ", timezone: "America/Halifax", offset: -240 },
  { name: "ST. JOHNS", displayName: "St. John's", abbreviation: "YYT", timezone: "America/St_Johns", offset: -210 },
  { name: "RIO DE JANEIRO", displayName: "Rio de Janeiro", abbreviation: "RIO", timezone: "America/Sao_Paulo", offset: -180 },
  { name: "F. DE NORONHA", displayName: "F. de Noronha", abbreviation: "FDN", timezone: "America/Noronha", offset: -120 },
  { name: "PRAIA", displayName: "Praia", abbreviation: "RAI", timezone: "Atlantic/Cape_Verde", offset: -60 },
  { name: "UTC", displayName: "UTC", abbreviation: "UTC", timezone: "UTC", offset: 0 },
  { name: "LISBON", displayName: "Lisbon", abbreviation: "LIS", timezone: "Europe/Lisbon", offset: 0 },
  { name: "LONDON", displayName: "London", abbreviation: "LON", timezone: "Europe/London", offset: 0 },
  { name: "MADRID", displayName: "Madrid", abbreviation: "MAD", timezone: "Europe/Madrid", offset: 60 },
  { name: "PARIS", displayName: "Paris", abbreviation: "PAR", timezone: "Europe/Paris", offset: 60 },
  { name: "ROME", displayName: "Rome", abbreviation: "ROM", timezone: "Europe/Rome", offset: 60 },
  { name: "BERLIN", displayName: "Berlin", abbreviation: "BER", timezone: "Europe/Berlin", offset: 60 },
  { name: "STOCKHOLM", displayName: "Stockholm", abbreviation: "STO", timezone: "Europe/Stockholm", offset: 60 },
  { name: "ATHENS", displayName: "Athens", abbreviation: "ATH", timezone: "Europe/Athens", offset: 120 },
  { name: "CAIRO", displayName: "Cairo", abbreviation: "CAI", timezone: "Africa/Cairo", offset: 120 },
  { name: "JERUSALEM", displayName: "Jerusalem", abbreviation: "JRS", timezone: "Asia/Jerusalem", offset: 120 },
  { name: "MOSCOW", displayName: "Moscow", abbreviation: "MOW", timezone: "Europe/Moscow", offset: 180 },
  { name: "JEDDAH", displayName: "Jeddah", abbreviation: "JED", timezone: "Asia/Riyadh", offset: 180 },
  { name: "TEHRAN", displayName: "Tehran", abbreviation: "THR", timezone: "Asia/Tehran", offset: 210 },
  { name: "DUBAI", displayName: "Dubai", abbreviation: "DXB", timezone: "Asia/Dubai", offset: 240 },
  { name: "KABUL", displayName: "Kabul", abbreviation: "KBL", timezone: "Asia/Kabul", offset: 270 },
  { name: "KARACHI", displayName: "Karachi", abbreviation: "KHI", timezone: "Asia/Karachi", offset: 300 },
  { name: "DELHI", displayName: "Delhi", abbreviation: "DEL", timezone: "Asia/Kolkata", offset: 330 },
  { name: "KATHMANDU", displayName: "Kathmandu", abbreviation: "KTM", timezone: "Asia/Kathmandu", offset: 345 },
  { name: "DHAKA", displayName: "Dhaka", abbreviation: "DAC", timezone: "Asia/Dhaka", offset: 360 },
  { name: "YANGON", displayName: "Yangon", abbreviation: "RGN", timezone: "Asia/Yangon", offset: 390 },
  { name: "BANGKOK", displayName: "Bangkok", abbreviation: "BKK", timezone: "Asia/Bangkok", offset: 420 },
  { name: "SINGAPORE", displayName: "Singapore", abbreviation: "SIN", timezone: "Asia/Singapore", offset: 480 },
  { name: "HONG KONG", displayName: "Hong Kong", abbreviation: "HKG", timezone: "Asia/Hong_Kong", offset: 480 },
  { name: "BEIJING", displayName: "Beijing", abbreviation: "BJS", timezone: "Asia/Shanghai", offset: 480 },
  { name: "TAIPEI", displayName: "Taipei", abbreviation: "TPE", timezone: "Asia/Taipei", offset: 480 },
  { name: "SEOUL", displayName: "Seoul", abbreviation: "SEL", timezone: "Asia/Seoul", offset: 540 },
  { name: "TOKYO", displayName: "Tokyo", abbreviation: "TYO", timezone: "Asia/Tokyo", offset: 540 },
  { name: "ADELAIDE", displayName: "Adelaide", abbreviation: "ADL", timezone: "Australia/Adelaide", offset: 570 },
  { name: "GUAM", displayName: "Guam", abbreviation: "GUM", timezone: "Pacific/Guam", offset: 600 },
  { name: "SYDNEY", displayName: "Sydney", abbreviation: "SYD", timezone: "Australia/Sydney", offset: 600 },
  { name: "NOUMEA", displayName: "Noumea", abbreviation: "NOU", timezone: "Pacific/Noumea", offset: 660 },
  { name: "WELLINGTON", displayName: "Wellington", abbreviation: "WLG", timezone: "Pacific/Auckland", offset: 720 }
];

export const getCityByName = (name: string | undefined): City =>
  CITIES.find((city) => city.name === name) ?? CITIES.find((city) => city.name === 'UTC') ?? CITIES[0];

export const formatStandardOffset = (offset: number): string => {
  if (offset === 0) return 'UTC';
  const sign = offset > 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
};
