import cors from 'cors';
import express from 'express';
import { HttpError } from './errors.js';
import { createCitiesService } from './services/citiesService.js';
import { createCitySuggestionService } from './services/citySuggestionService.js';
import { parseCityName, parseId, parseSuggestionQuery } from './validation.js';

// Builds the Express app. Dependencies are passed in so tests can use an
// in-memory database and a fake weather service.
export function createApp({
  db,
  weatherService,
  citySuggestionService = createCitySuggestionService(),
  corsOrigins = [],
  logger = console,
}) {
  const cities = createCitiesService({ db, weatherService });
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  // One log line per request: method, path, status, duration.
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });

  app.get('/api/health', (req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
  });

  app.get('/api/weather/:city', async (req, res) => {
    const city = parseCityName(req.params.city);
    res.json(await weatherService.getForecast(city));
  });

  app.get('/api/cities', (req, res) => {
    res.json(cities.list());
  });

  app.get('/api/cities/suggestions', async (req, res) => {
    const query = parseSuggestionQuery(req.query.q);
    if (query.length < 2) return res.json([]);
    res.json(await citySuggestionService.suggest(query));
  });

  app.post('/api/cities', async (req, res) => {
    const name = parseCityName(req.body?.name);
    res.status(201).json(await cities.add(name));
  });

  app.delete('/api/cities/:id', (req, res) => {
    cities.remove(parseId(req.params.id));
    res.status(204).end();
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
  });

  // Every error becomes the same JSON shape: { error: { code, message } }.
  // Unexpected errors are logged in full but only a generic message is sent.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' } });
    }
    logger.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
  });

  return app;
}
