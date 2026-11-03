import { Settings } from '../context/types';

const MINUTES_PER_DAY = 24 * 60;

// The watch draws a marker roughly an hour wide at both sunrise and sunset,
// so anything shorter than this makes the two markers overlap on the ring.
const MIN_DAY_OR_NIGHT_MINUTES = 60;

/** Formats minutes since midnight as an HH:MM value for <input type="time">. */
export const minutesToTimeValue = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Parses an HH:MM value from <input type="time">; null if incomplete. */
export const timeValueToMinutes = (value: string): number | null => {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

/** Minutes of daytime from sunrise to sunset, wrapping past midnight. */
export const getDayLengthMinutes = (sunrise: number, sunset: number) =>
  (sunset - sunrise + MINUTES_PER_DAY) % MINUTES_PER_DAY;

/** Formats minutes since midnight in the viewer's locale, e.g. "7:00 PM". */
const formatTimeOfDay = (minutes: number) =>
  new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hours = `${h} ${h === 1 ? 'hr' : 'hrs'}`;
  return m ? `${hours} ${m} min` : hours;
};

/** e.g. "Day: 8:00 PM – 7:00 AM the next day (11 hrs)" */
export const getDaySummary = (sunrise: number, sunset: number) => {
  const nextDay = sunset < sunrise ? ' the next day' : '';
  const length = formatDuration(getDayLengthMinutes(sunrise, sunset));
  return `Day: ${formatTimeOfDay(sunrise)} – ${formatTimeOfDay(sunset)}${nextDay} (${length})`;
};

export const getManualSolarError = (settings: Settings): string | null => {
  if (!settings.SETTING_USE_MANUAL_SOLAR_TIMES) return null;

  const dayLength = getDayLengthMinutes(
    settings.SETTING_MANUAL_SUNRISE_MINUTE,
    settings.SETTING_MANUAL_SUNSET_MINUTE,
  );
  const nightLength = MINUTES_PER_DAY - dayLength;
  if (Math.min(dayLength, nightLength) < MIN_DAY_OR_NIGHT_MINUTES) {
    return 'Sunrise and sunset must be at least 1 hour apart.';
  }
  return null;
};
