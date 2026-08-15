var USE_LOCAL_CONFIG = false;
var configDataUri = 'https://halcyon.freakified.net/';
var configLocalUri = 'http://10.25.219.23:3000/index.html';

var SunCalc = require('./suncalc');
var Weather = require('./weather');
var Languages = require('./languages');
var Cities = require('./cities');

// Cached data (in-memory; also persisted to localStorage)
var cachedWeather = null;
var cachedSolar = null;
var cachedSettings = null;

var TIME_FORMAT_STORAGE_KEY = 'halcyonIs24h';
var DEFAULT_ALT_CITY = 'TOKYO';
var DEFAULT_ALT_CITY2 = 'UTC';
var ALT_LABEL_MAX_LENGTH = 6;

function restoreIs24h() {
  try {
    return localStorage.getItem(TIME_FORMAT_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function saveIs24h(is24h) {
  try {
    localStorage.setItem(TIME_FORMAT_STORAGE_KEY, is24h ? 'true' : 'false');
  } catch (e) { }
}

// 24-hour preference from the watch. Restored before the first startup render,
// then refreshed from WATCH_IS_24H on each watch-initiated heartbeat.
var cachedIs24h = restoreIs24h();

// Default widget format strings — used when no settings have been configured yet
// so that JS can perform token substitution even on first run. The lower-primary
// uses the {local_date} super-token, which the watch expands per-language at
// render time.
var DEFAULT_WIDGETS = {
  'SETTING_WIDGET_UPPER_SECONDARY': '{temp}° ({thi}°/{tlo})°',
  'SETTING_WIDGET_UPPER_PRIMARY': '{cond}',
  'SETTING_WIDGET_LOWER_PRIMARY': '{local_date}',
  'SETTING_WIDGET_LOWER_SECONDARY': '{steps} {t:STEPS}'
};

var WIDGET_SLOT_KEYS = [
  'SETTING_WIDGET_UPPER_SECONDARY',
  'SETTING_WIDGET_UPPER_PRIMARY',
  'SETTING_WIDGET_LOWER_PRIMARY',
  'SETTING_WIDGET_LOWER_SECONDARY'
];

var WEATHER_WIDGET_TOKENS = [
  '{temp}', '{thi}', '{tlo}', '{cond}', '{cond_day}', '{weather_icon}',
  '{weather_icon_day}', '{hum}',
  '{wind}', '{uv}', '{rain}', '{pop}', '{dew}', '{temp_unit}',
  '{wind_unit}', '{wind_dir}'
];

function getDefaultWidgets() {
  var defaults = {};
  Object.keys(DEFAULT_WIDGETS).forEach(function (key) {
    defaults[key] = DEFAULT_WIDGETS[key];
  });

  var watchInfo = Pebble.getActiveWatchInfo && Pebble.getActiveWatchInfo();
  if (watchInfo && watchInfo.platform === 'aplite') {
    defaults.SETTING_WIDGET_LOWER_SECONDARY = '{t:BATTERY} {batt}%';
  }

  return defaults;
}

function settingsUseWeather(settings) {
  var defaultWidgets = getDefaultWidgets();
  settings = settings || {};

  return WIDGET_SLOT_KEYS.some(function (key) {
    var fmt = settings[key];
    if (fmt === undefined || fmt === null) {
      fmt = defaultWidgets[key];
    }
    if (!fmt) return false;

    return WEATHER_WIDGET_TOKENS.some(function (token) {
      return fmt.indexOf(token) !== -1;
    });
  });
}

// ---- Time helpers ----

function formatMinutes(minutes, use24h) {
  if (minutes < 0) return '--:--';
  var h = Math.floor(minutes / 60) % 24;
  var m = minutes % 60;
  if (use24h) {
    return h + ':' + (m < 10 ? '0' : '') + m;
  }
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h % 12 || 12;
  return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

function getNextSolarEvent(solar, use24h, labels) {
  if (!solar) {
    return {
      label: '--',
      time: '--:--',
      text: '-- --:--'
    };
  }

  var now = new Date();
  var currentMinute = now.getHours() * 60 + now.getMinutes();
  var sunriseDelta = (solar.sunriseMinute - currentMinute + 24 * 60) % (24 * 60);
  var sunsetDelta = (solar.sunsetMinute - currentMinute + 24 * 60) % (24 * 60);
  var isSunriseNext = sunriseDelta < sunsetDelta;
  var label = isSunriseNext ? (labels.RISE || 'RISE') : (labels.SET || 'SET');
  var time = formatMinutes(isSunriseNext ? solar.sunriseMinute : solar.sunsetMinute, use24h);

  return {
    label: label,
    time: time,
    text: label + ' ' + time
  };
}

function getSelectedAltCity(settings, key, fallback) {
  var cityName = settings[key] || fallback;
  return Cities.findCity(cityName) || Cities.findCity('UTC');
}

function applyAltCityMessage(msg, settings, cityKey, labelKey, messageLabelKey, messageOffsetKey, fallbackCity) {
  var now = new Date();
  var city = getSelectedAltCity(settings || {}, cityKey, fallbackCity);
  if (!city) return;

  var label = settings[labelKey] || city.label || city.name;
  msg[messageLabelKey] = String(label).toUpperCase().slice(0, ALT_LABEL_MAX_LENGTH);
  msg[messageOffsetKey] = Cities.cityOffsetMinutes(city, now);
  msg.LOCAL_UTC_OFFSET = -now.getTimezoneOffset();
}

// ---- Pass 1: token substitution ----

/**
 * Given a format string like "{temp}° {cond} · {sunrise}", replaces all
 * JS-side tokens with their current values and returns the result.
 * Unknown tokens (e.g. {date}, {steps}) are left untouched for the C side.
 */
function applyJsTokens(formatStr, weather, solar, isImperial, use24h, lang) {
  if (!formatStr) return formatStr;

  var L = Languages.getLang(lang);

  var result = formatStr;

  // Solar tokens
  if (solar) {
    var nextSolar = getNextSolarEvent(solar, use24h, L.labels);
    result = result.replace('{sunrise}', formatMinutes(solar.sunriseMinute, use24h));
    result = result.replace('{sunset}', formatMinutes(solar.sunsetMinute, use24h));
    result = result.replace('{next_solar}', nextSolar.text);
    result = result.replace('{next_solar_label}', nextSolar.label);
    result = result.replace('{next_solar_time}', nextSolar.time);
  } else {
    var nextSolarPlaceholder = getNextSolarEvent(null, use24h, L.labels);
    result = result.replace('{sunrise}', '--:--');
    result = result.replace('{sunset}', '--:--');
    result = result.replace('{next_solar}', nextSolarPlaceholder.text);
    result = result.replace('{next_solar_label}', nextSolarPlaceholder.label);
    result = result.replace('{next_solar_time}', nextSolarPlaceholder.time);
  }

  // Weather tokens
  if (weather) {
    var temp = isImperial ? Weather.toF(weather.temp) : Math.round(weather.temp);
    var tempHi = isImperial ? Weather.toF(weather.tempHi) : Math.round(weather.tempHi);
    var tempLo = isImperial ? Weather.toF(weather.tempLo) : Math.round(weather.tempLo);
    var dew = isImperial ? Weather.toF(weather.dew) : Math.round(weather.dew);
    var wind = isImperial ? Weather.toMPH(weather.wind) : Math.round(weather.wind);
    var rain = isImperial ? Weather.toInch(weather.rain) : weather.rain.toFixed(1);

    result = result.replace('{temp}', String(temp));
    result = result.replace('{thi}', String(tempHi));
    result = result.replace('{tlo}', String(tempLo));
    result = result.replace('{cond}', Weather.getCondition(weather.code, lang) || '--');
    result = result.replace('{cond_day}', Weather.getCondition(weather.codeDay, lang) || '--');
    result = result.replace('{hum}', String(Math.round(weather.hum)));
    result = result.replace('{wind}', String(wind));
    result = result.replace('{uv}', String(Math.round(weather.uv)));
    result = result.replace('{rain}', String(rain));
    result = result.replace('{pop}', String(Math.round(weather.pop)));
    result = result.replace('{dew}', String(dew));
    result = result.replace('{temp_unit}', isImperial ? '°F' : '°C');
    result = result.replace('{wind_unit}', isImperial ? 'MPH' : 'KM/H');
    result = result.replace('{wind_dir}', Weather.getCardinal(weather.wind_dir, lang));
  } else {
    // No weather data yet — replace with placeholders so the watch shows something
    var dash = '--';
    ['temp', 'thi', 'tlo', 'cond', 'cond_day', 'hum', 'wind', 'uv', 'rain', 'pop', 'dew', 'temp_unit', 'wind_unit', 'wind_dir'].forEach(function (t) {
      result = result.replace('{' + t + '}', dash);
    });
  }

  // Universal translation token substitution {t:KEY}
  result = result.replace(/\{t:([A-Z_]+)\}/g, function (match, key) {
    return L.labels[key] || match;
  });

  return result;
}

// ---- Build and send all data to watch ----

function sendDataToWatch() {
  var settings = cachedSettings;
  if (!settings) {
    console.log('No settings cached yet, using defaults');
    settings = {};
  }

  var isImperial = (settings.SETTING_TEMP_UNIT === 1);
  var lang = settings.SETTING_LANGUAGE || 0;
  var use24h = cachedIs24h;
  var weather = Weather.isDisplayable(cachedWeather) ? cachedWeather : null;
  var defaultWidgets = getDefaultWidgets();

  if (cachedWeather && !weather) {
    cachedWeather = null;
    Weather.clear();
  }

  var msg = {};

  WIDGET_SLOT_KEYS.forEach(function (key) {
    // Use configured setting, falling back to default format string
    var fmt = settings[key];
    if (fmt === undefined || fmt === null) {
      fmt = defaultWidgets[key];
    }
    if (fmt !== undefined && fmt !== null) {
      // Apply JS tokens; C tokens pass through untouched
      var processed = applyJsTokens(fmt, weather, cachedSolar, isImperial, use24h, lang);
      msg[key] = processed;
    }
  });

  applyAltCityMessage(msg, settings, 'SETTING_ALT_CITY', 'SETTING_ALT_LABEL',
    'SETTING_ALT_CITY_LABEL', 'ALT_CITY_UTC_OFFSET', DEFAULT_ALT_CITY);
  applyAltCityMessage(msg, settings, 'SETTING_ALT_CITY2', 'SETTING_ALT_LABEL2',
    'SETTING_ALT_CITY2_LABEL', 'ALT_CITY2_UTC_OFFSET', DEFAULT_ALT_CITY2);

  // Send solar minutes for the ring
  if (cachedSolar) {
    msg['WEATHER_SUNRISE_MINUTE'] = cachedSolar.sunriseMinute;
    msg['WEATHER_SUNSET_MINUTE'] = cachedSolar.sunsetMinute;
  }

  // The watch renders icon tokens as bitmap-only slots. Send semantic values
  // separately so the C renderer stays independent of Open-Meteo WMO codes.
  msg['WEATHER_ICON_CURRENT'] = weather
    ? Weather.getWeatherIcon(weather.code)
    : Weather.WeatherIcon.UNKNOWN;
  msg['WEATHER_ICON_DAY'] = weather
    ? Weather.getWeatherIcon(weather.codeDay)
    : Weather.WeatherIcon.UNKNOWN;

  // Send temp unit setting
  msg['SETTING_TEMP_UNIT'] = isImperial ? 1 : 0;

  console.log('Sending to watch: ' + JSON.stringify(msg));

  Pebble.sendAppMessage(msg,
    function () { console.log('Data sent to watch successfully'); },
    function (e) { console.log('Error sending data to watch: ' + JSON.stringify(e)); }
  );
}

// ---- Location + weather fetch ----
//
// Backoff: on any failure (geolocation or weather fetch), schedule a JS-side
// retry at 1m → 5m → 15m, then give up and let the next watch-driven
// REQUEST_UPDATE (every 30m) take over. Reset on success.
//
// JS timers can be killed by the phone suspending PKJS, so we still rely on
// the watch's heartbeat as the ultimate floor — backoff is best-effort.
var RETRY_DELAYS_MS = [60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000];
var retryAttempt = 0;
var retryTimer = null;

function scheduleRetry(reason) {
  if (retryAttempt >= RETRY_DELAYS_MS.length) {
    console.log('Backoff exhausted (' + reason + '); waiting for next REQUEST_UPDATE');
    return;
  }
  var delay = RETRY_DELAYS_MS[retryAttempt];
  retryAttempt++;
  console.log('Scheduling retry #' + retryAttempt + ' in ' + (delay / 1000) + 's (' + reason + ')');
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(function () {
    retryTimer = null;
    getLocation();
  }, delay);
}

function resetBackoff() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  retryAttempt = 0;
}

function locationError(err) {
  console.log('Location error: ' + err.message);
  scheduleRetry('geolocation: ' + err.message);
}

function locationSuccess(pos) {
  var lat = pos.coords.latitude;
  var lng = pos.coords.longitude;

  // Calculate sunrise/sunset on the JS side
  var times = SunCalc.getTimes(new Date(), lat, lng);
  var solar = {
    sunriseMinute: times.sunrise.getHours() * 60 + times.sunrise.getMinutes(),
    sunsetMinute: times.sunset.getHours() * 60 + times.sunset.getMinutes()
  };
  cachedSolar = solar;
  localStorage.setItem('halcyonSolar', JSON.stringify(solar));
  console.log('Solar: sunrise=' + solar.sunriseMinute + ', sunset=' + solar.sunsetMinute);

  // Send to watch immediately (even before weather)
  sendDataToWatch();

  if (!settingsUseWeather(cachedSettings)) {
    console.log('No weather widgets configured; skipping weather fetch');
    resetBackoff();
    return;
  }

  Weather.fetch(lat, lng,
    function (data) {
      cachedWeather = data;
      resetBackoff();
      sendDataToWatch();
    },
    function (reason) {
      scheduleRetry('weather: ' + reason);
    }
  );

  // NOTE: No setInterval here! The watch sends REQUEST_UPDATE on a timer,
  // which triggers getLocation() → this function again. That approach is
  // reliable because the watch timer always runs, unlike JS setInterval
  // which can be killed when the phone suspends the PKJS runtime.
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    { timeout: 15000, maximumAge: 10 * 60 * 1000 }
  );
}

// ---- App lifecycle ----

Pebble.addEventListener('ready', function (e) {
  console.log('PebbleKit JS ready');

  // Restore cached weather/solar from previous session
  cachedWeather = Weather.restore();
  var savedSolar = localStorage.getItem('halcyonSolar');
  if (savedSolar) {
    try { cachedSolar = JSON.parse(savedSolar); } catch (e) { }
  }

  // Restore settings
  var savedSettings = localStorage.getItem('halcyonSettings');
  if (savedSettings) {
    try { cachedSettings = JSON.parse(savedSettings); } catch (e) { }
  }

  // If we have cached data, send it immediately so the watch has something
  // (uses defaults if no settings configured yet)
  sendDataToWatch();

  // Then kick off a fresh location + weather fetch
  getLocation();
});

// ---- Watch-initiated heartbeat ----
// The watch sends REQUEST_UPDATE every ~30 minutes to request fresh data.
// It also includes its 24h time format preference.
Pebble.addEventListener('appmessage', function (e) {
  console.log('Received message from watch: ' + JSON.stringify(e.payload));

  if (e.payload['REQUEST_UPDATE']) {
    // Extract 24h preference from the watch
    if (e.payload['WATCH_IS_24H'] !== undefined) {
      cachedIs24h = !!e.payload['WATCH_IS_24H'];
      saveIs24h(cachedIs24h);
      console.log('Watch 24h mode: ' + cachedIs24h);
    }

    // Fresh heartbeat from the watch — start a new backoff cycle.
    resetBackoff();
    getLocation();
  }
});

// ---- Configuration ----

Pebble.addEventListener('showConfiguration', function () {
  var url = USE_LOCAL_CONFIG ? configLocalUri : configDataUri;

  var watchInfo = Pebble.getActiveWatchInfo();
  url += (url.indexOf('?') === -1 ? '?' : '&') + 'watchInfo=' + encodeURIComponent(JSON.stringify({
    platform: watchInfo.platform,
    model: watchInfo.model,
    language: watchInfo.language,
    firmware: {
      major: watchInfo.firmware.major,
      minor: watchInfo.firmware.minor
    }
  }));

  var persistedSettings = localStorage.getItem('halcyonSettings');
  if (persistedSettings) {
    try {
      var settings = JSON.parse(persistedSettings);
      url += '&settings=' + encodeURIComponent(JSON.stringify(settings));
    } catch (e) {
      console.log('Error loading persisted settings:', e);
    }
  }

  console.log('Opening Config URL: ' + url);
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function (e) {
  console.log('Configuration window closed');

  if (!e.response || e.response === 'CANCELLED' || e.response === 'null' || e.response === '{}') {
    console.log('No configuration data returned');
    return;
  }

  var configData;
  try {
    configData = JSON.parse(decodeURIComponent(e.response));
  } catch (err) {
    console.log('Error parsing configuration response: ' + err);
    try {
      configData = JSON.parse(e.response);
    } catch (err2) {
      console.log('Failed to parse config data even without decoding');
      return;
    }
  }

  if (configData.return_to) {
    delete configData.return_to;
  }

  // Save to localStorage for persistence
  localStorage.setItem('halcyonSettings', JSON.stringify(configData));
  cachedSettings = configData;

  // Convert to proper format and send to watch
  var dict = {};

  var colorKeys = [
    'SETTING_TIME_COLOR', 'SETTING_BG_COLOR',
    'SETTING_SUBTEXT_PRIMARY_COLOR', 'SETTING_SUBTEXT_SECONDARY_COLOR',
    'SETTING_PIP_COLOR_PRIMARY', 'SETTING_PIP_COLOR_SECONDARY',
    'SETTING_RING_STROKE_COLOR', 'SETTING_RING_NIGHT_COLOR', 'SETTING_RING_DAY_COLOR',
    'SETTING_RING_SUNRISE_COLOR', 'SETTING_RING_SUNSET_COLOR',
    'SETTING_SUN_STROKE_COLOR', 'SETTING_SUN_FILL_COLOR',
    'SETTING_NIGHT_TIME_COLOR', 'SETTING_NIGHT_BG_COLOR',
    'SETTING_NIGHT_SUBTEXT_PRIMARY_COLOR', 'SETTING_NIGHT_SUBTEXT_SECONDARY_COLOR',
    'SETTING_NIGHT_PIP_COLOR_PRIMARY', 'SETTING_NIGHT_PIP_COLOR_SECONDARY',
    'SETTING_NIGHT_RING_STROKE_COLOR', 'SETTING_NIGHT_RING_NIGHT_COLOR', 'SETTING_NIGHT_RING_DAY_COLOR',
    'SETTING_NIGHT_RING_SUNRISE_COLOR', 'SETTING_NIGHT_RING_SUNSET_COLOR',
    'SETTING_NIGHT_SUN_STROKE_COLOR', 'SETTING_NIGHT_SUN_FILL_COLOR'
  ];

  // Widget string keys — these get Pass 1 applied instead of raw send
  var widgetKeys = [
    'SETTING_WIDGET_UPPER_SECONDARY',
    'SETTING_WIDGET_UPPER_PRIMARY',
    'SETTING_WIDGET_LOWER_PRIMARY',
    'SETTING_WIDGET_LOWER_SECONDARY'
  ];

  // Process color settings
  for (var i = 0; i < colorKeys.length; i++) {
    var key = colorKeys[i];
    if (configData[key]) {
      dict[key] = parseInt(configData[key].replace('#', ''), 16);
    }
  }

  // Process non-color, non-widget settings
  Object.keys(configData).forEach(function (key) {
    if (colorKeys.indexOf(key) === -1 && widgetKeys.indexOf(key) === -1 &&
      key !== 'SETTING_ALT_CITY' && key !== 'SETTING_ALT_LABEL' &&
      key !== 'SETTING_ALT_CITY2' && key !== 'SETTING_ALT_LABEL2') {
      var value = configData[key];
      if (typeof value === 'boolean') {
        dict[key] = value ? 1 : 0;
      } else if (typeof value === 'string' && !isNaN(value)) {
        dict[key] = parseInt(value, 10);
      } else {
        dict[key] = value;
      }
    }
  });

  console.log('Sending non-widget config to Pebble: ' + JSON.stringify(dict));

  Pebble.sendAppMessage(dict,
    function () { console.log('Config sent successfully!'); },
    function (e) { console.log('Error sending config: ' + JSON.stringify(e)); }
  );

  // Now apply Pass 1 to widget strings and send them with current weather/solar data
  sendDataToWatch();
});
