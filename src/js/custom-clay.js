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

  function decimalToHex(decimalColor) {
    return decimalColor.toString(16).padStart(2, '0');
  }

  function convertToHexFromDecimal(decimal) {
    const r = (decimal >> 16) & 0xFF;
    const g = (decimal >> 8) & 0xFF;
    const b = decimal & 0xFF;
    return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
  }

  function toggleCustomSection(show) {
    var customFields = [
      'custom_theme_heading',
      'SETTING_TIME_COLOR',
      'SETTING_SUBTEXT_PRIMARY_COLOR',
      'SETTING_SUBTEXT_SECONDARY_COLOR',
      'SETTING_BG_COLOR',
      'SETTING_PIP_COLOR_PRIMARY',
      'SETTING_PIP_COLOR_SECONDARY',
      'SETTING_RING_STROKE_COLOR',
      'SETTING_RING_NIGHT_COLOR',
      'SETTING_RING_DAY_COLOR',
      'SETTING_RING_SUNRISE_COLOR',
      'SETTING_RING_SUNSET_COLOR',
      'SETTING_SUN_STROKE_COLOR',
      'SETTING_SUN_FILL_COLOR'
    ].map(key => clayConfig.getItemByMessageKey(key));

    customFields.forEach(item => {
      if (item) {
        show ? item.show() : item.hide();
      }
    });
  }

  function updateSVGColors(colorKey, colorValue) {
    var svgContainer = document.getElementById('svg-preview');
    if (!svgContainer) return;

    var element = svgContainer.querySelector('#' + colorKey);
    if (element) {
      // Convert decimal color to hex if necessary
      var hexColor = typeof colorValue === 'number' ? convertToHexFromDecimal(colorValue) : `#${colorValue}`;
      element.setAttribute('fill', hexColor);
    }
  }

  function applyPreset() {
    var presetSelector = clayConfig.getItemByMessageKey('SETTING_PRESET');
    var selectedPreset = presetSelector.get();

    if (selectedPreset === "custom") {
      toggleCustomSection(true);
    } else {
      toggleCustomSection(false);

      // Apply the preset colors
      var colors = presets[selectedPreset];
      Object.keys(colors).forEach(function (key) {
        var item = clayConfig.getItemByMessageKey(key);
        if (item) {
          item.set(colors[key]);
        }
        updateSVGColors(key, colors[key]); // Update preview
      });
    }
  }

  function attachColorListeners() {
    var colorKeys = Object.keys(presets.classic); // Use one preset to get all color keys

    colorKeys.forEach(function (key) {
      var colorPicker = clayConfig.getItemByMessageKey(key);
      if (colorPicker) {
        colorPicker.on('change', function () {
          var newColor = colorPicker.get();
          updateSVGColors(key, newColor);
        });
      }
    });
  }

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
    var presetSelector = clayConfig.getItemByMessageKey('SETTING_PRESET');
    presetSelector.on('change', applyPreset);

    applyPreset(); // Apply preset on load
    attachColorListeners(); // Attach color change listeners
  });
};