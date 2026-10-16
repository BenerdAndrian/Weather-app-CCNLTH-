// All configuration comes from environment variables (see .env.example).
// Secrets such as the Visual Crossing key never leave the server.
export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 3001,
    weatherApiKey: env.WEATHER_API_KEY || '',
    dbPath: env.DB_PATH || './data/weather.db',
    // Comma-separated list of origins allowed to call the API from a browser.
    corsOrigins: (env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
