// Host checks for the hosted-page/PBW capability handshake; no phone or network.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const dir = mkdtempSync(join(tmpdir(), 'halcyon-settings-'));
try {
  const { buildSync } = require('../config-page/node_modules/esbuild');
  for (const name of ['watchSettings', 'defaultSettings']) {
    buildSync({ entryPoints: [`config-page/src/utils/${name}.ts`], bundle: true,
      platform: 'node', format: 'cjs', outfile: join(dir, `${name}.cjs`) });
  }
  const { supportsSolarThemes, settingsForWatch } = require(join(dir, 'watchSettings.cjs'));
  const { getDefaultSettings } = require(join(dir, 'defaultSettings.cjs'));
  const defaults = getDefaultSettings({ BW: false, HEALTH: true });
  const currentKeys = JSON.parse(readFileSync('package.json')).pebble.messageKeys;
  const legacyKeys = currentKeys.filter(key => key !== 'SETTING_DYNAMIC_SOLAR_THEME');

  function phone(keys) {
    const listeners = {}, messages = [], urls = [], storage = new Map();
    vm.runInNewContext(readFileSync('src/pkjs/index.js', 'utf8'), {
      require: name => name === './configDataUri' ? 'https://halcyon.freakified.net/' : require(`../src/pkjs/${name.slice(2)}`),
      console: { log() {} },
      localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
      Pebble: {
        addEventListener: (name, callback) => { listeners[name] = callback; },
        getActiveWatchInfo: () => ({ platform: 'gabbro', model: 'qemu_platform_gabbro', language: 'en_US', firmware: { major: 4, minor: 44 } }),
        openURL: url => urls.push(url),
        sendAppMessage: (message, success) => {
          for (const key of Object.keys(message)) assert(keys.includes(key), `unsupported watch key: ${key}`);
          messages.push(message);
          success?.();
        }
      }
    });
    return { listeners, messages, urls };
  }

  // A current phone script must advertise support, independently of saved settings.
  const current = phone(currentKeys);
  current.listeners.showConfiguration();
  assert(supportsSolarThemes(new URL(current.urls[0]).search));

  let saves = 0;
  for (const search of ['', '?watchInfo=%7B%7D', '?solarThemes=0', '?solarThemes=true', '?solarThemes=1']) {
    for (const enabled of [0, 1]) {
      const supported = supportsSolarThemes(search);
      const settings = { ...defaults, SETTING_DYNAMIC_SOLAR_THEME: enabled };
      const before = JSON.stringify(settings);
      const payload = settingsForWatch(settings, supported);
      assert.equal(Object.hasOwn(payload, 'SETTING_DYNAMIC_SOLAR_THEME'), supported);
      if (supported) assert.equal(payload.SETTING_DYNAMIC_SOLAR_THEME, enabled);
      assert.equal(JSON.stringify(settings), before, 'serializing must not mutate source settings');
      for (const key of ['SETTING_THEME', 'SETTING_NIGHT_THEME', 'SETTING_WIDGET_THEME']) assert(!Object.hasOwn(payload, key));
      const bridge = phone(supported ? currentKeys : legacyKeys);
      bridge.listeners.webviewclosed({ response: encodeURIComponent(JSON.stringify(payload)) });
      assert(bridge.messages.length > 0);
      assert.equal(Object.hasOwn(bridge.messages[0], 'SETTING_DYNAMIC_SOLAR_THEME'), supported);
      assert.equal(bridge.messages[0].SETTING_TIME_COLOR, parseInt(settings.SETTING_TIME_COLOR, 16));
      saves++;
    }
  }
  assert.equal(settingsForWatch(defaults, true).SETTING_DYNAMIC_SOLAR_THEME, 0, 'Reset must send an explicit off value to supported watches');
  console.log(`PASS: ${saves} settings saves through actual PKJS with current/legacy message-key validation; capability URL, reset and source preservation.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
