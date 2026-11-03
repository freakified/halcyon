#include "alarmUtils.h"
#include <pebble.h>

int nextAlarmMinute = NO_ALARM;

void alarmUtils_update() {
  nextAlarmMinute = NO_ALARM;

#ifdef HAS_ALARMS
  // the system only tells us about the soonest enabled alarm
  time_t now = time(NULL);
  time_t alarmTime;
  if (!alarm_service_peek_next(&alarmTime) || alarmTime < now) {
    return;
  }

  // the ring only covers the next 24 hours, so an alarm any further out
  // would be marked on the wrong day
  if (alarmTime - now >= SECONDS_PER_DAY) {
    return;
  }

  struct tm alarmInfo = *localtime(&alarmTime);
  nextAlarmMinute = alarmInfo.tm_hour * 60 + alarmInfo.tm_min;
#endif
}
