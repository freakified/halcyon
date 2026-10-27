#!/usr/bin/env node
// Verifies that every language in src/pkjs/languages/<code>.js is present and
// has complete weather, cardinal, and label strings.
// Run via `pnpm check:i18n`.

var fs = require('fs');
var path = require('path');
var Languages = require('../src/pkjs/languages');

var LANG_DIR = path.join(__dirname, '..', 'src', 'pkjs', 'languages');
var LANG_ORDER = Languages.LANG_ORDER;
var LANGUAGES = Languages.LANGUAGES;
var failures = [];

function isString(v) {
  return typeof v === 'string' && v.length > 0;
}

function sortedNumericKeys(obj) {
  return Object.keys(obj).sort(function (a, b) {
    return Number(a) - Number(b);
  });
}

function checkString(label, value) {
  if (!isString(value)) {
    failures.push(label + ': missing or empty');
  }
}

if (!Array.isArray(LANG_ORDER) || LANG_ORDER.length === 0) {
  failures.push('LANG_ORDER: missing or empty');
}

var baseCode = LANG_ORDER[0];
var base = baseCode && LANGUAGES[baseCode];
if (!base) {
  failures.push('LANGUAGES.' + (baseCode || '<first>') + ': missing');
}

var weatherKeys = base && base.weather ? sortedNumericKeys(base.weather) : [];
var labelKeys = base && base.labels ? Object.keys(base.labels).sort() : [];

LANG_ORDER.forEach(function (code, i) {
  var lang = LANGUAGES[code];
  var file = path.join(LANG_DIR, code + '.js');

  if (!fs.existsSync(file)) {
    failures.push(code + ': missing file src/pkjs/languages/' + code + '.js');
  }

  if (!lang) {
    failures.push(code + ': missing from LANGUAGES');
    return;
  }

  if (!lang.weather || typeof lang.weather !== 'object') {
    failures.push(code + '.weather: missing or not an object');
  } else {
    weatherKeys.forEach(function (k) {
      checkString(code + '.weather[' + k + ']', lang.weather[k]);
    });
  }

  if (!Array.isArray(lang.cardinals) || lang.cardinals.length !== 8) {
    failures.push(code + '.cardinals: expected 8 directions, got ' + (Array.isArray(lang.cardinals) ? lang.cardinals.length : 'non-array'));
  } else {
    lang.cardinals.forEach(function (d, j) {
      checkString(code + '.cardinals[' + j + ']', d);
    });
  }

  if (!lang.labels || typeof lang.labels !== 'object') {
    failures.push(code + '.labels: missing or not an object');
  } else {
    labelKeys.forEach(function (k) {
      checkString(code + '.labels.' + k, lang.labels[k]);
    });
  }

  if (Languages.getLang(i) !== lang) {
    failures.push(code + ': getLang(' + i + ') returned the wrong language');
  }
});

Object.keys(LANGUAGES).forEach(function (code) {
  if (LANG_ORDER.indexOf(code) === -1) {
    failures.push(code + ': exists in LANGUAGES but not LANG_ORDER');
  }
});

console.log('Checked ' + LANG_ORDER.length + ' languages, ' + weatherKeys.length + ' weather codes, cardinals, and ' + labelKeys.length + ' labels.');

if (failures.length > 0) {
  console.error('\nFAILED with ' + failures.length + ' issue(s):');
  failures.forEach(function (f) { console.error('  - ' + f); });
  process.exit(1);
}

console.log('OK - all localized language files are complete.');
