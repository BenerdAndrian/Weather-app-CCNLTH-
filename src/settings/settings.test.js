import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, STORAGE_KEY } from './settings';

describe('loadSettings', () => {
  it('returns defaults when nothing is stored or the JSON is broken', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, '{oops');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values and drops values from older versions', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ Temperature: 'Celcius', Pressure: 'Mm', Wind: 'Ms', '12FormatTimer': true }),
    );
    const settings = loadSettings();
    expect(settings.Temperature).toBe(DEFAULT_SETTINGS.Temperature);
    expect(settings.Pressure).toBe(DEFAULT_SETTINGS.Pressure);
    expect(settings.Wind).toBe('Ms');
    expect(settings['12FormatTimer']).toBe(true);
  });
});
