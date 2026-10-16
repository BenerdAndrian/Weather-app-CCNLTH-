import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db.js';
import { createWeatherService } from './services/weatherService.js';

const config = loadConfig();
if (!config.weatherApiKey) {
  console.warn('WEATHER_API_KEY is not set: weather endpoints will answer 500 MISSING_API_KEY.');
}

const db = openDatabase(config.dbPath);
const weatherService = createWeatherService({ apiKey: config.weatherApiKey });
const app = createApp({ db, weatherService, corsOrigins: config.corsOrigins });

app.listen(config.port, () => {
  console.info(`API listening on http://localhost:${config.port}`);
});
