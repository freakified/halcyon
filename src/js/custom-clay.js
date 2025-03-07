module.exports = function (minified) {
  var clayConfig = this;
  var _ = minified._;
  var $ = minified.$;

  // Define presets
  var presets = {
    classic: {
      SETTING_TIME_COLOR: "FFFFFF",
      SETTING_SUBTEXT_PRIMARY_COLOR: "AAAAAA",
      SETTING_SUBTEXT_SECONDARY_COLOR: "555555",
      SETTING_BG_COLOR: "000000",
      SETTING_PIP_COLOR_PRIMARY: "FFAA00",
      SETTING_PIP_COLOR_SECONDARY: "555500",
      SETTING_RING_STROKE_COLOR: "FFFFFF",
      SETTING_RING_NIGHT_COLOR: "000055",
      SETTING_RING_DAY_COLOR: "FFFF00",
      SETTING_RING_SUNRISE_COLOR: "FF5500",
      SETTING_RING_SUNSET_COLOR: "FFAA00",
      SETTING_SUN_STROKE_COLOR: "FFFFFF",
      SETTING_SUN_FILL_COLOR: "FFFF00"
    },
    dark: {
      SETTING_TIME_COLOR: "FFFFFF",
      SETTING_SUBTEXT_PRIMARY_COLOR: "888888",
      SETTING_SUBTEXT_SECONDARY_COLOR: "444444",
      SETTING_BG_COLOR: "000000",
      SETTING_PIP_COLOR_PRIMARY: "777777",
      SETTING_PIP_COLOR_SECONDARY: "333333",
      SETTING_RING_STROKE_COLOR: "AAAAAA",
      SETTING_RING_NIGHT_COLOR: "222222",
      SETTING_RING_DAY_COLOR: "999999",
      SETTING_RING_SUNRISE_COLOR: "666666",
      SETTING_RING_SUNSET_COLOR: "888888",
      SETTING_SUN_STROKE_COLOR: "CCCCCC",
      SETTING_SUN_FILL_COLOR: "EEEEEE"
    },
    sunset: {
      SETTING_TIME_COLOR: "FFAA00",
      SETTING_SUBTEXT_PRIMARY_COLOR: "FF7700",
      SETTING_SUBTEXT_SECONDARY_COLOR: "FF5500",
      SETTING_BG_COLOR: "222222",
      SETTING_PIP_COLOR_PRIMARY: "FF5500",
      SETTING_PIP_COLOR_SECONDARY: "FFAA00",
      SETTING_RING_STROKE_COLOR: "FF7700",
      SETTING_RING_NIGHT_COLOR: "660000",
      SETTING_RING_DAY_COLOR: "FFAA00",
      SETTING_RING_SUNRISE_COLOR: "FF5500",
      SETTING_RING_SUNSET_COLOR: "FF2200",
      SETTING_SUN_STROKE_COLOR: "FFDD99",
      SETTING_SUN_FILL_COLOR: "FFFFAA"
    }
  };

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
    var presetSelector = clayConfig.getItemByMessageKey('SETTING_PRESET');

    function applyPreset() {
      var selectedPreset = presetSelector.get();
      if (selectedPreset === "custom") return; // Skip if custom

      var colors = presets[selectedPreset];
      Object.keys(colors).forEach(function (key) {
        var item = clayConfig.getItemByMessageKey(key);
        if (item) {
          item.set(colors[key]); // Update color pickers
        }
      });
    }

    presetSelector.on('change', applyPreset);
  });
};

// module.exports = function (minified) {
//   var clayConfig = this;
//   var _ = minified._;
//   var $ = minified.$;
//   var HTML = minified.HTML;

// function decimalToHex(decimalColor) {
//     return decimalColor.toString(16).padStart(2, '0');
// }

// // for some reason clay returns colors as decimals
// function convertToHexFromDecimal(decimal) {
//     // Extract Red, Green, and Blue components
//     const r = (decimal >> 16) & 0xFF;
//     const g = (decimal >> 8) & 0xFF;
//     const b = decimal & 0xFF;

//     // Convert each component to hex
//     return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
// }

//   clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
//     var colorPicker = clayConfig.getItemByMessageKey('background_color');

//     function updateColorPreview() {
//       var newColor = convertToHexFromDecimal(colorPicker.get());
//       console.log(newColor);
//       document.getElementById('color-box').style.backgroundColor = newColor;
//       // $('#color-box').set({ style: 'background:' + newColor });
//     }

//     colorPicker.on('change', updateColorPreview);
//     updateColorPreview();
//   });
// };