var assert = require('assert');
var Weather = require('../src/pkjs/weather');

var cases = [
  [0, 'CLEAR'],
  [1, 'MOSTLY_CLEAR'],
  [2, 'PARTLY_CLOUDY'],
  [3, 'CLOUDY'],
  [45, 'FOG'],
  [48, 'FOG'],
  [51, 'DRIZZLE'],
  [57, 'DRIZZLE'],
  [61, 'RAIN'],
  [82, 'RAIN'],
  [71, 'SNOW'],
  [86, 'SNOW'],
  [95, 'THUNDERSTORM'],
  [99, 'THUNDERSTORM'],
  [-1, 'UNKNOWN'],
  [4, 'UNKNOWN'],
  [undefined, 'UNKNOWN']
];

cases.forEach(function (testCase) {
  var code = testCase[0];
  var expectedName = testCase[1];
  assert.strictEqual(
    Weather.getWeatherIcon(code),
    Weather.WeatherIcon[expectedName],
    'WMO code ' + code + ' should map to ' + expectedName
  );
});

console.log('Checked ' + cases.length + ' weather icon mappings.');
