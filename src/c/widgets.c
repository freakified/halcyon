#include "widgets.h"
#include "languages.h"
#include "settings.h"
#include "utils.h"
#include <pebble.h>

static void format_alt_time(char *buf, size_t buf_len, struct tm *alt_time) {
  if (clock_is_24h_style()) {
    strftime(buf, buf_len, "%H:%M", alt_time);
  } else {
    strftime(buf, buf_len, "%I:%M %p", alt_time);
  }

  if (!globalSettings.showLeadingZero && buf[0] == '0') {
    for (size_t i = 0; i < buf_len - 1; i++) {
      buf[i] = buf[i + 1];
      if (buf[i] == '\0')
        break;
    }
  }
}

static void get_alt_time_info(struct tm *local_time, struct tm *alt_time,
                              char *time_buf, size_t time_buf_len,
                              char *day_buf, size_t day_buf_len,
                              bool *different_date, int16_t utc_offset) {
  time_t shifted =
      time(NULL) + ((int)utc_offset - (int)globalSettings.localUtcOffset) * 60;
  *alt_time = *localtime(&shifted);
  format_alt_time(time_buf, time_buf_len, alt_time);

  uint8_t lang = globalSettings.language;
  if (lang >= LANGUAGE_COUNT) {
    lang = LANGUAGE_EN;
  }
  snprintf(day_buf, day_buf_len, "%s", dayNames[lang][alt_time->tm_wday]);
  *different_date = local_time->tm_year != alt_time->tm_year ||
                    local_time->tm_yday != alt_time->tm_yday;
}

static void render_alt_time_token(const char *token, int token_len,
                                  struct tm *local_time, char *temp,
                                  size_t temp_len, const char *label,
                                  int16_t utc_offset, const char *full_token,
                                  const char *label_token,
                                  const char *time_token, const char *day_token,
                                  bool *matched) {
  if (strncmp(token, full_token, token_len) == 0 &&
      token_len == (int)strlen(full_token)) {
    struct tm alt_time;
    char alt_time_text[12] = {0};
    char alt_day_text[8] = {0};
    bool different_date = false;
    get_alt_time_info(local_time, &alt_time, alt_time_text,
                      sizeof(alt_time_text), alt_day_text, sizeof(alt_day_text),
                      &different_date, utc_offset);
    if (different_date) {
      snprintf(temp, temp_len, "%s %s %s", label, alt_time_text, alt_day_text);
    } else {
      snprintf(temp, temp_len, "%s %s", label, alt_time_text);
    }
    *matched = true;
  } else if (strncmp(token, label_token, token_len) == 0 &&
             token_len == (int)strlen(label_token)) {
    snprintf(temp, temp_len, "%s", label);
    *matched = true;
  } else if (strncmp(token, time_token, token_len) == 0 &&
             token_len == (int)strlen(time_token)) {
    struct tm alt_time;
    char alt_day_text[8] = {0};
    bool different_date = false;
    get_alt_time_info(local_time, &alt_time, temp, temp_len, alt_day_text,
                      sizeof(alt_day_text), &different_date, utc_offset);
    *matched = true;
  } else if (strncmp(token, day_token, token_len) == 0 &&
             token_len == (int)strlen(day_token)) {
    struct tm alt_time;
    char alt_time_text[12] = {0};
    bool different_date = false;
    get_alt_time_info(local_time, &alt_time, alt_time_text,
                      sizeof(alt_time_text), temp, temp_len, &different_date,
                      utc_offset);
    *matched = true;
  }
}

void widget_get_text(const char *format_string, char *buf, int buf_len) {
  if (!format_string || buf_len <= 0)
    return;

  buf[0] = '\0';

  // Fast path: no tokens — just copy the literal.
  if (strchr(format_string, '{') == NULL) {
    strncpy(buf, format_string, buf_len);
    buf[buf_len - 1] = '\0';
    return;
  }

  int out_idx = 0;
  int in_idx = 0;

  uint8_t lang = globalSettings.language;
  if (lang >= LANGUAGE_COUNT) {
    lang = LANGUAGE_EN;
  }
  struct tm *t = getCurrentTime();
#if defined(PBL_HEALTH)
  // Cache day-window times so multiple health-related tokens in the same
  // format string don't recompute them.
  time_t today_start = time_start_of_today();
  time_t now = time(NULL);
#endif

  while (format_string[in_idx] != '\0' && out_idx < buf_len - 1) {
    if (format_string[in_idx] == '{') {
      // Find closing brace
      int end_brace = in_idx + 1;
      while (format_string[end_brace] != '\0' &&
             format_string[end_brace] != '}') {
        end_brace++;
      }

      if (format_string[end_brace] == '}') {
        // We have a token
        int token_len = end_brace - in_idx - 1;
        const char *token = &format_string[in_idx + 1];

        char temp[WIDGET_TEXT_LEN] = {0};
        bool matched = false;

        if (strncmp(token, "day_name", token_len) == 0 && token_len == 8) {
          snprintf(temp, sizeof(temp), "%s", dayNames[lang][t->tm_wday]);
          matched = true;
        } else if (strncmp(token, "month_name", token_len) == 0 &&
                   token_len == 10) {
          snprintf(temp, sizeof(temp), "%s", monthNames[lang][t->tm_mon]);
          matched = true;
        } else if (strncmp(token, "day0", token_len) == 0 && token_len == 4) {
          snprintf(temp, sizeof(temp), "%02d", t->tm_mday);
          matched = true;
        } else if (strncmp(token, "day", token_len) == 0 && token_len == 3) {
          snprintf(temp, sizeof(temp), "%d", t->tm_mday);
          matched = true;
        } else if (strncmp(token, "month_num", token_len) == 0 &&
                   token_len == 9) {
          snprintf(temp, sizeof(temp), "%02d", t->tm_mon + 1);
          matched = true;
        } else if (strncmp(token, "year", token_len) == 0 && token_len == 4) {
          snprintf(temp, sizeof(temp), "%d", t->tm_year + 1900);
          matched = true;
        } else if (strncmp(token, "day_of_year", token_len) == 0 &&
                   token_len == 11) {
          snprintf(temp, sizeof(temp), "%d", t->tm_yday + 1);
          matched = true;
        } else if (strncmp(token, "week_of_year", token_len) == 0 &&
                   token_len == 12) {
          strftime(temp, sizeof(temp), "%V", t);
          matched = true;
        } else if (strncmp(token, "date:", (token_len > 5 ? 5 : token_len)) ==
                       0 &&
                   token_len > 5) {
          const char *fmt_start = token + 5;
          int fmt_len = token_len - 5;
          char fmt[32] = {0};
          if (fmt_len < (int)sizeof(fmt)) {
            memcpy(fmt, fmt_start, fmt_len);
            strftime(temp, sizeof(temp), fmt, t);
            to_uppercase(temp);
            matched = true;
          }
        } else if (strncmp(token, "local_date", token_len) == 0 &&
                   token_len == 10) {
          // Expand to the active language's idiomatic date format and recurse
          // to substitute the inner tokens. defaultDateFormat[] entries must
          // not contain {local_date} themselves — recursion is bounded at 1.
          widget_get_text(defaultDateFormat[lang], temp, sizeof(temp));
          matched = true;
        } else if (strncmp(token, "steps", token_len) == 0 && token_len == 5) {
#if defined(PBL_HEALTH)
          HealthServiceAccessibilityMask mask =
              health_service_metric_accessible(HealthMetricStepCount,
                                               today_start, now);
          if (mask & HealthServiceAccessibilityMaskAvailable) {
            HealthValue steps = health_service_sum_today(HealthMetricStepCount);
            snprintf(temp, sizeof(temp), "%d", (int)steps);
          } else {
            snprintf(temp, sizeof(temp), "--");
          }
#else
          temp[0] = '\0';
#endif
          matched = true;
        } else if (strncmp(token, "dist", token_len) == 0 && token_len == 4) {
#if defined(PBL_HEALTH)
          HealthServiceAccessibilityMask mask =
              health_service_metric_accessible(HealthMetricWalkedDistanceMeters,
                                               today_start, now);
          char dec = decimalSeparator[lang];
          if (mask & HealthServiceAccessibilityMaskAvailable) {
            HealthValue meters =
                health_service_sum_today(HealthMetricWalkedDistanceMeters);
            MeasurementSystem ms =
                health_service_get_measurement_system_for_display(
                    HealthMetricWalkedDistanceMeters);
            if (ms == MeasurementSystemMetric) {
              int km_whole = (int)(meters / 1000);
              int km_tenths = (int)((meters % 1000) / 100);
              snprintf(temp, sizeof(temp), "%d%c%d", km_whole, dec, km_tenths);
            } else {
              // Imperial: miles
              // 10000 meters = 6.21371 miles
              // miles * 10 = (meters * 10) / 1609
              int miles_ten = (int)((meters * 10) / 1609);
              int miles_whole = miles_ten / 10;
              int miles_tenths = miles_ten % 10;
              snprintf(temp, sizeof(temp), "%d%c%d", miles_whole, dec,
                       miles_tenths);
            }
          } else {
            snprintf(temp, sizeof(temp), "-%c--", dec);
          }
#else
          temp[0] = '\0';
#endif
          matched = true;
        } else if (strncmp(token, "dist_unit", token_len) == 0 &&
                   token_len == 9) {
#if defined(PBL_HEALTH)
          MeasurementSystem ms =
              health_service_get_measurement_system_for_display(
                  HealthMetricWalkedDistanceMeters);
          snprintf(temp, sizeof(temp), "%s",
                   (ms == MeasurementSystemMetric) ? "KM" : "MI");
#else
          temp[0] = '\0';
#endif
          matched = true;
        } else if (strncmp(token, "hr", token_len) == 0 && token_len == 2) {
#if defined(PBL_HEALTH)
          HealthValue bpm =
              health_service_peek_current_value(HealthMetricHeartRateBPM);
          if (bpm > 0) {
            snprintf(temp, sizeof(temp), "%d", (int)bpm);
          } else {
            snprintf(temp, sizeof(temp), "--");
          }
#else
          temp[0] = '\0';
#endif
          matched = true;
        } else if (strncmp(token, "batt", token_len) == 0 && token_len == 4) {
          BatteryChargeState state = battery_state_service_peek();
          snprintf(temp, sizeof(temp), "%d", state.charge_percent);
          matched = true;
        } else if (strncmp(token, "alt_tz", 6) == 0) {
          render_alt_time_token(
              token, token_len, t, temp, sizeof(temp),
              globalSettings.altCityLabel, globalSettings.altCityUtcOffset,
              "alt_tz", "alt_tz_label", "alt_tz_time", "alt_tz_day", &matched);
          if (!matched) {
            render_alt_time_token(token, token_len, t, temp, sizeof(temp),
                                  globalSettings.altCity2Label,
                                  globalSettings.altCity2UtcOffset, "alt_tz2",
                                  "alt_tz2_label", "alt_tz2_time",
                                  "alt_tz2_day", &matched);
          }
        }

        if (matched) {
          // copy temp into buf
          int t_idx = 0;
          while (temp[t_idx] != '\0' && out_idx < buf_len - 1) {
            buf[out_idx++] = temp[t_idx++];
          }
          in_idx = end_brace + 1;
          continue;
        }
      }
    }

    // Default: copy character
    buf[out_idx++] = format_string[in_idx++];
  }

  buf[out_idx] = '\0';
}
