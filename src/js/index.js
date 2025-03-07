var Clay = require('pebble-clay');
var clayConfig = require('./config.json');
var customClay = require('./custom-clay');
var clay = new Clay(clayConfig, customClay);

function locationError(err) {
  console.log('location error on the JS side :-(');
}

function locationSuccess(pos) {
  // now that we have the location, get the timezone offset 
  var tzOffset = new Date().getTimezoneOffset() * -1;
  
  // collect everything to send
  var message = {
        'LOCATION_LAT': Math.round(pos.coords.latitude * 1000000),
        'LOCATION_LNG': Math.round(pos.coords.longitude * 1000000),
        'LOCATION_GMT_OFFSET': tzOffset
      };
    
  // send the message to the watch
  Pebble.sendAppMessage(message,
        function(e) {
          // console.log('Location info sent to Pebble successfully!');
        },
        function(e) {
          // console.log('Error sending location info to Pebble!');
        }
      );
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {

    // first thing to do: send the watchface our location
    getLocation();
  }
);