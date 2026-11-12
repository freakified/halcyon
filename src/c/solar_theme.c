#include "solar_theme.h"

static int distance(int a, int b) {
  int d = (a - b + 1440) % 1440;
  return d > 720 ? 1440 - d : d;
}

static int ease(int p) {
  if (p < 0) p = 0;
  if (p > 256) p = 256;
  return p * p * (768 - 2 * p) / 65536;
}

SolarThemeState solar_theme_state(int minute, int sunrise, int sunset) {
  minute = (minute % 1440 + 1440) % 1440;
  bool valid = sunrise >= 0 && sunrise < 1440 && sunset >= 0 &&
               sunset < 1440 && sunrise != sunset;
  // Invalid/equal data: preserve isNightTime's existing decision, without a fade.
  if (!valid) return (SolarThemeState){.night = minute >= sunset || minute < sunrise};
  int day = (sunset - sunrise + 1440) % 1440;
  bool night = (minute - sunrise + 1440) % 1440 >= day;
  // Compress windows on very short days/nights so sunrise and sunset never overlap.
  int window = 45;
  if (day / 2 < window) window = day / 2;
  if ((1440 - day) / 2 < window) window = (1440 - day) / 2;
  int rise_distance = distance(minute, sunrise);
  int set_distance = distance(minute, sunset);
  int nearest = rise_distance < set_distance ? rise_distance : set_distance;
  if (!window || nearest >= window) return (SolarThemeState){.night = night};
  bool rise = rise_distance < set_distance;
  int offset = (minute - (rise ? sunrise : sunset) + 1440) % 1440;
  if (offset > 720) offset -= 1440;
  int elapsed = offset + window;
  int duration = 2 * window;
  // At normal day lengths: anchors at -45, -15, +15 and +45 minutes.
  int stage = elapsed * 3 / duration;
  int weight = ease((elapsed * 3 % duration) * 256 / duration);
  return (SolarThemeState){night, rise ? 1 : 2, stage, weight,
                          elapsed * 256 / duration};
}

uint8_t solar_theme_blend(uint8_t from, uint8_t to, int weight) {
  uint8_t out = 0xc0;
  for (int shift = 0; shift <= 4; shift += 2) {
    int a = (from >> shift) & 3, b = (to >> shift) & 3;
    out |= ((a * (256 - weight) + b * weight + 128) / 256) << shift;
  }
  return out;
}

uint8_t solar_theme_dither(uint8_t from, uint8_t to, int weight, int x, int y) {
  static const uint8_t bayer[16] = {
    0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5
  };
  // Fixed spatial phase, never shifted with time. Only adjacent channel levels
  // are mixed; this is not a checkerboard of the full day/night backgrounds.
  int threshold = bayer[(y & 3) * 4 + (x & 3)] * 16 + 8;
  uint8_t out = 0xc0;
  for (int shift = 0; shift <= 4; shift += 2) {
    int a = (from >> shift) & 3, b = (to >> shift) & 3;
    int value = a * (256 - weight) + b * weight;
    int level = (value >> 8) + ((value & 255) > threshold);
    out |= level << shift;
  }
  return out;
}

int solar_theme_background_bucket(int x, int y, int width, int height, bool round) {
  if (width <= 0 || height <= 0 || x < 0 || y < 0 || x >= width || y >= height) return -1;
  int dx = 2 * x - width, dy = 2 * y - height;
  if (round) {
    int diameter = width < height ? width : height;
    int squared = dx * dx + dy * dy;
    if (squared >= diameter * diameter) return -1;
    return squared * 256 / (diameter * diameter);
  }
  int rx = (dx < 0 ? -dx : dx) * 256 / width;
  int ry = (dy < 0 ? -dy : dy) * 256 / height;
  return rx > ry ? rx : ry;
}

int solar_theme_bucket_radius(int bucket, bool round) {
  if (!round) return bucket;
  // Integer sqrt, evaluated only for the 257-entry per-draw weight table.
  int lo = 0, hi = 256;
  while (lo < hi) {
    int mid = (lo + hi + 1) / 2;
    if (mid * mid <= bucket * 256) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

int solar_theme_day_weight(SolarThemeState state) {
  if (!state.event) return state.night ? 0 : 256;
  int weight = ease(state.progress);
  return state.event == 1 ? weight : 256 - weight;
}

int solar_theme_background_weight(SolarThemeState state, int radius) {
  if (!state.event) return state.night ? 0 : 256;
  // Hold the central 75% flat for text; let the outer quarter follow gently.
  // Center and edge differ by at most 1/8 of the fade's linear progress.
  int edge = radius > 192 ? (radius - 192) * 4 : 0;
  if (edge > 256) edge = 256;
  int weight = ease((state.progress * 288 - edge * 32) / 256);
  return state.event == 1 ? weight : 256 - weight;
}

SolarRingPalette solar_theme_ring(SolarThemeState state,
    SolarRingPalette day, SolarRingPalette night) {
  if (!state.event) return state.night ? night : day;
  bool rise = state.event == 1;
  SolarRingPalette from = rise ? night : day;
  SolarRingPalette to = rise ? day : night;
  SolarRingPalette approach = from, departure = to;
  if (rise) {
    approach.night = from.sunrise;
    departure.day = to.sunrise;
  } else {
    approach.day = from.sunset;
    departure.night = to.sunset;
  }
  SolarRingPalette a = state.stage == 0 ? from : state.stage == 1 ? approach : departure;
  SolarRingPalette b = state.stage == 0 ? approach : state.stage == 1 ? departure : to;
  return (SolarRingPalette){
    solar_theme_blend(a.night, b.night, state.weight),
    solar_theme_blend(a.day, b.day, state.weight),
    solar_theme_blend(a.sunrise, b.sunrise, state.weight),
    solar_theme_blend(a.sunset, b.sunset, state.weight)
  };
}

// Relative sRGB luminance for the four channel levels, scaled by 10000.
// Choose between user-selected text colors, never a replacement text palette.
static uint32_t luminance(uint8_t color) {
  static const uint32_t channel[4] = {0, 908, 4020, 10000};
  return (2126 * channel[(color >> 4) & 3] +
          7152 * channel[(color >> 2) & 3] + 722 * channel[color & 3]) / 10000;
}

uint8_t solar_theme_readable(uint8_t day, uint8_t night, uint8_t background) {
  uint32_t d = luminance(day), n = luminance(night), b = luminance(background);
  uint32_t dn = (d > b ? d : b) + 500, dd = (d < b ? d : b) + 500;
  uint32_t nn = (n > b ? n : b) + 500, nd = (n < b ? n : b) + 500;
  return (uint64_t)dn * nd >= (uint64_t)nn * dd ? day : night;
}
