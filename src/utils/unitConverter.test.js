import { describe, expect, it } from 'vitest';
import {
  convertDistance,
  convertPressure,
  convertTemp,
  convertWind,
  formatClock,
  formatPressure,
  formatTemp,
} from './unitConverter';

describe('unit conversion from metric', () => {
  it('converts temperature', () => {
    expect(convertTemp(0, 'Fahrenheit')).toBe(32);
    expect(convertTemp(30, 'Fahrenheit')).toBe(86);
    expect(convertTemp(21.44, 'Celsius')).toBe(21.4);
  });

  it('converts wind speed', () => {
    expect(convertWind(36, 'Ms')).toBe(10);
    expect(convertWind(16.09344, 'Mph')).toBe(10);
    expect(convertWind(12, 'Kmh')).toBe(12);
  });

  it('converts pressure, including mmHg (was broken before)', () => {
    expect(convertPressure(1013, 'Mmhg')).toBe(759.8);
    expect(convertPressure(1013, 'Kpa')).toBe(101.3);
    expect(convertPressure(1013, 'Inches')).toBe(29.91);
    expect(convertPressure(1013, 'Hpa')).toBe(1013);
  });

  it('converts distance', () => {
    expect(convertDistance(8.5, 'Meters')).toBe(8500);
    expect(convertDistance(8.5, 'Kilometers')).toBe(8.5);
  });
});

describe('formatting', () => {
  const settings = { Temperature: 'Celsius', Pressure: 'Mmhg' };

  it('adds units and handles missing values', () => {
    expect(formatTemp(25, settings)).toBe('25°');
    expect(formatPressure(1013, settings)).toBe('759.8 mmHg');
    expect(formatTemp(undefined, settings)).toBe('–');
  });

  it('formats clock times in 24h and 12h', () => {
    expect(formatClock('17:32:00', false)).toBe('17:32');
    expect(formatClock('17:32:00', true)).toBe('5:32 PM');
    expect(formatClock('00:05:00', true)).toBe('12:05 AM');
  });
});
