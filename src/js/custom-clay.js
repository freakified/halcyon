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

  function generatePresetSVG(colors) {
    var svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="168" fill="none">
        <path fill="#${colors.SETTING_RING_NIGHT_COLOR}" d="M0 86h144v82H0z"/>
        <path fill="#${colors.SETTING_RING_DAY_COLOR}" d="M0 0h144v82H0z"/>
        <path fill="#${colors.SETTING_SUN_FILL_COLOR}" d="M52 8.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z"/>
        <path fill="#${colors.SETTING_SUN_STROKE_COLOR}" fill-rule="evenodd" d="M43.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 3a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" clip-rule="evenodd"/>
        <path fill="#${colors.SETTING_RING_SUNRISE_COLOR}" d="M19 72v25H0V72h19Z"/>
        <path fill="#${colors.SETTING_RING_SUNSET_COLOR}" d="M144 72v25h-19V72h19Z"/>
        <path fill="#${colors.SETTING_BG_COLOR}" d="M16 16h112v136H16z"/>
        <path fill="#${colors.SETTING_PIP_COLOR_SECONDARY}" d="M17 19.121 19.12 17l4.243 4.243-2.122 2.12L17 19.122ZM125.243 17l2.121 2.121-4.243 4.243L121 21.243 125.243 17ZM17 149.243l2.121 2.121 4.243-4.243L21.242 145 17 149.243ZM125.243 151.364l2.121-2.121-4.243-4.243-2.121 2.121 4.243 4.243ZM15.83 105.404l5.949-.783.391 2.975-5.948.783-.392-2.975ZM16.49 38.275l5.796 1.553-.777 2.897-5.795-1.553.777-2.897ZM33.275 151.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.776ZM34.827 22.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM90.595 145.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM87.621 21.779l.783-5.95 2.975.392-.784 5.95-2.974-.392ZM51.62 151.778l.784-5.948 2.974.391-.783 5.949-2.974-.392ZM54.595 15.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM106.827 152.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM105.275 21.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.777ZM122.221 104.621l5.949.783-.391 2.975-5.949-.783.391-2.975ZM121.714 39.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM15.714 127.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM16.221 60.621l5.95.783-.392 2.975-5.95-.783.392-2.975ZM122.49 126.275l5.796 1.552-.777 2.898-5.795-1.553.776-2.897ZM121.83 61.404l5.949-.783.391 2.975-5.948.783-.392-2.975Z"/>
        <path fill="#${colors.SETTING_PIP_COLOR_PRIMARY}" d="M17 83h6v3h-6v-3ZM70 23v-5h3v5h-3ZM70 151v-6h3v6h-3ZM121 83h6v3h-6v-3Z"/>
        <g fill="#${colors.SETTING_RING_STROKE_COLOR}" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M125 19H19v130h106V19ZM16 16v136h112V16H16Z"/>
            <path d="M0 97h19V72H0v3h16v19H0v3ZM144 72h-19v25h19v-3h-16V75h16v-3Z"/>
        </g>
        <path fill="#${colors.SETTING_SUBTEXT_PRIMARY_COLOR}" d="M102.779 96.336V107h-2.131V96.336h2.131Zm2.651 0v1.78h-7.383v-1.78h7.383ZM94.679 103.448h2.131c-.029.801-.19 1.477-.483 2.029-.293.546-.71.961-1.253 1.245-.537.283-1.186.424-1.948.424-.59 0-1.116-.097-1.575-.292a3.164 3.164 0 0 1-1.171-.879c-.323-.386-.567-.862-.733-1.429-.161-.571-.242-1.228-.242-1.97v-1.809c0-.742.086-1.399.257-1.97.176-.571.425-1.05.747-1.436.327-.39.72-.683 1.18-.879.463-.2.985-.3 1.567-.3.776 0 1.425.147 1.948.44.522.293.925.72 1.208 1.281.288.557.462 1.238.52 2.044h-2.146c-.01-.508-.066-.906-.168-1.194-.098-.293-.254-.498-.469-.615-.215-.122-.513-.183-.894-.183-.283 0-.527.05-.732.153a1.18 1.18 0 0 0-.505.477c-.132.22-.23.507-.293.864a8.202 8.202 0 0 0-.088 1.303v1.824c0 .503.027.933.08 1.289.054.352.14.64.257.864a1.1 1.1 0 0 0 .476.491c.205.103.464.154.776.154.361 0 .652-.054.872-.161.224-.108.39-.3.498-.579.107-.278.168-.674.183-1.186ZM87.436 100.84v1.78c0 .752-.093 1.411-.279 1.978-.18.561-.439 1.032-.776 1.413a3.17 3.17 0 0 1-1.208.85c-.47.19-.99.285-1.56.285a4.173 4.173 0 0 1-1.568-.285 3.312 3.312 0 0 1-1.216-.85c-.336-.381-.598-.852-.783-1.413-.186-.567-.279-1.226-.279-1.978v-1.78c0-.771.09-1.445.271-2.021.181-.581.442-1.065.784-1.45.342-.391.747-.684 1.216-.88.469-.2.989-.3 1.56-.3.571 0 1.091.1 1.56.3.469.196.874.489 1.216.88.342.385.603.869.784 1.45.185.576.278 1.25.278 2.021Zm-2.132 1.78v-1.794c0-.508-.036-.94-.11-1.297-.073-.361-.183-.656-.329-.886a1.386 1.386 0 0 0-.535-.505 1.587 1.587 0 0 0-.732-.161c-.278 0-.525.053-.74.16-.21.108-.388.277-.535.506-.141.23-.248.525-.322.886a7.003 7.003 0 0 0-.102 1.297v1.794c0 .488.036.906.11 1.253.073.346.183.629.33.849.146.22.324.383.534.491.215.102.461.154.74.154.273 0 .515-.052.725-.154.215-.108.393-.271.534-.491.142-.22.25-.503.323-.849.073-.347.11-.765.11-1.253ZM68.856 105.337h.102c.469 0 .87-.068 1.201-.205.337-.136.61-.337.82-.6.215-.269.372-.596.47-.982a5.54 5.54 0 0 0 .146-1.34v-2.058c0-.381-.027-.71-.08-.989a2.531 2.531 0 0 0-.228-.703 1.221 1.221 0 0 0-.33-.425.64.64 0 0 0-.395-.139.628.628 0 0 0-.44.176 1.35 1.35 0 0 0-.322.454c-.083.19-.146.408-.19.652a4.29 4.29 0 0 0-.066.761c0 .269.022.525.066.769.044.24.11.452.198.638.087.18.2.322.336.425.137.102.3.153.491.153.156 0 .3-.044.432-.132.132-.092.247-.212.345-.358.102-.152.18-.318.234-.498.059-.186.09-.374.095-.564l.667.417c0 .332-.061.662-.183.989-.118.327-.281.625-.491.893-.21.269-.454.484-.733.645a1.759 1.759 0 0 1-.886.234c-.425 0-.8-.09-1.128-.271a2.507 2.507 0 0 1-.827-.761 3.598 3.598 0 0 1-.498-1.136 5.664 5.664 0 0 1-.169-1.42c0-.518.071-1.004.213-1.458a3.88 3.88 0 0 1 .622-1.209c.269-.346.593-.617.974-.813.381-.2.806-.3 1.275-.3.463 0 .883.103 1.26.308.375.205.698.5.966.886.269.38.474.84.615 1.377.147.532.22 1.128.22 1.787v.732c0 .704-.06 1.355-.183 1.956a6.13 6.13 0 0 1-.557 1.611 4.44 4.44 0 0 1-.93 1.231 3.877 3.877 0 0 1-1.303.776c-.494.176-1.053.264-1.678.264h-.131v-1.773ZM61.313 105.198v1.436c0 .556-.137 1.113-.41 1.67a4.179 4.179 0 0 1-1.04 1.377l-1.1-.572c.123-.224.243-.451.36-.681a3.94 3.94 0 0 0 .293-.747c.078-.273.117-.586.117-.937v-1.546h1.78ZM56.933 96.336V107h-2.13V96.336h2.13ZM45.809 96.336h3.42c.713 0 1.32.122 1.824.366.503.244.888.606 1.157 1.084.268.479.403 1.07.403 1.773 0 .576-.078 1.069-.235 1.479a2.735 2.735 0 0 1-.666 1.018 3.297 3.297 0 0 1-1.033.645l-.652.388h-2.776l-.007-1.78h1.926c.293 0 .535-.063.725-.19.196-.132.34-.315.432-.55.098-.239.147-.517.147-.835 0-.337-.044-.625-.132-.864a1.064 1.064 0 0 0-.403-.556c-.18-.132-.417-.198-.71-.198h-1.274V107h-2.146V96.336ZM50.648 107l-1.955-4.753 2.249-.008 2 4.658V107H50.65ZM40.199 96.336V107h-2.146V96.336h2.146Zm3.34 4.534v1.772h-3.882v-1.772h3.882Zm.41-4.534v1.78h-4.292v-1.78h4.292Z"/>
        <path fill="#${colors.SETTING_TIME_COLOR}" d="M95.069 86V63.6h15.68v4.48h-11.2v4.48h11.2V86h-15.68Zm4.48-8.96v4.48h6.72v-4.48h-6.72ZM90.912 63.6V86h-15.68v-4.48h11.2v-4.48h-8.96v-4.48h8.96v-4.48h-11.2V63.6h15.68ZM66.584 86v-4.48h4.48V86h-4.48Zm0-13.44v-4.48h4.48v4.48h-4.48ZM46.747 86V63.6h15.68V86h-15.68Zm4.48-17.92v13.44h6.72V68.08h-6.72ZM30.255 68.08V63.6h8.96v17.92h4.48V86h-13.44v-4.48h4.48V68.08h-4.48Z"/>
    </svg>
    `;
    return svg;
  }

  function injectPresetSVGs() {
    var presetSelector = document.querySelectorAll('[data-option-value]');
    presetSelector.forEach(option => {
      var presetName = option.getAttribute('data-option-value');
      if (presets[presetName]) {
        var svgPreview = generatePresetSVG(presets[presetName]);
        option.innerHTML += `<div style="zoom: 0.5">${svgPreview}</div>`;
      }
    });
  }

  function updateSVGColors(colorKey, colorValue) {
    var svgContainer = document.getElementById('svg-preview');
    if (!svgContainer) return;

    var element = svgContainer.querySelector('#' + colorKey);
    if (element) {
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

      var colors = presets[selectedPreset];
      Object.keys(colors).forEach(function (key) {
        var item = clayConfig.getItemByMessageKey(key);
        if (item) {
          item.set(colors[key]);
        }
        updateSVGColors(key, colors[key]); 
      });
    }
  }

  function attachColorListeners() {
    var colorKeys = Object.keys(presets.classic);

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

    applyPreset();
    attachColorListeners();
    injectPresetSVGs();
    var colorKeys = Object.keys(presets.classic);
    colorKeys.forEach(function (key) {
      var colorValue = clayConfig.getItemByMessageKey(key).get();
      updateSVGColors(key, colorValue);
    });
  });
};