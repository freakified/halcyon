import { useMemo } from 'react';
import { backgroundPixels, type SolarState } from '../utils/solarTheme';

export function SolarDitherBackground({ state, day, night }: { state: SolarState; day: string; night: string }) {
  const size = 208;
  const { event, progress, night: isNight } = state;
  const image = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const pixels = context.createImageData(size, size);
    pixels.data.set(backgroundPixels({ event, progress, night: isNight }, night, day, size, size));
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL();
  }, [event, progress, isNight, day, night]);
  return image ? <image x="26" y="26" width={size} height={size} href={image} imageRendering="pixelated" /> : null;
}
