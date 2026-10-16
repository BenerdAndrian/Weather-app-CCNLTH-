import { createContext, useContext } from 'react';
import { UNIT_OPTIONS } from '../utils/unitConverter';

// Settings are client state (they belong to this browser, not the server),
// persisted in localStorage so they survive a reload.
export const STORAGE_KEY = 'userSettings';

export const DEFAULT_SETTINGS = {
  Temperature: 'Fahrenheit',
  Wind: 'Mph',
  Pressure: 'Hpa',
  Distance: 'Kilometers',
  '12FormatTimer': false,
  getByGPS: false,
  notification: false,
};

// Reads saved settings and drops any value that is no longer valid
// (older versions stored e.g. "Celcius" or "Mm").
export function loadSettings(storage = window.localStorage) {
  let saved = {};
  try {
    saved = JSON.parse(storage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    saved = {};
  }
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const value = saved[key];
    const valid = UNIT_OPTIONS[key] ? UNIT_OPTIONS[key].includes(value) : typeof value === 'boolean';
    if (valid) settings[key] = value;
  }
  return settings;
}

export const SettingsContext = createContext(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>');
  return context;
}
