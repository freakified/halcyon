#pragma once
#include <pebble.h>

// various metrics
#if defined(PBL_PLATFORM_GABBRO)
#define RING_THICKNESS 20
#define SUN_DIAMETER 8
#define SUN_INSET 11
#elif defined(PBL_PLATFORM_EMERY)
#define RING_THICKNESS 20
#define SUN_DIAMETER 8
#define SUN_INSET 10
#elif defined(PBL_PLATFORM_CHALK)
#define RING_THICKNESS 16
#define SUN_DIAMETER 6
#define SUN_INSET 10
#else
#define RING_THICKNESS 16
#define SUN_DIAMETER 7
#define SUN_INSET 8
#endif

#define RING_STROKE_WIDTH 3
#define EDGE_THICKNESS (RING_THICKNESS + RING_STROKE_WIDTH)

void draw_center_layer(Layer *layer, GContext *ctx);
void draw_ring_layer(Layer *layer, GContext *ctx);

// draws a bell centered on the given point, marking when an alarm goes off
void draw_alarm_marker(GContext *ctx, GPoint center, GColor fillColor,
                       GColor strokeColor);
