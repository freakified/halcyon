// Preview-only i18n helpers for the config page.

import { DEFAULT_DATE_FORMATS } from './dateFormats';

const LOCALE_BY_INDEX: string[] = [
  'en-us', 'fr-fr', 'de-de', 'es-es', 'it-it', 'nl-nl', 'tr-tr', 'cs-cz', 'pt-pt', 'el-gr',
  'sv-se', 'pl-pl', 'sk-sk', 'vi-vn', 'ro-ro', 'ca-es', 'nb-no', 'ru-ru', 'et-ee', 'eu-es',
  'fi-fi', 'da-dk', 'lt-lt', 'sl-si', 'hu-hu', 'hr-hr', 'ga-ie', 'lv-lv', 'sr-rs', 'zh-cn',
  'id-id', 'uk-ua', 'cy-gb', 'gl-es', 'ja-jp', 'ko-kr', 'he-il', 'en-gb',
];

// Short/uppercase labels per language, mirroring src/pkjs/languages.js LABELS.
// Used for {steps_label}, {day_label}, {week_label}, and {t:KEY} labels.
const STEPS_LABELS = ["STEPS", "PAS", "SCHRITTE", "PASOS", "PASSI", "STAPPEN", "ADIMLAR", "KROKY", "PASSOS", "ΒΗΜΑΤΑ", "STEG", "KROKI", "KROKY", "BƯỚC", "PAȘI", "PASSOS", "SKRITT", "ШАГИ", "SAMMUD", "URRATSAK", "ASKELTA", "TRIN", "ŽINGSNIAI", "KORAKI", "LÉPÉSEK", "KORACI", "CÉIMEANNA", "SOĻI", "KORACI", "步数", "LANGKAH", "КРОКИ", "CAMAU", "PASOS", "歩数", "걸음", "צעדים", "STEPS"];
const DAY_LABELS = ["DAY", "JOUR", "TAG", "DÍA", "GIORNO", "DAG", "GÜN", "DEN", "DIA", "ΗΜΕΡΑ", "DAG", "DZIEŃ", "DEŇ", "NGÀY", "ZI", "DIA", "DAG", "ДЕН", "PÄEV", "EGUN", "PÄIVÄ", "DAG", "PARA", "DAN", "NAP", "DAN", "LÁ", "DIENA", "DAN", "天", "HARI", "ДЕНЬ", "DIWR", "DÍA", "日", "일", "יום", "DAY"];
const WEEK_LABELS = ["WEEK", "SEM", "W", "SEM", "SETT", "WK", "HF", "TÝD", "SEM", "ΕΒΔ", "V", "TYDZ", "TÝŽ", "TUẦN", "SĂPT", "SETM", "UKE", "НЕД", "NÄD", "AST", "VK", "UGE", "SAV", "TED", "HÉT", "TJ", "SCHT", "NED", "NED", "周", "MING", "ТИЖ", "WNOS", "SEM", "週", "주", "שב", "WEEK"];
const BATTERY_LABELS = ["BATTERY", "BATTERIE", "AKKU", "BATERÍA", "BATTERIA", "BATTERIJ", "PİL", "BATERIE", "BATERIA", "ΜΠΑΤΑΡΙΑ", "BATTERI", "BATERIA", "BATÉRIA", "PIN", "BATERIE", "BATERIA", "BATTERI", "ЗАРЯД", "AKU", "BATERIA", "AKKU", "BATTERI", "BATERIJA", "BATERIJA", "AKKU", "BATERIJA", "CEALLRA", "BATERIJA", "BATERIJA", "电量", "BATERAI", "БАТАРЕЯ", "BATRI", "BATERÍA", "バッテリー", "배터리", "סוללה", "BATTERY"];
const HUMIDITY_LABELS = ["HUMIDITY", "HUMIDITÉ", "FEUCHT", "HUMEDAD", "UMIDITÀ", "VOCHT", "NEM", "VLHKOST", "UMIDADE", "ΥΓΡΑΣΙΑ", "FUKT", "WILGOTN.", "VLHKOSŤ", "ĐỘ ẨM", "UMIDITATE", "HUMITAT", "FUKT", "ВЛАЖН", "NIISKUS", "HEZETASUNA", "KOSTEUS", "FUGT", "DRĖGMĖ", "VLAGA", "PÁRA", "VLAGA", "TAISE", "MITRUMS", "VLAGA", "湿度", "LEMBAP", "ВОЛОГ.", "LLEITHDER", "HUMIDADE", "湿度", "습도", "לחות", "HUMIDITY"];
const DPT_LABELS = ["DPT", "PT ROSÉE", "TAUPKT", "ROCÍO", "RUGIADA", "DAUWP", "ÇİY", "ROSNÝ B", "ORVALHO", "Σ. ΔΡΟΣΟΥ", "DAGGP", "PKT ROSY", "ROSNÝ B", "SƯƠNG", "ROUĂ", "ROSADA", "DUGGPKT", "РОСА", "KASTE", "IHINTZ", "KASTE", "DUGPUNKT", "RASA", "ROSIŠČE", "HARMATP", "ROSIŠTE", "DRÚCHT", "RASA", "ROSA", "露点", "EMBUN", "Т.РОСИ", "GWLITH", "ORBALLO", "露点", "이슬점", "נק׳ טל", "DPT"];
const RISE_LABELS = ["RISE", "LEVER", "AUFGANG", "SALIDA", "ALBA", "OPKOMST", "DOĞUŞ", "VÝCHOD", "NASCER", "ΑΝΑΤΟΛΗ", "UPPGÅNG", "WSCHÓD", "VÝCHOD", "MỌC", "RĂSĂRIT", "SORTIDA", "SOL OPP", "ВОСХОД", "PÄIK. TÕUS", "EGUNSENTI", "AUR. NOUSU", "SOL OP", "TEKA", "VZHOD", "NAPKELTE", "IZLAZAK", "ÉIRÍ", "LEC", "IZLAZAK", "日出", "TERBIT", "СХІД", "CODI", "SAÍDA", "日の出", "일출", "זריחה", "RISE"];
const SET_LABELS = ["SET", "COUCHER", "UNTERGANG", "PUESTA", "TRAMONTO", "ONDER", "BATIŞ", "ZÁPAD", "PÔR", "ΔΥΣΗ", "NEDGÅNG", "ZACHÓD", "ZÁPAD", "LẶN", "APUS", "POSTA", "SOL NED", "ЗАХОД", "LOOJANG", "ILUNABAR", "AUR. LASKU", "SOL NED", "LEIDŽIASI", "ZAHOD", "NAPNYUGTA", "ZALAZAK", "DUL SÍOS", "RIET", "ZALAZAK", "日落", "TERBENAM", "ЗАХІД", "MACHLUD", "POSTA", "日没", "일몰", "שקיעה", "SET"];
const RAIN_LABELS = ["RAIN", "PLUIE", "REGEN", "LLUVIA", "PIOGGIA", "REGEN", "YAĞMUR", "DÉŠŤ", "CHUVA", "ΒΡΟΧΗ", "REGN", "DESZCZ", "DÁŽĎ", "MƯA", "PLOAIE", "PLUJA", "REGN", "ДОЖДЬ", "VIHM", "EURIA", "SADE", "REGN", "LIETUS", "DEŽ", "ESŐ", "KIŠA", "BÁISTEACH", "LIETUS", "KIŠA", "雨", "HUJAN", "ДОЩ", "GLAW", "CHUVIA", "雨", "비", "גשם", "RAIN"];
const UV_LABELS = ["UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV", "UV"];
const BPM_LABELS = ["BPM", "BPM", "BPM", "PPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "УД/МИН", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "BPM", "次/分", "BPM", "УД/ХВ", "BPM", "BPM", "拍/分", "BPM", "פעימות", "BPM"];

const TRANSLATIONS: Record<string, string[]> = {
  STEPS: STEPS_LABELS,
  DAY: DAY_LABELS,
  WEEK: WEEK_LABELS,
  BATTERY: BATTERY_LABELS,
  HUMIDITY: HUMIDITY_LABELS,
  DPT: DPT_LABELS,
  RISE: RISE_LABELS,
  SET: SET_LABELS,
  RAIN: RAIN_LABELS,
  UV: UV_LABELS,
  BPM: BPM_LABELS,
};
// Sample weather condition (WMO code 0, "Clear") for previews. Mirrors
// src/pkjs/languages.js WEATHER_CODES[0]. Only one condition is needed since
// the preview never sees real weather data.
const SAMPLE_CONDITION = ["CLEAR", "DÉGAGÉ", "KLAR", "DESPEJADO", "SERENO", "HELDER", "AÇIK", "JASNO", "LIMPO", "ΑΙΘΡΙΟΣ", "KLART", "CZYSTO", "JASNO", "TRỜI QUANG", "SENIN", "CLAR", "KLART", "ЯСНО", "SELGE", "GARBI", "SELKEÄÄ", "KLART", "GIEDRA", "JASNO", "TISZTA", "VEDRO", "GLAN", "SKAIDRS", "VEDRO", "晴朗", "CERAH", "ЯСНО", "CLIR", "CLARO", "快晴", "맑음", "בהיר", "CLEAR"];

// Sample wind direction (NW, cardinal index 7) per language. Mirrors index 7 of
// each row in src/pkjs/languages.js CARDINALS.
const SAMPLE_CARDINAL = ["NW", "NO", "NW", "NO", "NO", "NW", "KB", "SZ", "NO", "ΒΔ", "NV", "NW", "SZ", "TB", "NV", "NO", "NV", "СЗ", "LO", "IM", "LU", "NV", "ŠV", "SZ", "ÉNY", "SZ", "TI", "ZR", "SZ", "西北", "BL", "ПнЗ", "GG", "NO", "北西", "북서", "צמ׳", "NW"];

const safeIdx = (i: number) => (i >= 0 && i < 38 ? i : 0);

const intlFmt = (date: Date, lang: number, opts: Intl.DateTimeFormatOptions): string => {
  const locale = LOCALE_BY_INDEX[safeIdx(lang)];
  try {
    return new Intl.DateTimeFormat(locale, opts).format(date);
  } catch {
    return new Intl.DateTimeFormat('en', opts).format(date);
  }
};

// Pad a number to two digits.
const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n);

// ISO 8601 week number (matches strftime %V on the watch).
const isoWeek = (d: Date): number => {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = (target.getTime() - firstThursday.getTime()) / 86400000;
  return 1 + Math.round((diff - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
};

const dayOfYear = (d: Date): number => {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
};

const sampleNextSolarEvent = (now: Date, idx: number) => {
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const sunriseMinute = 6 * 60 + 42;
  const sunsetMinute = 18 * 60 + 18;
  const isSunriseNext = currentMinute < sunriseMinute || currentMinute >= sunsetMinute;

  return {
    label: isSunriseNext ? TRANSLATIONS.RISE[idx] : TRANSLATIONS.SET[idx],
    time: isSunriseNext ? '6:42' : '18:18',
  };
};

// Decimal separator per language (mirrors src/c/languages.c decimalSeparator[]).
const DECIMAL_SEPARATORS: string[] = [
    /*  0 en */ '.', /*  1 fr */ ',', /*  2 de */ ',', /*  3 es */ ',',
    /*  4 it */ ',', /*  5 nl */ ',', /*  6 tr */ ',', /*  7 cs */ ',',
    /*  8 pt */ ',', /*  9 el */ ',', /* 10 sv */ ',', /* 11 pl */ ',',
    /* 12 sk */ ',', /* 13 vi */ ',', /* 14 ro */ ',', /* 15 ca */ ',',
    /* 16 no */ ',', /* 17 ru */ ',', /* 18 et */ ',', /* 19 eu */ ',',
    /* 20 fi */ ',', /* 21 da */ ',', /* 22 lt */ ',', /* 23 sl */ ',',
    /* 24 hu */ ',', /* 25 hr */ ',', /* 26 ga */ '.', /* 27 lv */ ',',
    /* 28 sr */ ',', /* 29 zh */ '.', /* 30 id */ ',', /* 31 uk */ ',',
    /* 32 cy */ '.', /* 33 gl */ ',', /* 34 ja */ '.', /* 35 ko */ '.',
    /* 36 he */ '.', /* 37 en-GB */ '.',
];

export const getDecimalSeparator = (lang: number): string =>
  DECIMAL_SEPARATORS[safeIdx(lang)];

// Substitute tokens in a format string using sample values, language-aware.
// This matches what the watch will render, close enough for a preview.
export const renderPreview = (
  formatStr: string,
  lang: number,
  isImperial: boolean = false,
  altLabel: string = 'TYO',
  altLabel2: string = 'UTC',
): string => {
  if (!formatStr) return '';
  const idx = safeIdx(lang);
  const now = new Date();
  const nextSolar = sampleNextSolarEvent(now, idx);

  // Expand the {local_date} super-token first so its inner tokens fall
  // through to the normal substitution loop. Mirrors widgets.c behavior.
  if (formatStr.indexOf('{local_date}') !== -1) {
    formatStr = formatStr.split('{local_date}').join(DEFAULT_DATE_FORMATS[idx]);
  }

  const dayName = intlFmt(now, lang, { weekday: 'short' }).toUpperCase().replace(/\.$/, '');
  const monthName = intlFmt(now, lang, { month: 'short' }).toUpperCase().replace(/\.$/, '');
  const dec = getDecimalSeparator(lang);
  const safeAltLabel = altLabel || 'TYO';
  const safeAltLabel2 = altLabel2 || 'UTC';

  const replacements: Record<string, string> = {
    // Date / time tokens (C-side)
    '{day_name}': dayName,
    '{month_name}': monthName,
    '{day0}': pad2(now.getDate()),
    '{day}': String(now.getDate()),
    '{month_num}': pad2(now.getMonth() + 1),
    '{year}': String(now.getFullYear()),
    '{day_of_year}': String(dayOfYear(now)),
    '{week_of_year}': String(isoWeek(now)),
    '{alt_tz}': `${safeAltLabel} 7:38`,
    '{alt_tz_label}': safeAltLabel,
    '{alt_tz_time}': '7:38',
    '{alt_tz_day}': 'FRI',
    '{alt_tz2}': `${safeAltLabel2} 22:38`,
    '{alt_tz2_label}': safeAltLabel2,
    '{alt_tz2_time}': '22:38',
    '{alt_tz2_day}': 'THU',
    // Health / device (C-side)
    '{steps}': '1234',
    '{dist}': '0' + dec + '8',
    '{dist_unit}': isImperial ? 'MI' : 'KM',
    '{hr}': '72',
    '{batt}': '85',
    // Solar / weather (PKJS-side)
    '{sunrise}': '6:42',
    '{sunset}': '18:18',
    '{next_solar}': `${nextSolar.label} ${nextSolar.time}`,
    '{next_solar_label}': nextSolar.label,
    '{next_solar_time}': nextSolar.time,
    '{temp}': isImperial ? '64' : '18',
    '{thi}': isImperial ? '72' : '22',
    '{tlo}': isImperial ? '57' : '14',
    '{cond}': SAMPLE_CONDITION[idx],
    '{cond_day}': SAMPLE_CONDITION[idx],
    '{hum}': '65',
    '{wind}': '12',
    '{wind_unit}': isImperial ? 'MPH' : 'KM/H',
    '{wind_dir}': SAMPLE_CARDINAL[idx],
    '{uv}': '6',
    '{rain}': '0' + dec + '0',
    '{pop}': '30',
    '{dew}': isImperial ? '54' : '12',
    '{temp_unit}': isImperial ? '°F' : '°C',
  };

  let out = formatStr;
  for (const [token, value] of Object.entries(replacements)) {
    out = out.split(token).join(value);
  }
  
  // Universal translation token substitution {t:KEY}
  out = out.replace(/\{t:([A-Z_]+)\}/g, (match, key) => {
    return TRANSLATIONS[key] ? TRANSLATIONS[key][idx] : match;
  });

  // Strip any unrecognized {tokens} so previews don't show raw braces.
  out = out.replace(/\{[a-z_:%]+\}/gi, '');
  return out;
};
