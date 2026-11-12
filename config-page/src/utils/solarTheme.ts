import type { Settings } from '../context/types';

// Integer math mirrors src/c/solar_theme.c; parity is checked by test:solar.
const ease = (value: number) => {
  const p = Math.max(0, Math.min(256, value));
  return Math.floor(p * p * (768 - 2 * p) / 65536);
};

export function solarThemeState(minute: number, sunrise: number, sunset: number) {
  minute = ((minute % 1440) + 1440) % 1440;
  const idle = (night: boolean) => ({ night, event: 0, stage: 0, weight: 0, progress: 0 });
  if (![sunrise, sunset].every(v => Number.isInteger(v) && v >= 0 && v < 1440) || sunrise === sunset) {
    return idle(minute >= sunset || minute < sunrise);
  }
  const day = (sunset - sunrise + 1440) % 1440;
  const night = (minute - sunrise + 1440) % 1440 >= day;
  const window = Math.min(45, Math.floor(day / 2), Math.floor((1440 - day) / 2));
  const distance = (event: number) => {
    const d = (minute - event + 1440) % 1440;
    return d > 720 ? 1440 - d : d;
  };
  const rise = distance(sunrise), set = distance(sunset);
  if (!window || Math.min(rise, set) >= window) return idle(night);
  let offset = (minute - (rise < set ? sunrise : sunset) + 1440) % 1440;
  if (offset > 720) offset -= 1440;
  const elapsed = offset + window, duration = 2 * window;
  return { night, event: rise < set ? 1 : 2, stage: Math.floor(elapsed * 3 / duration),
    weight: ease(Math.floor((elapsed * 3 % duration) * 256 / duration)),
    progress: Math.floor(elapsed * 256 / duration) };
}
export type SolarState = ReturnType<typeof solarThemeState>;

export function dayWeight(state: SolarState) {
  if (!state.event) return state.night ? 0 : 256;
  const weight = ease(state.progress);
  return state.event === 1 ? weight : 256 - weight;
}

export function backgroundWeight(state: Pick<SolarState, 'event' | 'progress' | 'night'>, radius: number) {
  if (!state.event) return state.night ? 0 : 256;
  const edge = Math.min(256, radius > 192 ? (radius - 192) * 4 : 0);
  const weight = ease(Math.trunc((state.progress * 288 - edge * 32) / 256));
  return state.event === 1 ? weight : 256 - weight;
}

export function blendColor(from: string, to: string, weight: number) {
  const a = parseInt(from.replace('#', ''), 16), b = parseInt(to.replace('#', ''), 16);
  return [16, 8, 0].map(shift => {
    const x = (a >> (shift + 6)) & 3, y = (b >> (shift + 6)) & 3;
    return (Math.floor((x * (256 - weight) + y * weight + 128) / 256) * 85)
      .toString(16).padStart(2, '0');
  }).join('').toUpperCase();
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function ditherArgb(from: number, to: number, weight: number, x: number, y: number) {
  const threshold = BAYER[(y & 3) * 4 + (x & 3)] * 16 + 8;
  let result = 0xc0;
  for (let shift = 0; shift <= 4; shift += 2) {
    const a = (from >> shift) & 3, b = (to >> shift) & 3;
    const value = a * (256 - weight) + b * weight;
    result |= ((value >> 8) + Number((value & 255) > threshold)) << shift;
  }
  return result;
}

export function backgroundBucket(x: number, y: number, width: number, height: number, round: boolean) {
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x >= width || y >= height) return -1;
  const dx = 2 * x - width, dy = 2 * y - height;
  if (round) {
    const diameter = Math.min(width, height), squared = dx * dx + dy * dy;
    if (squared >= diameter * diameter) return -1;
    return Math.floor(squared * 256 / (diameter * diameter));
  }
  return Math.max(Math.floor(Math.abs(dx) * 256 / width), Math.floor(Math.abs(dy) * 256 / height));
}

export const bucketRadius = (bucket: number, round: boolean) => round ? Math.floor(Math.sqrt(bucket * 256)) : bucket;

export function backgroundPixels(state: Pick<SolarState, 'event' | 'progress' | 'night'>, from: string, to: string, width: number, height: number) {
  const argb = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return 0xc0 | ((n >> 18) & 48) | ((n >> 12) & 12) | ((n >> 6) & 3);
  };
  const a = argb(from), b = argb(to);
  const weights = Array.from({ length: 257 }, (_, i) => backgroundWeight(state, bucketRadius(i, true)));
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const bucket = backgroundBucket(x, y, width, height, true);
    if (bucket < 0) continue;
    const color = ditherArgb(a, b, weights[bucket], x, y), i = (y * width + x) * 4;
    pixels[i] = ((color >> 4) & 3) * 85;
    pixels[i + 1] = ((color >> 2) & 3) * 85;
    pixels[i + 2] = (color & 3) * 85;
    pixels[i + 3] = 255;
  }
  return pixels;
}

const luminance = (hex: string) => {
  const n = parseInt(hex, 16), channel = [0, 908, 4020, 10000];
  return Math.floor((2126 * channel[(n >> 22) & 3] + 7152 * channel[(n >> 14) & 3] +
    722 * channel[(n >> 6) & 3]) / 10000);
};

export function readableColor(day: string, night: string, background: string) {
  const d = luminance(day), n = luminance(night), b = luminance(background);
  return (Math.max(d, b) + 500) * (Math.min(n, b) + 500) >=
    (Math.max(n, b) + 500) * (Math.min(d, b) + 500) ? day : night;
}

export const COLOR_FIELDS = ['TIME_COLOR', 'SUBTEXT_PRIMARY_COLOR', 'SUBTEXT_SECONDARY_COLOR',
  'BG_COLOR', 'PIP_COLOR_PRIMARY', 'PIP_COLOR_SECONDARY', 'RING_STROKE_COLOR',
  'RING_NIGHT_COLOR', 'RING_DAY_COLOR', 'RING_SUNRISE_COLOR', 'RING_SUNSET_COLOR',
  'SUN_STROKE_COLOR', 'SUN_FILL_COLOR'] as const;
export type SolarPalette = Record<typeof COLOR_FIELDS[number], string>;
export const RING_FIELDS = ['RING_NIGHT_COLOR', 'RING_DAY_COLOR', 'RING_SUNRISE_COLOR', 'RING_SUNSET_COLOR'] as const;
export type RingPalette = Pick<SolarPalette, typeof RING_FIELDS[number]>;

export function solarRing(state: SolarState, day: RingPalette, night: RingPalette): RingPalette {
  if (!state.event) return { ...(state.night ? night : day) };
  const rise = state.event === 1;
  const from = rise ? night : day, to = rise ? day : night;
  const approach = { ...from }, departure = { ...to };
  if (rise) {
    approach.RING_NIGHT_COLOR = from.RING_SUNRISE_COLOR;
    departure.RING_DAY_COLOR = to.RING_SUNRISE_COLOR;
  } else {
    approach.RING_DAY_COLOR = from.RING_SUNSET_COLOR;
    departure.RING_NIGHT_COLOR = to.RING_SUNSET_COLOR;
  }
  const a = state.stage === 0 ? from : state.stage === 1 ? approach : departure;
  const b = state.stage === 0 ? approach : state.stage === 1 ? departure : to;
  const result = {} as RingPalette;
  RING_FIELDS.forEach(key => { result[key] = blendColor(a[key], b[key], state.weight); });
  return result;
}

export function solarPalette(settings: Settings, minute: number, sunrise: number, sunset: number) {
  const state = solarThemeState(minute, sunrise, sunset);
  const dynamic = !!settings.SETTING_DYNAMIC_SOLAR_THEME && !!settings.SETTING_USE_NIGHT_THEME;
  const night = !!settings.SETTING_USE_NIGHT_THEME && (dynamic ? state.night : minute >= sunset || minute < sunrise);
  const palette = (isNight: boolean) => {
    const result = {} as SolarPalette;
    COLOR_FIELDS.forEach(key => {
      const value = String(settings[`SETTING_${isNight ? 'NIGHT_' : ''}${key}` as keyof Settings]);
      result[key] = blendColor(value, value, 0);
    });
    return result;
  };
  const day = palette(false), dark = palette(true);
  const colors = { ...(night ? dark : day) };
  const backgroundAt = (radius: number) => dynamic && state.event
    ? blendColor(dark.BG_COLOR, day.BG_COLOR, backgroundWeight(state, radius)) : colors.BG_COLOR;
  if (dynamic && state.event) {
    Object.assign(colors, solarRing(state, day, dark));
    for (const key of ['RING_STROKE_COLOR', 'SUN_FILL_COLOR', 'SUN_STROKE_COLOR'] as const) {
      colors[key] = blendColor(dark[key], day[key], dayWeight(state));
    }
    colors.BG_COLOR = backgroundAt(0);
    for (const key of ['TIME_COLOR', 'SUBTEXT_PRIMARY_COLOR', 'SUBTEXT_SECONDARY_COLOR', 'PIP_COLOR_PRIMARY', 'PIP_COLOR_SECONDARY'] as const) {
      colors[key] = readableColor(day[key], dark[key], key.startsWith('PIP_') ? backgroundAt(256) : colors.BG_COLOR);
    }
  }
  return { colors, state, night, backgroundAt };
}
