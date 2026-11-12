#pragma once
#include <stdbool.h>
#include <stdint.h>

// Pure minute/palette math; also exercised by host-side preview parity tests.
typedef struct {
  bool night;
  int event; // 0: none, 1: sunrise, 2: sunset
  int stage; // approach, crossfade, departure (0..2)
  int weight; // eased position within this stage, 0..256
  int progress; // linear position through the complete window, 0..256
} SolarThemeState;

typedef struct {
  uint8_t night, day, sunrise, sunset;
} SolarRingPalette;

SolarThemeState solar_theme_state(int minute, int sunrise, int sunset);
uint8_t solar_theme_blend(uint8_t from, uint8_t to, int weight);
int solar_theme_day_weight(SolarThemeState state);
int solar_theme_background_weight(SolarThemeState state, int radius);
SolarRingPalette solar_theme_ring(SolarThemeState state,
    SolarRingPalette day, SolarRingPalette night);
uint8_t solar_theme_readable(uint8_t day, uint8_t night, uint8_t background);
uint8_t solar_theme_dither(uint8_t from, uint8_t to, int weight, int x, int y);
// Round buckets are squared radii; rectangle buckets are normalized edge distance.
// -1 means outside the background. Coordinates are local to the background layer.
int solar_theme_background_bucket(int x, int y, int width, int height, bool round);
int solar_theme_bucket_radius(int bucket, bool round);
