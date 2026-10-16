import { HttpError } from '../errors.js';

const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Talks to Visual Crossing and returns only the fields the frontend uses.
// Units are always metric (°C, km/h, hPa, km); the frontend converts them
// to the user's preferred units.
export function createWeatherService({ apiKey, fetchImpl = fetch, timeoutMs = 10_000 }) {
  async function getForecast(city) {
    if (!apiKey) {
      throw new HttpError(500, 'MISSING_API_KEY', 'WEATHER_API_KEY is not configured on the server.');
    }
    const url =
      `${BASE_URL}/${encodeURIComponent(city)}` +
      `?unitGroup=metric&include=current,days,hours&contentType=json&key=${encodeURIComponent(apiKey)}`;

    let response;
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new HttpError(502, 'UPSTREAM_UNAVAILABLE', 'Weather provider could not be reached.');
    }

    // Visual Crossing answers 400 for an unknown location.
    if (response.status === 400 || response.status === 404) {
      throw new HttpError(404, 'CITY_NOT_FOUND', `No weather data found for "${city}".`);
    }
    if (response.status === 429) {
      throw new HttpError(503, 'UPSTREAM_RATE_LIMITED', 'Weather provider limit reached. Try again later.');
    }
    if (!response.ok) {
      throw new HttpError(502, 'UPSTREAM_ERROR', `Weather provider returned status ${response.status}.`);
    }

    return toForecast(await response.json());
  }

  return { getForecast };
}

// Maps the large upstream payload to the small shape the UI needs.
export function toForecast(raw) {
  const current = raw.currentConditions ?? {};
  return {
    address: raw.address,
    resolvedAddress: raw.resolvedAddress,
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone,
    current: {
      datetimeEpoch: current.datetimeEpoch,
      temp: current.temp,
      feelslike: current.feelslike,
      humidity: current.humidity,
      precipprob: current.precipprob,
      windspeed: current.windspeed,
      pressure: current.pressure,
      visibility: current.visibility,
      uvindex: current.uvindex,
      sunset: current.sunset,
      icon: current.icon,
    },
    days: (raw.days ?? []).slice(0, 7).map((day) => ({
      datetime: day.datetime,
      datetimeEpoch: day.datetimeEpoch,
      temp: day.temp,
      tempmax: day.tempmax,
      tempmin: day.tempmin,
      precipprob: day.precipprob,
      icon: day.icon,
      hours: (day.hours ?? []).map((hour) => ({
        datetime: hour.datetime,
        temp: hour.temp,
        icon: hour.icon,
      })),
    })),
  };
}
