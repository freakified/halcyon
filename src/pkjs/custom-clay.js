module.exports = function (minified) {
  var clayConfig = this;
  var _ = minified._;
  var $ = minified.$;

  // Define presets
  var presets = {
    default: {
      SETTING_TIME_COLOR: "000000",
      SETTING_SUBTEXT_PRIMARY_COLOR: "000000",
      SETTING_SUBTEXT_SECONDARY_COLOR: "555555",
      SETTING_BG_COLOR: "FFFFFF",
      SETTING_PIP_COLOR_PRIMARY: "000000",
      SETTING_PIP_COLOR_SECONDARY: "AAAAAA",
      SETTING_RING_STROKE_COLOR: "000000",
      SETTING_RING_NIGHT_COLOR: "0055AA",
      SETTING_RING_DAY_COLOR: "00AAFF",
      SETTING_RING_SUNRISE_COLOR: "FFAAAA",
      SETTING_RING_SUNSET_COLOR: "FFAA00",
      SETTING_SUN_STROKE_COLOR: "000000",
      SETTING_SUN_FILL_COLOR: "FFFF00"
    },
    orangeDreams: {
      SETTING_TIME_COLOR: "FF5500",
      SETTING_SUBTEXT_PRIMARY_COLOR: "FF5500",
      SETTING_SUBTEXT_SECONDARY_COLOR: "AA0000",
      SETTING_BG_COLOR: "000000",
      SETTING_PIP_COLOR_PRIMARY: "FF5500",
      SETTING_PIP_COLOR_SECONDARY: "AA0000",
      SETTING_RING_STROKE_COLOR: "000000",
      SETTING_RING_NIGHT_COLOR: "000000",
      SETTING_RING_DAY_COLOR: "FF5500",
      SETTING_RING_SUNRISE_COLOR: "AA0000",
      SETTING_RING_SUNSET_COLOR: "AA0000",
      SETTING_SUN_STROKE_COLOR: "000000",
      SETTING_SUN_FILL_COLOR: "FF5500"
    },
    terminalGreen: {
      "SETTING_TIME_COLOR": "00ff00",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "00ff00",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "00aa00",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "00ff00",
      "SETTING_PIP_COLOR_SECONDARY": "005500",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "00ff00",
      "SETTING_RING_SUNRISE_COLOR": "005500",
      "SETTING_RING_SUNSET_COLOR": "005500",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "00ff00"
    },
    mauveTheme: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffffff",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffffff",
      "SETTING_BG_COLOR": "aa00aa",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "550055",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "550055",
      "SETTING_RING_DAY_COLOR": "aa55aa",
      "SETTING_RING_SUNRISE_COLOR": "aa00aa",
      "SETTING_RING_SUNSET_COLOR": "aa00aa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    },
    fireworkTheme: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffaa00",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "aa0000",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "ff5500",
      "SETTING_PIP_COLOR_SECONDARY": "aa0000",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "000000",
      "SETTING_RING_SUNRISE_COLOR": "aa0000",
      "SETTING_RING_SUNSET_COLOR": "aa0000",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffaa00"
    },
    lightOceanTheme: {
      "SETTING_TIME_COLOR": "000000",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "000000",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "aaaaaa",
      "SETTING_BG_COLOR": "ffffff",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "aaaaaa",
      "SETTING_RING_STROKE_COLOR": "ffffff",
      "SETTING_RING_NIGHT_COLOR": "0055aa",
      "SETTING_RING_DAY_COLOR": "ffffff",
      "SETTING_RING_SUNRISE_COLOR": "00aaff",
      "SETTING_RING_SUNSET_COLOR": "00aaff",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffff00"
    },
    roseTheme: {
      "SETTING_TIME_COLOR": "000000",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "000000",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "555555",
      "SETTING_BG_COLOR": "ffffff",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "aaaaaa",
      "SETTING_RING_STROKE_COLOR": "ffffff",
      "SETTING_RING_NIGHT_COLOR": "ff00aa",
      "SETTING_RING_DAY_COLOR": "ffffff",
      "SETTING_RING_SUNRISE_COLOR": "ffaaaa",
      "SETTING_RING_SUNSET_COLOR": "ffaaaa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffff00"
    },
    oceanTheme: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffffff",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffffff",
      "SETTING_BG_COLOR": "000055",
      "SETTING_PIP_COLOR_PRIMARY": "ffffff",
      "SETTING_PIP_COLOR_SECONDARY": "0055aa",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "0000aa",
      "SETTING_RING_DAY_COLOR": "00aaff",
      "SETTING_RING_SUNRISE_COLOR": "0055ff",
      "SETTING_RING_SUNSET_COLOR": "0055ff",
      "SETTING_SUN_STROKE_COLOR": "ffffff",
      "SETTING_SUN_FILL_COLOR": "00aaff"
    },
    sandTheme: {
      "SETTING_TIME_COLOR": "000000",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "000000",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "550000",
      "SETTING_BG_COLOR": "ffff00",
      "SETTING_PIP_COLOR_PRIMARY": "aa5500",
      "SETTING_PIP_COLOR_SECONDARY": "ffaa00",
      "SETTING_RING_STROKE_COLOR": "ffff00",
      "SETTING_RING_NIGHT_COLOR": "aa5500",
      "SETTING_RING_DAY_COLOR": "ffff00",
      "SETTING_RING_SUNRISE_COLOR": "ffaa00",
      "SETTING_RING_SUNSET_COLOR": "ffaa00",
      "SETTING_SUN_STROKE_COLOR": "aa5500",
      "SETTING_SUN_FILL_COLOR": "ffaa55"
    },
    greyTheme: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffffff",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffffff",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "ffffff",
      "SETTING_PIP_COLOR_SECONDARY": "aaaaaa",
      "SETTING_RING_STROKE_COLOR": "ffffff",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "aaaaaa",
      "SETTING_RING_SUNRISE_COLOR": "555555",
      "SETTING_RING_SUNSET_COLOR": "555555",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    },
    userTeal1: {
      "SETTING_TIME_COLOR": "00aaaa",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffff55",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffaa55",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "000000",
      "SETTING_RING_STROKE_COLOR": "005555",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "55ffff",
      "SETTING_RING_SUNRISE_COLOR": "ff5500",
      "SETTING_RING_SUNSET_COLOR": "ff5500",
      "SETTING_SUN_STROKE_COLOR": "005555",
      "SETTING_SUN_FILL_COLOR": "ffff55"
    },
    bwTheme1: {
      "SETTING_TIME_COLOR": "000000",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "000000",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "000000",
      "SETTING_BG_COLOR": "ffffff",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "000000",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "ffffff",
      "SETTING_RING_SUNRISE_COLOR": "aaaaaa",
      "SETTING_RING_SUNSET_COLOR": "aaaaaa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    },
    bwTheme2: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffffff",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffffff",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "ffffff",
      "SETTING_PIP_COLOR_SECONDARY": "ffffff",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "ffffff",
      "SETTING_RING_SUNRISE_COLOR": "aaaaaa",
      "SETTING_RING_SUNSET_COLOR": "aaaaaa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    },
    bwTheme3: {
      "SETTING_TIME_COLOR": "000000",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "000000",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "aaaaaa",
      "SETTING_BG_COLOR": "ffffff",
      "SETTING_PIP_COLOR_PRIMARY": "000000",
      "SETTING_PIP_COLOR_SECONDARY": "000000",
      "SETTING_RING_STROKE_COLOR": "ffffff",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "ffffff",
      "SETTING_RING_SUNRISE_COLOR": "aaaaaa",
      "SETTING_RING_SUNSET_COLOR": "aaaaaa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    },
    bwTheme4: {
      "SETTING_TIME_COLOR": "ffffff",
      "SETTING_SUBTEXT_PRIMARY_COLOR": "ffffff",
      "SETTING_SUBTEXT_SECONDARY_COLOR": "ffffff",
      "SETTING_BG_COLOR": "000000",
      "SETTING_PIP_COLOR_PRIMARY": "ffffff",
      "SETTING_PIP_COLOR_SECONDARY": "ffffff",
      "SETTING_RING_STROKE_COLOR": "000000",
      "SETTING_RING_NIGHT_COLOR": "000000",
      "SETTING_RING_DAY_COLOR": "000000",
      "SETTING_RING_SUNRISE_COLOR": "aaaaaa",
      "SETTING_RING_SUNSET_COLOR": "aaaaaa",
      "SETTING_SUN_STROKE_COLOR": "000000",
      "SETTING_SUN_FILL_COLOR": "ffffff"
    }
  };

  function decimalToHex(decimalColor) {
    return ('0' + decimalColor.toString(16)).slice(-2);
  }

  function convertToHexFromDecimal(decimal) {
    var r = (decimal >> 16) & 0xFF;
    var g = (decimal >> 8) & 0xFF;
    var b = decimal & 0xFF;
    return '#' + decimalToHex(r) + decimalToHex(g) + decimalToHex(b);
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
    ];

    var items = [];
    for (var i = 0; i < customFields.length; i++) {
      var key = customFields[i];
      var item = clayConfig.getItemByMessageKey(key);
      items.push(item);
    }

    for (var j = 0; j < items.length; j++) {
      var currentItem = items[j];
      if (currentItem) {
        if (show) {
          currentItem.show();
        } else {
          currentItem.hide();
        }
      }
    }
  }


  function generatePresetSVG(colors, isRoundWatch) {
    var svg;
    if (isRoundWatch) {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" fill="none">' +
      '<path fill="#' + colors.SETTING_BG_COLOR + '" d="M164 90c0 40.869-33.131 74-74 74-40.87 0-74-33.131-74-74 0-40.87 33.13-74 74-74 40.869 0 74 33.13 74 74Z"/>' +
      '<path fill="#' + colors.SETTING_PIP_COLOR_PRIMARY + '" fill-rule="evenodd" d="M157 89h5v2h-5v-2ZM89 23v-5h2v5h-2Zm0 139v-5h2v5h-2ZM18 89h5v2h-5v-2Zm120.083 47.669 3.536 3.535-1.414 1.415-3.536-3.536 1.414-1.414ZM39.795 38.381l3.536 3.536-1.414 1.414-3.536-3.536 1.414-1.414Zm3.535 99.702-3.535 3.536-1.414-1.414 3.536-3.536 1.414 1.414Zm98.289-98.288-3.536 3.536-1.414-1.415 3.535-3.535 1.415 1.414Z" clip-rule="evenodd"/>' +
      '<g fill="#' + colors.SETTING_PIP_COLOR_SECONDARY + '" fill-rule="evenodd" clip-rule="evenodd">' +
      '<path d="m106.892 23.092.777-2.897 1.932.517-.777 2.898-1.932-.518ZM70.399 159.288l.776-2.898 1.932.518-.776 2.898-1.932-.518Zm53.235-129.544 1.5-2.598 1.732 1-1.5 2.598-1.732-1Zm-70.5 122.11 1.5-2.598 1.732 1-1.5 2.598-1.732-1ZM71.175 23.61l-.776-2.898 1.932-.517.776 2.897-1.932.518Zm36.494 136.195-.776-2.897 1.931-.518.777 2.898-1.932.517ZM54.634 30.744l-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm70.5 122.11-1.5-2.598 1.732-1 1.5 2.598-1.732 1Z"/>' +
      '<path d="m54.634 30.744-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm70.5 122.11-1.5-2.598 1.732-1 1.5 2.598-1.732 1Zm-95.39-96.488-2.598-1.5 1-1.732 2.598 1.5-1 1.732Zm122.11 70.5-2.598-1.5 1-1.732 2.598 1.5-1 1.732ZM23.092 73.108l-2.897-.777.517-1.932 2.898.777-.518 1.931Zm136.196 36.493-2.898-.777.518-1.932 2.898.777-.518 1.932Zm-135.678-.776-2.898.776-.518-1.932 2.898-.776.518 1.932ZM159.805 72.33l-2.897.777-.518-1.932 2.898-.776.517 1.932ZM30.744 125.366l-2.598 1.5-1-1.732 2.598-1.5 1 1.732Zm122.11-70.5-2.598 1.5-1-1.732 2.598-1.5 1 1.732Z"/>' +
      '</g>' +
      '<path fill="#' + colors.SETTING_RING_NIGHT_COLOR + '" d="M.544 99.885a90 90 0 0 0 178.886.224l-16.037-1.812A73.86 73.86 0 0 1 40.689 144.99a73.86 73.86 0 0 1-24.103-46.878L.544 99.885Z"/>' +
      '<path fill="#' + colors.SETTING_RING_DAY_COLOR + '" d="M179.385 79.497A90.002 90.002 0 0 0 30.515 22.46 90 90 0 0 0 .685 78.92L16.7 80.906a73.861 73.861 0 0 1 146.655.473l16.029-1.883Z"/>' +
      '<path fill="#' + colors.SETTING_RING_SUNRISE_COLOR + '" d="M.555 80.018a90 90 0 0 0-.15 18.51l16.066-1.53a73.86 73.86 0 0 1 .124-15.19l-16.04-1.79Z"/>' +
      '<path fill="#' + colors.SETTING_RING_SUNSET_COLOR + '" d="M179.551 98.977a89.957 89.957 0 0 0-.122-19.096l-16.036 1.815a73.892 73.892 0 0 1 .1 15.671l16.058 1.61Z"/>' +
      '<g fill="#' + colors.SETTING_RING_STROKE_COLOR + '">' +
      '<path d="M.797 78.047a90 90 0 0 0-.37 3.189l16.063 1.572c.085-.875.187-1.747.303-2.618L.797 78.047ZM.342 97.844c.094 1.066.206 2.13.337 3.192l16.017-1.979c-.107-.871-.2-1.745-.276-2.62L.342 97.844ZM179.59 81.416a92.206 92.206 0 0 0-.364-3.19l-16 2.111c.115.871.214 1.744.298 2.618l16.066-1.54Zm-.205 19.089a87.38 87.38 0 0 0 .317-3.194L163.617 96c-.072.875-.159 1.75-.261 2.622l16.029 1.883Z"/>' +
      '<path fill-rule="evenodd" d="M90 161c39.212 0 71-31.788 71-71s-31.788-71-71-71-71 31.788-71 71 31.788 71 71 71Zm0 3c40.869 0 74-33.131 74-74 0-40.87-33.131-74-74-74-40.87 0-74 33.13-74 74 0 40.869 33.13 74 74 74Z" clip-rule="evenodd"/>' +
      '</g>' +
      '<path fill="#' + colors.SETTING_SUBTEXT_PRIMARY_COLOR + '" d="M120.726 105.154v10.664h-2.131v-10.664h2.131Zm2.652 0v1.78h-7.383v-1.78h7.383Zm-10.752 7.112h2.132c-.03.8-.191 1.477-.484 2.028a2.94 2.94 0 0 1-1.252 1.246c-.537.283-1.187.424-1.949.424-.59 0-1.115-.097-1.574-.293a3.14 3.14 0 0 1-1.172-.879c-.322-.385-.567-.861-.733-1.428-.161-.571-.241-1.228-.241-1.97v-1.809c0-.742.085-1.399.256-1.97.176-.572.425-1.05.747-1.436.327-.39.72-.683 1.179-.879.464-.2.987-.3 1.568-.3.776 0 1.426.146 1.948.439.522.293.925.721 1.208 1.282.289.557.462 1.238.52 2.044h-2.146c-.009-.508-.065-.906-.168-1.194-.098-.293-.254-.498-.469-.615-.215-.123-.512-.184-.893-.184-.283 0-.528.052-.733.154a1.187 1.187 0 0 0-.505.476c-.132.22-.23.508-.293.865a8.146 8.146 0 0 0-.088 1.303v1.824c0 .503.027.933.081 1.289.053.352.139.64.256.864a1.1 1.1 0 0 0 .476.491c.205.103.464.154.776.154.362 0 .652-.054.872-.161.225-.108.391-.301.498-.579.107-.278.169-.674.183-1.186Zm-7.243-2.608v1.78c0 .752-.093 1.411-.278 1.978-.181.561-.44 1.032-.777 1.413a3.165 3.165 0 0 1-1.208.85c-.469.19-.989.285-1.56.285a4.175 4.175 0 0 1-1.567-.285 3.311 3.311 0 0 1-1.216-.85 3.988 3.988 0 0 1-.784-1.413c-.186-.567-.278-1.226-.278-1.978v-1.78c0-.771.09-1.445.27-2.021.181-.581.442-1.065.784-1.45a3.26 3.26 0 0 1 1.216-.879 3.919 3.919 0 0 1 1.56-.301c.572 0 1.092.1 1.56.301.469.195.874.488 1.216.879.342.385.603.869.784 1.45.185.576.278 1.25.278 2.021Zm-2.131 1.78v-1.794c0-.508-.037-.94-.11-1.297-.073-.361-.183-.657-.33-.886a1.373 1.373 0 0 0-.534-.505 1.58 1.58 0 0 0-.733-.162c-.278 0-.525.054-.74.162a1.38 1.38 0 0 0-.534.505c-.142.229-.249.525-.323.886a7.02 7.02 0 0 0-.102 1.297v1.794c0 .488.037.906.11 1.252.073.347.183.63.329.85.147.22.325.383.535.491.215.102.462.154.74.154.273 0 .515-.052.725-.154.215-.108.393-.271.535-.491.141-.22.249-.503.322-.85a6.16 6.16 0 0 0 .11-1.252Zm-16.449 2.717h.102c.469 0 .87-.068 1.201-.205a1.98 1.98 0 0 0 .82-.6c.216-.269.372-.596.47-.982a5.54 5.54 0 0 0 .146-1.34v-2.058a5.35 5.35 0 0 0-.08-.989 2.528 2.528 0 0 0-.228-.703 1.221 1.221 0 0 0-.33-.425.64.64 0 0 0-.834.037 1.342 1.342 0 0 0-.322.454c-.083.19-.147.407-.19.652a4.294 4.294 0 0 0-.067.761c0 .269.022.525.066.769.044.24.11.452.198.638.088.18.2.322.337.424a.79.79 0 0 0 .49.154c.157 0 .3-.044.433-.132.132-.092.246-.212.344-.359.102-.151.18-.317.234-.498.059-.185.09-.373.096-.564l.666.418c0 .332-.061.662-.183.989-.117.327-.28.625-.49.893-.21.269-.455.484-.733.645a1.758 1.758 0 0 1-.886.234 2.29 2.29 0 0 1-1.128-.271 2.499 2.499 0 0 1-.828-.762c-.22-.322-.386-.7-.498-1.135a5.665 5.665 0 0 1-.169-1.421c0-.517.071-1.003.213-1.457.146-.459.354-.862.622-1.209.269-.346.594-.617.974-.813a2.7 2.7 0 0 1 1.275-.3c.464 0 .884.103 1.26.308.376.205.698.5.966.886.269.381.474.84.616 1.377.146.532.22 1.128.22 1.787v.732c0 .703-.062 1.355-.184 1.956a6.13 6.13 0 0 1-.556 1.611 4.44 4.44 0 0 1-.93 1.231 3.892 3.892 0 0 1-1.304.776c-.493.176-1.052.264-1.677.264h-.132v-1.773Zm-7.543-.139v1.436c0 .556-.137 1.113-.41 1.67a4.179 4.179 0 0 1-1.04 1.377l-1.099-.572c.122-.224.242-.451.359-.681.117-.225.215-.474.293-.747a3.42 3.42 0 0 0 .117-.937v-1.546h1.78Zm-4.38-8.862v10.664h-2.13v-10.664h2.13Zm-11.124 0h3.42c.713 0 1.321.122 1.824.366.503.244.889.605 1.157 1.084.269.479.403 1.069.403 1.772 0 .577-.078 1.07-.234 1.48a2.736 2.736 0 0 1-.667 1.018 3.315 3.315 0 0 1-1.033.645l-.651.388h-2.776l-.008-1.78h1.927c.293 0 .534-.064.725-.19a1.16 1.16 0 0 0 .432-.55c.097-.239.146-.517.146-.835 0-.337-.044-.625-.132-.864a1.066 1.066 0 0 0-.402-.557c-.181-.131-.418-.197-.71-.197h-1.275v8.884h-2.146v-10.664Zm4.841 10.664-1.956-4.754 2.249-.007 2 4.658v.103h-2.293Zm-10.451-10.664v10.664H56v-10.664h2.146Zm3.34 4.534v1.772h-3.882v-1.772h3.882Zm.41-4.534v1.78h-4.292v-1.78h4.292Z"/>' +
      '<path fill="#' + colors.SETTING_TIME_COLOR + '" d="M41.646 74.832V69.54H52.23v21.168h5.292V96H41.646v-5.292h5.292V74.832h-5.292ZM61.506 96V69.54h18.522V96H61.506Zm5.292-21.168v15.876h7.938V74.832h-7.938ZM85.315 96v-5.292h5.292V96h-5.292Zm0-15.876v-5.292h5.292v5.292h-5.292Zm29.117-10.584V96H95.91v-5.292h13.23v-5.292H98.556v-5.292h10.584v-5.292H95.91V69.54h18.522ZM119.719 96V69.54h18.522V96h-18.522Zm13.23-10.584h-7.938v5.292h7.938v-5.292Zm-7.938-5.292h7.938v-5.292h-7.938v5.292Z"/>' +
      '<path fill="#' + colors.SETTING_SUN_FILL_COLOR + '" d="M69 13.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z"/>' +
      '<path fill="#' + colors.SETTING_SUN_STROKE_COLOR + '" fill-rule="evenodd" d="M60.5 19a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 3a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" clip-rule="evenodd"/>' +
      '</svg>';
    } else {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="168" fill="none">' +
        '<path fill="#' + colors.SETTING_RING_NIGHT_COLOR + '" d="M0 86h144v82H0z"/>' +
        '<path fill="#' + colors.SETTING_RING_DAY_COLOR + '" d="M0 0h144v82H0z"/>' +
        '<path fill="#' + colors.SETTING_SUN_FILL_COLOR + '" d="M52 8.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z"/>' +
        '<path fill="#' + colors.SETTING_SUN_STROKE_COLOR + '" fill-rule="evenodd" d="M43.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 3a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" clip-rule="evenodd"/>' +
        '<path fill="#' + colors.SETTING_RING_SUNRISE_COLOR + '" d="M19 72v25H0V72h19Z"/>' +
        '<path fill="#' + colors.SETTING_RING_SUNSET_COLOR + '" d="M144 72v25h-19V72h19Z"/>' +
        '<path fill="#' + colors.SETTING_BG_COLOR + '" d="M16 16h112v136H16z"/>' +
        '<path fill="#' + colors.SETTING_PIP_COLOR_SECONDARY + '" d="M17 19.121 19.12 17l4.243 4.243-2.122 2.12L17 19.122ZM125.243 17l2.121 2.121-4.243 4.243L121 21.243 125.243 17ZM17 149.243l2.121 2.121 4.243-4.243L21.242 145 17 149.243ZM125.243 151.364l2.121-2.121-4.243-4.243-2.121 2.121 4.243 4.243ZM15.83 105.404l5.949-.783.391 2.975-5.948.783-.392-2.975ZM16.49 38.275l5.796 1.553-.777 2.897-5.795-1.553.777-2.897ZM33.275 151.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.776ZM34.827 22.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM90.595 145.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM87.621 21.779l.783-5.95 2.975.392-.784 5.95-2.974-.392ZM51.62 151.778l.784-5.948 2.974.391-.783 5.949-2.974-.392ZM54.595 15.83l.784 5.949-2.975.391-.783-5.949 2.974-.391ZM106.827 152.286l-1.552-5.796 2.897-.776 1.553 5.795-2.898.777ZM105.275 21.51l1.552-5.796 2.898.776-1.553 5.796-2.897-.777ZM122.221 104.621l5.949.783-.391 2.975-5.949-.783.391-2.975ZM121.714 39.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM15.714 127.827l5.795-1.552.777 2.897-5.796 1.553-.776-2.898ZM16.221 60.621l5.95.783-.392 2.975-5.95-.783.392-2.975ZM122.49 126.275l5.796 1.552-.777 2.898-5.795-1.553.776-2.897ZM121.83 61.404l5.949-.783.391 2.975-5.948.783-.392-2.975Z"/>' +
        '<path fill="#' + colors.SETTING_PIP_COLOR_PRIMARY + '" d="M17 83h6v3h-6v-3ZM70 23v-5h3v5h-3ZM70 151v-6h3v6h-3ZM121 83h6v3h-6v-3Z"/>' +
        '<g fill="#' + colors.SETTING_RING_STROKE_COLOR + '" fill-rule="evenodd" clip-rule="evenodd">' +
        '<path d="M125 19H19v130h106V19ZM16 16v136h112V16H16Z"/>' +
        '<path d="M0 97h19V72H0v3h16v19H0v3ZM144 72h-19v25h19v-3h-16V75h16v-3Z"/>' +
        '</g>' +
        '<path fill="#' + colors.SETTING_SUBTEXT_PRIMARY_COLOR + '" d="M102.779 96.336V107h-2.131V96.336h2.131Zm2.651 0v1.78h-7.383v-1.78h7.383ZM94.679 103.448h2.131c-.029.801-.19 1.477-.483 2.029-.293.546-.71.961-1.253 1.245-.537.283-1.186.424-1.948.424-.59 0-1.116-.097-1.575-.292a3.164 3.164 0 0 1-1.171-.879c-.323-.386-.567-.862-.733-1.429-.161-.571-.242-1.228-.242-1.97v-1.809c0-.742.086-1.399.257-1.97.176-.571.425-1.05.747-1.436.327-.39.72-.683 1.18-.879.463-.2.985-.3 1.567-.3.776 0 1.425.147 1.948.44.522.293.925.72 1.208 1.281.288.557.462 1.238.52 2.044h-2.146c-.01-.508-.066-.906-.168-1.194-.098-.293-.254-.498-.469-.615-.215-.122-.513-.183-.894-.183-.283 0-.527.05-.732.153a1.18 1.18 0 0 0-.505.477c-.132.22-.23.507-.293.864a8.202 8.202 0 0 0-.088 1.303v1.824c0 .503.027.933.08 1.289.054.352.14.64.257.864a1.1 1.1 0 0 0 .476.491c.205.103.464.154.776.154.361 0 .652-.054.872-.161.224-.108.39-.3.498-.579.107-.278.168-.674.183-1.186ZM87.436 100.84v1.78c0 .752-.093 1.411-.279 1.978-.18.561-.439 1.032-.776 1.413a3.17 3.17 0 0 1-1.208.85c-.47.19-.99.285-1.56.285a4.173 4.173 0 0 1-1.568-.285 3.312 3.312 0 0 1-1.216-.85c-.336-.381-.598-.852-.783-1.413-.186-.567-.279-1.226-.279-1.978v-1.78c0-.771.09-1.445.271-2.021.181-.581.442-1.065.784-1.45.342-.391.747-.684 1.216-.88.469-.2.989-.3 1.56-.3.571 0 1.091.1 1.56.3.469.196.874.489 1.216.88.342.385.603.869.784 1.45.185.576.278 1.25.278 2.021Zm-2.132 1.78v-1.794c0-.508-.036-.94-.11-1.297-.073-.361-.183-.656-.329-.886a1.386 1.386 0 0 0-.535-.505 1.587 1.587 0 0 0-.732-.161c-.278 0-.525.053-.74.16-.21.108-.388.277-.535.506-.141.23-.248.525-.322.886a7.003 7.003 0 0 0-.102 1.297v1.794c0 .488.036.906.11 1.253.073.346.183.629.33.849.146.22.324.383.534.491.215.102.461.154.74.154.273 0 .515-.052.725-.154.215-.108.393-.271.534-.491.142-.22.25-.503.323-.849.073-.347.11-.765.11-1.253ZM68.856 105.337h.102c.469 0 .87-.068 1.201-.205.337-.136.61-.337.82-.6.215-.269.372-.596.47-.982a5.54 5.54 0 0 0 .146-1.34v-2.058c0-.381-.027-.71-.08-.989a2.531 2.531 0 0 0-.228-.703 1.221 1.221 0 0 0-.33-.425.64.64 0 0 0-.395-.139.628.628 0 0 0-.44.176 1.35 1.35 0 0 0-.322.454c-.083.19-.146.408-.19.652a4.29 4.29 0 0 0-.066.761c0 .269.022.525.066.769.044.24.11.452.198.638.087.18.2.322.336.425.137.102.3.153.491.153.156 0 .3-.044.432-.132.132-.092.247-.212.345-.358.102-.152.18-.318.234-.498.059-.186.09-.374.095-.564l.667.417c0 .332-.061.662-.183.989-.118.327-.281.625-.491.893-.21.269-.454.484-.733.645a1.759 1.759 0 0 1-.886.234c-.425 0-.8-.09-1.128-.271a2.507 2.507 0 0 1-.827-.761 3.598 3.598 0 0 1-.498-1.136 5.664 5.664 0 0 1-.169-1.42c0-.518.071-1.004.213-1.458a3.88 3.88 0 0 1 .622-1.209c.269-.346.593-.617.974-.813.381-.2.806-.3 1.275-.3.463 0 .883.103 1.26.308.375.205.698.5.966.886.269.38.474.84.615 1.377.147.532.22 1.128.22 1.787v.732c0 .704-.06 1.355-.183 1.956a6.13 6.13 0 0 1-.557 1.611 4.44 4.44 0 0 1-.93 1.231 3.877 3.877 0 0 1-1.303.776c-.494.176-1.053.264-1.678.264h-.131v-1.773ZM61.313 105.198v1.436c0 .556-.137 1.113-.41 1.67a4.179 4.179 0 0 1-1.04 1.377l-1.1-.572c.123-.224.243-.451.36-.681a3.94 3.94 0 0 0 .293-.747c.078-.273.117-.586.117-.937v-1.546h1.78ZM56.933 96.336V107h-2.13V96.336h2.13ZM45.809 96.336h3.42c.713 0 1.32.122 1.824.366.503.244.888.606 1.157 1.084.268.479.403 1.07.403 1.773 0 .576-.078 1.069-.235 1.479a2.735 2.735 0 0 1-.666 1.018 3.297 3.297 0 0 1-1.033.645l-.652.388h-2.776l-.007-1.78h1.926c.293 0 .535-.063.725-.19.196-.132.34-.315.432-.55.098-.239.147-.517.147-.835 0-.337-.044-.625-.132-.864a1.064 1.064 0 0 0-.403-.556c-.18-.132-.417-.198-.71-.198h-1.274V107h-2.146V96.336ZM50.648 107l-1.955-4.753 2.249-.008 2 4.658V107H50.65ZM40.199 96.336V107h-2.146V96.336h2.146Zm3.34 4.534v1.772h-3.882v-1.772h3.882Zm.41-4.534v1.78h-4.292v-1.78h4.292Z"/>' +
        '<path fill="#' + colors.SETTING_TIME_COLOR + '" d="M95.069 86V63.6h15.68v4.48h-11.2v4.48h11.2V86h-15.68Zm4.48-8.96v4.48h6.72v-4.48h-6.72ZM90.912 63.6V86h-15.68v-4.48h11.2v-4.48h-8.96v-4.48h8.96v-4.48h-11.2V63.6h15.68ZM66.584 86v-4.48h4.48V86h-4.48Zm0-13.44v-4.48h4.48v4.48h-4.48ZM46.747 86V63.6h15.68V86h-15.68Zm4.48-17.92v13.44h6.72V68.08h-6.72ZM30.255 68.08V63.6h8.96v17.92h4.48V86h-13.44v-4.48h4.48V68.08h-4.48Z"/>' +
        '</svg>';
    }
    return svg;
  }

  function injectPresetSVGs(isRoundWatch) {
    var presetSelector = document.querySelectorAll('[data-option-value]');
    for (var i = 0; i < presetSelector.length; i++) {
      var option = presetSelector[i];
      var presetName = option.getAttribute('data-option-value');
      if (presets[presetName]) {
        var svgPreview = generatePresetSVG(presets[presetName], isRoundWatch);
        option.innerHTML += '<div style="zoom: 0.5">' + svgPreview + '</div>';
      }
    }
  }

  function updateSVGColors(colorKey, colorValue) {
    var svgContainer = document.getElementById('svg-preview');
    if (!svgContainer) return;

    var element = svgContainer.querySelector('#' + colorKey);
    if (element) {
      var hexColor;
      if (typeof colorValue === 'number') {
        hexColor = convertToHexFromDecimal(colorValue);
      } else {
        hexColor = '#' + colorValue;
      }
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
      var colorKeys = Object.keys(colors);
      for (var i = 0; i < colorKeys.length; i++) {
        var key = colorKeys[i];
        var item = clayConfig.getItemByMessageKey(key);
        if (item) {
          item.set(colors[key]);
        }
        updateSVGColors(key, colors[key]);
      }
    }
  }


  function attachColorListeners() {
    var colorKeys = Object.keys(presets.default);

    for (var i = 0; i < colorKeys.length; i++) {
      var key = colorKeys[i];

      var colorPicker = clayConfig.getItemByMessageKey(key);
      if (colorPicker) {
        (function (localKey, localColorPicker) {
          colorPicker.on('change', function () {
            var newColor = localColorPicker.get();
            updateSVGColors(localKey, newColor);
          });
        })(key, colorPicker);
      }
    }
  }

  function exportTheme() {
    var colorKeys = Object.keys(presets.default);
    var themeData = {};

    // Convert all colors to hex
    for (var i = 0; i < colorKeys.length; i++) {
      var key = colorKeys[i];
      var colorValue = clayConfig.getItemByMessageKey(key).get();

      // Ensure it's always in #RRGGBB format
      if (typeof colorValue === 'number') {
        themeData[key] = convertToHexFromDecimal(colorValue); // Convert decimal to hex
      } else {
        themeData[key] = '#' + colorValue; // Ensure hex is prefixed with #
      }
    }

    // Convert to JSON
    var jsonData = JSON.stringify(themeData, null, 2);
    var blob = new Blob([jsonData], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    // Create a download link
    var a = document.createElement("a");
    a.href = url;
    a.download = "watchface-theme.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }


  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
    var presetSelector = clayConfig.getItemByMessageKey('SETTING_PRESET');
    presetSelector.on('change', applyPreset);

    var isRoundWatch = clayConfig.meta.activeWatchInfo.platform === 'chalk';

    applyPreset();
    attachColorListeners();
    injectPresetSVGs(isRoundWatch);

    var colorKeys = Object.keys(presets.default);
    for (var i = 0; i < colorKeys.length; i++) {
      var key = colorKeys[i];
      var colorValue = clayConfig.getItemByMessageKey(key).get();
      updateSVGColors(key, colorValue);
    }

    // Create export button
    var exportButton = document.createElement("button");
    exportButton.textContent = "Export Theme";
    exportButton.style.cssText = "display: block; margin: 10px auto; padding: 10px; font-size: 16px;";
    exportButton.onclick = exportTheme;

    // Append to settings page
    document.body.appendChild(exportButton);
  });

};