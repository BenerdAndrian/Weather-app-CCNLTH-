// The backend always sends metric values: °C, km/h, hPa, km.
// These pure functions convert them to the unit chosen in Settings.

export const UNIT_OPTIONS = {
  Temperature: ['Celsius', 'Fahrenheit'],
  Wind: ['Kmh', 'Ms', 'Mph'],
  Pressure: ['Hpa', 'Inches', 'Kpa', 'Mmhg'],
  Distance: ['Kilometers', 'Meters'],
};

const round = (value, digits = 1) => Number(value.toFixed(digits));
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export function convertTemp(celsius, unit) {
  return unit === 'Fahrenheit' ? round((celsius * 9) / 5 + 32) : round(celsius);
}

export function convertWind(kmh, unit) {
  if (unit === 'Ms') return round(kmh / 3.6);
  if (unit === 'Mph') return round(kmh / 1.609344);
  return round(kmh);
}

export function convertPressure(hpa, unit) {
  if (unit === 'Inches') return round(hpa * 0.02953, 2);
  if (unit === 'Kpa') return round(hpa / 10);
  if (unit === 'Mmhg') return round(hpa * 0.750062);
  return round(hpa);
}

export function convertDistance(km, unit) {
  return unit === 'Meters' ? round(km * 1000, 0) : round(km);
}

const SUFFIX = {
  Celsius: '°C', Fahrenheit: '°F',
  Kmh: ' km/h', Ms: ' m/s', Mph: ' mph',
  Hpa: ' hPa', Inches: ' inHg', Kpa: ' kPa', Mmhg: ' mmHg',
  Kilometers: ' km', Meters: ' m',
};

const EMPTY = '–';

export function formatTemp(celsius, settings) {
  return isNumber(celsius) ? `${convertTemp(celsius, settings.Temperature)}°` : EMPTY;
}
export function formatWind(kmh, settings) {
  return isNumber(kmh) ? `${convertWind(kmh, settings.Wind)}${SUFFIX[settings.Wind]}` : EMPTY;
}
export function formatPressure(hpa, settings) {
  return isNumber(hpa) ? `${convertPressure(hpa, settings.Pressure)}${SUFFIX[settings.Pressure]}` : EMPTY;
}
export function formatDistance(km, settings) {
  return isNumber(km) ? `${convertDistance(km, settings.Distance)}${SUFFIX[settings.Distance]}` : EMPTY;
}

// "17:32:00" -> "17:32" or "5:32 PM"
export function formatClock(hhmmss, twelveHour) {
  if (!hhmmss) return EMPTY;
  const [h, m] = hhmmss.split(':').map(Number);
  if (!twelveHour) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}
