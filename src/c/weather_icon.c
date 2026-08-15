#include "weather_icon.h"

static WeatherIcon s_current = WEATHER_ICON_UNKNOWN;
static WeatherIcon s_day = WEATHER_ICON_UNKNOWN;
static GPath *s_thunder_path;

typedef struct {
  WeatherIcon icon;
  GDrawCommandImage *image;
  GColor foreground;
  GColor background;
  bool colors_set;
} WeatherIconCache;

static WeatherIconCache s_current_cache = {
    .icon = WEATHER_ICON_UNKNOWN,
    .image = NULL,
    .colors_set = false,
};
static WeatherIconCache s_day_cache = {
    .icon = WEATHER_ICON_UNKNOWN,
    .image = NULL,
    .colors_set = false,
};

static const GPathInfo THUNDER_PATH_INFO = {
    .num_points = 7,
    .points =
        (GPoint[]){{13, 11}, {9, 17}, {12, 17}, {10, 24},
                   {17, 15}, {14, 15}, {16, 11}},
};

static WeatherIcon validated_icon(WeatherIcon icon) {
  if (icon > WEATHER_ICON_THUNDERSTORM) {
    return WEATHER_ICON_UNKNOWN;
  }
  return icon;
}

static void destroy_cache(WeatherIconCache *cache) {
  if (cache->image) {
    gdraw_command_image_destroy(cache->image);
    cache->image = NULL;
  }
  cache->colors_set = false;
}

static void set_icon(WeatherIcon *state, WeatherIconCache *cache,
                     WeatherIcon icon) {
  icon = validated_icon(icon);
  if (*state == icon) {
    return;
  }

  *state = icon;
  destroy_cache(cache);
  cache->icon = icon;
}

void weather_icon_set_current(WeatherIcon icon) {
  set_icon(&s_current, &s_current_cache, icon);
}

void weather_icon_set_day(WeatherIcon icon) {
  set_icon(&s_day, &s_day_cache, icon);
}

WeatherIcon weather_icon_get_current(void) { return s_current; }

WeatherIcon weather_icon_get_day(void) { return s_day; }

static uint32_t resource_id_for_icon(WeatherIcon icon) {
  switch (icon) {
  case WEATHER_ICON_CLEAR:
    return RESOURCE_ID_WEATHER_ICON_CLEAR;
  case WEATHER_ICON_MOSTLY_CLEAR:
  case WEATHER_ICON_PARTLY_CLOUDY:
    return RESOURCE_ID_WEATHER_ICON_PARTLY_CLOUDY;
  case WEATHER_ICON_CLOUDY:
    return RESOURCE_ID_WEATHER_ICON_CLOUDY;
  case WEATHER_ICON_DRIZZLE:
    return RESOURCE_ID_WEATHER_ICON_DRIZZLE;
  case WEATHER_ICON_RAIN:
  case WEATHER_ICON_THUNDERSTORM:
    return RESOURCE_ID_WEATHER_ICON_RAIN;
  case WEATHER_ICON_SNOW:
    return RESOURCE_ID_WEATHER_ICON_SNOW;
  case WEATHER_ICON_FOG:
  case WEATHER_ICON_UNKNOWN:
  default:
    return RESOURCE_ID_WEATHER_ICON_UNKNOWN;
  }
}

typedef struct {
  GColor foreground;
  GColor background;
} IconColors;

static bool recolor_command(GDrawCommand *command, uint32_t index,
                            void *context) {
  IconColors *colors = context;
  GColor fill = gdraw_command_get_fill_color(command);
  GColor stroke = gdraw_command_get_stroke_color(command);

  if (gcolor_equal(fill, GColorBlack)) {
    gdraw_command_set_fill_color(command, colors->foreground);
  } else if (gcolor_equal(fill, GColorWhite)) {
    gdraw_command_set_fill_color(command, colors->background);
  }

  if (gcolor_equal(stroke, GColorBlack)) {
    gdraw_command_set_stroke_color(command, colors->foreground);
  } else if (gcolor_equal(stroke, GColorWhite)) {
    gdraw_command_set_stroke_color(command, colors->background);
  }

  return true;
}

static GDrawCommandImage *get_image(WeatherIcon icon, WeatherIconCache *cache,
                                    GColor foreground, GColor background) {
  bool colors_match = cache->colors_set &&
                      gcolor_equal(cache->foreground, foreground) &&
                      gcolor_equal(cache->background, background);
  if (cache->image && cache->icon == icon && colors_match) {
    return cache->image;
  }

  destroy_cache(cache);
  cache->icon = icon;
  cache->foreground = foreground;
  cache->background = background;
  cache->colors_set = true;
  cache->image =
      gdraw_command_image_create_with_resource(resource_id_for_icon(icon));
  if (!cache->image) {
    return NULL;
  }

  IconColors colors = {
      .foreground = foreground,
      .background = background,
  };
  gdraw_command_list_iterate(
      gdraw_command_image_get_command_list(cache->image), recolor_command,
      &colors);
  return cache->image;
}

static GPoint icon_origin(GRect slot_bounds) {
  return GPoint(slot_bounds.origin.x +
                    (slot_bounds.size.w - WEATHER_ICON_SIZE) / 2,
                slot_bounds.origin.y +
                    (slot_bounds.size.h - WEATHER_ICON_SIZE) / 2);
}

static void draw_fog(GContext *ctx, GPoint origin, GColor color) {
  graphics_context_set_stroke_color(ctx, color);
  graphics_context_set_stroke_width(ctx, 2);
  graphics_draw_line(ctx, GPoint(origin.x + 4, origin.y + 7),
                     GPoint(origin.x + 20, origin.y + 7));
  graphics_draw_line(ctx, GPoint(origin.x + 1, origin.y + 12),
                     GPoint(origin.x + 17, origin.y + 12));
  graphics_draw_line(ctx, GPoint(origin.x + 7, origin.y + 17),
                     GPoint(origin.x + 23, origin.y + 17));
}

static void draw_lightning(GContext *ctx, GPoint origin, GColor color) {
  if (!s_thunder_path) {
    s_thunder_path = gpath_create(&THUNDER_PATH_INFO);
  }
  if (!s_thunder_path) {
    return;
  }

  gpath_move_to(s_thunder_path, origin);
  graphics_context_set_fill_color(ctx, color);
  gpath_draw_filled(ctx, s_thunder_path);
}

bool weather_icon_draw(GContext *ctx, bool daily, GRect slot_bounds,
                       GColor foreground, GColor background) {
  WeatherIcon icon = daily ? s_day : s_current;
  GPoint origin = icon_origin(slot_bounds);

  if (icon == WEATHER_ICON_FOG) {
    draw_fog(ctx, origin, foreground);
    return true;
  }

  WeatherIconCache *cache = daily ? &s_day_cache : &s_current_cache;
  GDrawCommandImage *image =
      get_image(icon, cache, foreground, background);
  if (!image) {
    return false;
  }

  gdraw_command_image_draw(ctx, image, origin);
  if (icon == WEATHER_ICON_THUNDERSTORM) {
    draw_lightning(ctx, origin, foreground);
  }
  return true;
}

void weather_icon_deinit(void) {
  destroy_cache(&s_current_cache);
  destroy_cache(&s_day_cache);
  if (s_thunder_path) {
    gpath_destroy(s_thunder_path);
    s_thunder_path = NULL;
  }
}
