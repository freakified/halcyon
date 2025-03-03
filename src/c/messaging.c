#include <pebble.h>
#include "messaging.h"
#include "solarUtils.h"

void (*message_processed_callback)(void);

void messaging_init(void (*processed_callback)(void)) {
  // Custom callback
  message_processed_callback = processed_callback;

  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  app_message_open(512, 8);

  app_message_register_inbox_received(inbox_received_callback);
}

void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // Does this message contain new location data?
  Tuple *lat_tuple = dict_find(iterator, MESSAGE_KEY_LOCATION_LAT);
  Tuple *lng_tuple = dict_find(iterator, MESSAGE_KEY_LOCATION_LNG);
  Tuple *tzOffset_tuple = dict_find(iterator, MESSAGE_KEY_LOCATION_GMT_OFFSET);

  if (lat_tuple != NULL && lng_tuple != NULL && tzOffset_tuple != NULL) {
    LocationInfo loc;

    // set the coordinates
    float lat = (int)lat_tuple->value->int32;
    lat /= 1000000;

    float lng = (int)lng_tuple->value->int32;
    lng /= 1000000;

    float tzOffset = (int)tzOffset_tuple->value->int32;
    tzOffset /= 60;

    loc.lat = lat;
    loc.lng = lng;
    loc.tzOffset = tzOffset;
    loc.lastUpdatedTime = time(NULL);

    solarUtils_updateLocation(loc);
  }
}

void inbox_dropped_callback(AppMessageResult reason, void *context) {
  // APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

void outbox_failed_callback(DictionaryIterator *iterator,
                            AppMessageResult reason, void *context) {
  // APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  // APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}