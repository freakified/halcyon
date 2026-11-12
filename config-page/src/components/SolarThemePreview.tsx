import React, { useState } from 'react';
import { useConfig } from '../context/PebbleConfigContext';
import { solarPalette, readableColor } from '../utils/solarTheme';
import { getPreviewForValue } from '../data/widgetTypes';
import { Section } from './Section';
import { Toggle } from './Toggle';
import { SolarDitherBackground } from './SolarDitherBackground';
import './solar-theme-preview.css';

const formatTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const toMinute = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
// Match the watch's two-pixel diamond outline, drawn behind each original glyph.
const OUTLINE_OFFSETS = [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0],
  [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];

export function SolarThemePreview() {
  const { settings } = useConfig();
  // Preview-only controls: never saved in Settings or sent to the watch.
  const [minute, setMinute] = useState(1050);
  const [sunrise, setSunrise] = useState(360);
  const [sunset, setSunset] = useState(1080);
  const { colors, state, night } = solarPalette(settings, minute, sunrise, sunset);
  const c = (key: keyof typeof colors) => '#' + colors[key];
  const dynamic = !!settings.SETTING_DYNAMIC_SOLAR_THEME && !!settings.SETTING_USE_NIGHT_THEME;
  const outlineText = dynamic && !!state.event && settings.SETTING_BG_COLOR !== settings.SETTING_NIGHT_BG_COLOR;
  const phase = dynamic && state.event ? (state.event === 1 ? 'Sunrise transition' : 'Sunset transition') : night ? 'Night theme' : 'Day theme';
  const point = (m: number, radius: number) => {
    const a = (m / 1440 * 2 - 1) * Math.PI;
    return [130 + radius * Math.sin(a), 130 - radius * Math.cos(a)];
  };
  const arc = (start: number, length: number, color: string, width = 20) => (
    <circle cx="130" cy="130" r="118" fill="none" stroke={color} strokeWidth={width}
      strokeDasharray={`${length / 1440 * 2 * Math.PI * 118} ${2 * Math.PI * 118}`}
      transform={`rotate(${start / 4 - 270} 130 130)`} />
  );
  const sun = point(minute, 118);
  const sample = (fmt: string) => getPreviewForValue(fmt, Number(settings.SETTING_LANGUAGE) || 0,
    Number(settings.SETTING_TEMP_UNIT) === 1, settings.SETTING_ALT_LABEL, settings.SETTING_ALT_LABEL2);
  const rows = [settings.SETTING_WIDGET_UPPER_SECONDARY, settings.SETTING_WIDGET_UPPER_PRIMARY,
    formatTime(minute), settings.SETTING_WIDGET_LOWER_PRIMARY, settings.SETTING_WIDGET_LOWER_SECONDARY];
  const visibleRows = rows.map((text, i) => ({ text, i })).filter(row => row.text);
  return <Section title="Dynamic solar themes">
    <Toggle label="Dynamic solar themes" messageKey="SETTING_DYNAMIC_SOLAR_THEME"
      description="Follow your day and night themes’ sunrise and sunset colors, with a gentle background fade." />
    <details className="solar-details" open={dynamic}>
      <summary>Preview time of day</summary>
    <div className="solar-preview">
      <svg viewBox="0 0 260 260" width="260" height="260" role="img" aria-label={`Illustrative palette preview at ${formatTime(minute)}: ${phase}`}>
        <circle cx="130" cy="130" r="130" fill={c('RING_STROKE_COLOR')} />
        <circle cx="130" cy="130" r="118" fill="none" stroke={c('RING_NIGHT_COLOR')} strokeWidth="20" />
        {arc(sunrise, (sunset - sunrise + 1440) % 1440, c('RING_DAY_COLOR'))}
        {arc((sunrise - 15 + 1440) % 1440, 30, c('RING_STROKE_COLOR'), 24)}
        {arc((sunset - 15 + 1440) % 1440, 30, c('RING_STROKE_COLOR'), 24)}
        {arc((sunrise - 15 + 1440) % 1440, 30, c('RING_SUNRISE_COLOR'))}
        {arc((sunset - 15 + 1440) % 1440, 30, c('RING_SUNSET_COLOR'))}
        <circle cx="130" cy="130" r="106" fill={c('BG_COLOR')} stroke={c('RING_STROKE_COLOR')} strokeWidth="3" />
        {dynamic && !!state.event && <SolarDitherBackground state={state}
          day={String(settings.SETTING_BG_COLOR)} night={String(settings.SETTING_NIGHT_BG_COLOR)} />}
        {Array.from({ length: 24 }, (_, h) => {
          if (Number(settings.SETTING_PIP_VISIBILITY) === 2 || (Number(settings.SETTING_PIP_VISIBILITY) === 1 && h % 3)) return null;
          const a = point(h * 60, 104), b = point(h * 60, h % 3 ? 102 : 99);
          return <line key={h} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
            stroke={c(h % 3 ? 'PIP_COLOR_SECONDARY' : 'PIP_COLOR_PRIMARY')} strokeWidth="2" />;
        })}
        <circle cx={sun[0]} cy={sun[1]} r="7" fill={c('SUN_FILL_COLOR')} stroke={c('SUN_STROKE_COLOR')} strokeWidth="2" />
        {visibleRows.map(({text, i}, row) => {
          const fill = colors[i === 2 ? 'TIME_COLOR' : i === 1 || i === 3 ? 'SUBTEXT_PRIMARY_COLOR' : 'SUBTEXT_SECONDARY_COLOR'];
          const outline = readableColor(String(settings.SETTING_BG_COLOR), String(settings.SETTING_NIGHT_BG_COLOR), fill);
          const y = 130 + (row - (visibleRows.length - 1) / 2) * 30;
          const content = i === 2 ? text : sample(text);
          return <g key={i} dominantBaseline="middle" textAnchor="middle" fontFamily="monospace"
            fontSize={i === 2 ? 38 : 12} fontWeight={i === 2 ? 800 : 600}>
            {outlineText && OUTLINE_OFFSETS.map(([dx, dy]) =>
              <text key={`${dx},${dy}`} x={130 + dx} y={y + dy} fill={'#' + outline} aria-hidden="true">{content}</text>)}
            <text x="130" y={y} fill={'#' + fill}>{content}</text>
          </g>;
        })}
      </svg>
      <div className="solar-controls">
        <label htmlFor="solar-minute">Preview time <strong>{formatTime(minute)}</strong></label>
        <input id="solar-minute" type="range" min="0" max="1439" step="1" value={minute}
          aria-valuetext={formatTime(minute)} onChange={e => setMinute(Number(e.target.value))} />
        <p aria-live="polite">{phase}{dynamic && state.event ? ' · Background fading' : ` · ${night ? 'Night' : 'Day'} palette`}</p>
        <div className="solar-jumps" aria-label="Preview moments">
          {[[sunrise - 30, 'Dawn'], [sunrise, 'Sunrise'], [720, 'Noon'], [sunset - 30, 'Golden hour'],
            [sunset, 'Sunset'], [sunset + 30, 'Dusk'], [sunset + 60, 'Night']].map(([m, label]) =>
            <button type="button" key={String(label)} onClick={() => setMinute((Number(m) + 1440) % 1440)}>{label}</button>)}
        </div>
        <div className="solar-times">
          <label>Example sunrise <input type="time" value={formatTime(sunrise)} onChange={e => { if (e.target.value) setSunrise(toMinute(e.target.value)); }} /></label>
          <label>Example sunset <input type="time" value={formatTime(sunset)} onChange={e => { if (e.target.value) setSunset(toMinute(e.target.value)); }} /></label>
        </div>
      </div>
    </div>
    {sunrise === sunset && <p className="solar-note">Choose different example sunrise and sunset times to preview transitions.</p>}
    <p className="solar-note">Illustrative colors and sample widgets; these preview times never change your watch’s clock or solar schedule.</p>
    </details>
  </Section>;
}
