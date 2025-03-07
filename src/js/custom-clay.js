module.exports = function (minified) {
  var clayConfig = this;
  var _ = minified._;
  var $ = minified.$;
  var HTML = minified.HTML;

function decimalToHex(decimalColor) {
    return decimalColor.toString(16).padStart(2, '0');
}

// for some reason clay returns colors as decimals
function convertToHexFromDecimal(decimal) {
    // Extract Red, Green, and Blue components
    const r = (decimal >> 16) & 0xFF;
    const g = (decimal >> 8) & 0xFF;
    const b = decimal & 0xFF;

    // Convert each component to hex
    return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
}

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
    var colorPicker = clayConfig.getItemByMessageKey('background_color');

    function updateColorPreview() {
      var newColor = convertToHexFromDecimal(colorPicker.get());
      console.log(newColor);
      document.getElementById('color-box').style.backgroundColor = newColor;
      // $('#color-box').set({ style: 'background:' + newColor });
    }

    colorPicker.on('change', updateColorPreview);
    updateColorPreview();
  });
};