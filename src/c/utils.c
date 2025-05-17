#include "utils.h"

void to_uppercase(char *str) {
    while (*str) {
        *str = toupper((unsigned char) *str);
        str++;
    }
}

#ifdef USE_FAKE_TIME
struct tm* getCurrentTime() {
    static struct tm fakeTime = {0};

    // Set fake time: Jan 1st, 10:38 AM
    fakeTime.tm_year = 2025 - 1900;
    fakeTime.tm_mon = 6;         
    fakeTime.tm_mday = 1;
    fakeTime.tm_hour = 10;
    fakeTime.tm_min = 38;
    fakeTime.tm_sec = 0;

    mktime(&fakeTime);

    return &fakeTime;
}
#else
struct tm* getCurrentTime() {
    static struct tm timeInfo;
    time_t rawTime;

    time(&rawTime);
    timeInfo = *localtime(&rawTime);

    return &timeInfo;
}
#endif