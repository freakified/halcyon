#pragma once
#include <pebble.h>

/*
 * Keeps track of the wearer's next alarm, so the ring can show where it falls
 */

// alarm_service_peek_next() only exists in the firmware for the newer watches;
// calling it on the older ones isn't safe
#if defined(PBL_PLATFORM_FLINT) || defined(PBL_PLATFORM_EMERY) ||              \
    defined(PBL_PLATFORM_GABBRO)
#define HAS_ALARMS
#endif

#define NO_ALARM (-1)

/**
 * Looks up the next alarm again. The system has no alarm events to subscribe
 * to, so this gets called on every minute tick.
 */
void alarmUtils_update();

/*
 * Minutes since midnight (local time) when the next alarm goes off, or
 * NO_ALARM if none goes off within the next 24 hours
 */
extern int nextAlarmMinute;
