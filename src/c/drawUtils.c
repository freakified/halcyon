#include "drawUtils.h"
#include "alarmUtils.h"

#ifdef HAS_ALARMS

// the bell, as the half-width of each of its rows from top to bottom (the
// negative one leaves a gap between the lip and the clapper)
#if RING_THICKNESS >= 20
static const int8_t BELL_ROWS[] = {0, 2, 3, 3, 3, 3, 3, 4, 4, 5, -1, 1};
#else
static const int8_t BELL_ROWS[] = {0, 2, 2, 2, 2, 3, 4, -1, 1};
#endif

#define BELL_OUTLINE 1

// fills in the bell with every row grown by the given number of pixels, so a
// grown bell drawn first can serve as the outline of the regular one
static void fill_bell(GContext *ctx, GPoint center, int grow) {
  int numRows = ARRAY_LENGTH(BELL_ROWS);
  int top = center.y - numRows / 2;

  for (int i = 0; i < numRows; i++) {
    int halfWidth = BELL_ROWS[i];
    if (halfWidth < 0) {
      continue;
    }

    graphics_fill_rect(ctx,
                       GRect(center.x - halfWidth - grow, top + i - grow,
                             2 * (halfWidth + grow) + 1, 1 + 2 * grow),
                       0, GCornerNone);
  }
}

void draw_alarm_marker(GContext *ctx, GPoint center, GColor fillColor,
                       GColor strokeColor) {
  graphics_context_set_fill_color(ctx, strokeColor);
  fill_bell(ctx, center, BELL_OUTLINE);

  graphics_context_set_fill_color(ctx, fillColor);
  fill_bell(ctx, center, 0);
}

#endif
