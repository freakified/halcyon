#pragma once

#include <pebble.h>

// Define all the "true" metrics for the various fonts we're using
// "Height" is the actual mesured pixel height from the top to the baseline
// "Offset" is the empty space between where you ask graphics_draw_text
// to draw and where it actually draws

#define METRIC_LECO_32_BOLD_NUMBERS_HEIGHT     22
#define METRIC_LECO_32_BOLD_NUMBERS_OFFSET     10

#define METRIC_LECO_36_BOLD_NUMBERS_HEIGHT     25
#define METRIC_LECO_36_BOLD_NUMBERS_OFFSET     11

#define METRIC_LECO_38_BOLD_NUMBERS_HEIGHT     27
#define METRIC_LECO_38_BOLD_NUMBERS_OFFSET     11

#define METRIC_LECO_42_NUMBERS_HEIGHT          29
#define METRIC_LECO_42_NUMBERS_OFFSET          13

#define METRIC_ROBOTO_BOLD_SUBSET_49_HEIGHT    49
#define METRIC_ROBOTO_BOLD_SUBSET_49_OFFSET    13

#define METRIC_GOTHIC_18_BOLD_HEIGHT           11
#define METRIC_GOTHIC_18_BOLD_OFFSET           7

#define METRIC_GOTHIC_24_BOLD_HEIGHT           14
#define METRIC_GOTHIC_24_BOLD_OFFSET           10

#define METRIC_GOTHIC_28_BOLD_HEIGHT           18
#define METRIC_GOTHIC_28_BOLD_OFFSET           10

// Choose our fonts based on platform

#ifdef PBL_PLATFORM_EMERY
  #define FONT_TIME_STANDARD         FONT_KEY_LECO_42_NUMBERS
  #define FONT_TIME_STANDARD_HEIGHT  METRIC_LECO_42_NUMBERS_HEIGHT
  #define FONT_TIME_STANDARD_OFFSET  METRIC_LECO_42_NUMBERS_OFFSET

  #define FONT_DATE_STANDARD         FONT_KEY_GOTHIC_24_BOLD
  #define FONT_DATE_STANDARD_HEIGHT  METRIC_GOTHIC_24_BOLD_HEIGHT
  #define FONT_DATE_STANDARD_OFFSET  METRIC_GOTHIC_24_BOLD_OFFSET

  #define FONT_TIME_LARGE            FONT_KEY_LECO_42_NUMBERS
  #define FONT_TIME_LARGE_HEIGHT     METRIC_LECO_42_NUMBERS_HEIGHT
  #define FONT_TIME_LARGE_OFFSET     METRIC_LECO_42_NUMBERS_OFFSET

  #define FONT_DATE_LARGE            FONT_KEY_GOTHIC_28_BOLD
  #define FONT_DATE_LARGE_HEIGHT     METRIC_GOTHIC_28_BOLD_HEIGHT
  #define FONT_DATE_LARGE_OFFSET     METRIC_GOTHIC_28_BOLD_OFFSET

#elif defined(PBL_ROUND)
  #define FONT_TIME_STANDARD         FONT_KEY_LECO_38_BOLD_NUMBERS
  #define FONT_TIME_STANDARD_HEIGHT  METRIC_LECO_38_BOLD_NUMBERS_HEIGHT
  #define FONT_TIME_STANDARD_OFFSET  METRIC_LECO_38_BOLD_NUMBERS_OFFSET

  #define FONT_DATE_STANDARD         FONT_KEY_GOTHIC_18_BOLD
  #define FONT_DATE_STANDARD_HEIGHT  METRIC_GOTHIC_18_BOLD_HEIGHT
  #define FONT_DATE_STANDARD_OFFSET  METRIC_GOTHIC_18_BOLD_OFFSET

  #define FONT_TIME_LARGE            FONT_KEY_LECO_42_NUMBERS
  #define FONT_TIME_LARGE_HEIGHT     METRIC_LECO_42_NUMBERS_HEIGHT
  #define FONT_TIME_LARGE_OFFSET     METRIC_LECO_42_NUMBERS_OFFSET

  #define FONT_DATE_LARGE            FONT_KEY_GOTHIC_24_BOLD
  #define FONT_DATE_LARGE_HEIGHT     METRIC_GOTHIC_24_BOLD_HEIGHT
  #define FONT_DATE_LARGE_OFFSET     METRIC_GOTHIC_24_BOLD_OFFSET

#else
  #define FONT_TIME_STANDARD         FONT_KEY_LECO_32_BOLD_NUMBERS
  #define FONT_TIME_STANDARD_HEIGHT  METRIC_LECO_32_BOLD_NUMBERS_HEIGHT
  #define FONT_TIME_STANDARD_OFFSET  METRIC_LECO_32_BOLD_NUMBERS_OFFSET

  #define FONT_DATE_STANDARD         FONT_KEY_GOTHIC_18_BOLD
  #define FONT_DATE_STANDARD_HEIGHT  METRIC_GOTHIC_18_BOLD_HEIGHT
  #define FONT_DATE_STANDARD_OFFSET  METRIC_GOTHIC_18_BOLD_OFFSET

  #define FONT_TIME_LARGE            FONT_KEY_LECO_36_BOLD_NUMBERS
  #define FONT_TIME_LARGE_HEIGHT     METRIC_LECO_36_BOLD_NUMBERS_HEIGHT
  #define FONT_TIME_LARGE_OFFSET     METRIC_LECO_36_BOLD_NUMBERS_OFFSET

  #define FONT_DATE_LARGE            FONT_KEY_GOTHIC_24_BOLD
  #define FONT_DATE_LARGE_HEIGHT     METRIC_GOTHIC_24_BOLD_HEIGHT
  #define FONT_DATE_LARGE_OFFSET     METRIC_GOTHIC_24_BOLD_OFFSET
#endif

// Finally, define the spacing between each line
#ifdef PBL_PLATFORM_EMERY
#define LINE_PADDING 10
#else
#define LINE_PADDING 8
#endif