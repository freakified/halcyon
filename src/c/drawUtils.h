#pragma once
#include <pebble.h>

// various metrics
#define RING_THICKNESS_RECT 
#define RING_THICKNESS PBL_IF_ROUND_ELSE(16, ACTION_BAR_WIDTH / 2 + 1)
#define RING_STROKE_WIDTH 3
#define EDGE_THICKNESS (RING_THICKNESS + RING_STROKE_WIDTH)

void draw_center_layer(Layer *layer, GContext *ctx);
void draw_ring_layer(Layer *layer, GContext *ctx);
