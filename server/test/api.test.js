import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';
import { HttpError } from '../src/errors.js';
import { MAX_SAVED_CITIES } from '../src/services/citiesService.js';

// Fake weather service: knows every city except "Atlantis".
const fakeWeatherService = {
  async getForecast(city) {
    if (city.toLowerCase() === 'atlantis') {
      throw new HttpError(404, 'CITY_NOT_FOUND', `No weather data found for "${city}".`);
    }
    return { address: city, resolvedAddress: `${city}, Testland`, current: { temp: 20 }, days: [] };
  },
};
const silentLogger = { info() {}, error() {} };

let app;
beforeEach(() => {
  app = createApp({
    db: openDatabase(':memory:'),
    weatherService: fakeWeatherService,
    corsOrigins: ['http://localhost:5173'],
    logger: silentLogger,
  });
});

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/weather/:city', () => {
  it('returns the forecast for a valid city', async () => {
    const res = await request(app).get('/api/weather/Hanoi');
    expect(res.status).toBe(200);
    expect(res.body.resolvedAddress).toBe('Hanoi, Testland');
  });

  it('rejects names with forbidden characters', async () => {
    const res = await request(app).get('/api/weather/' + encodeURIComponent('<script>'));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_CITY');
  });

  it('maps an unknown city to 404', async () => {
    const res = await request(app).get('/api/weather/Atlantis');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CITY_NOT_FOUND');
  });
});

describe('saved cities', () => {
  it('starts empty, adds, lists and deletes a city', async () => {
    expect((await request(app).get('/api/cities')).body).toEqual([]);

    const created = await request(app).post('/api/cities').send({ name: '  Da   Nang ' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ name: 'Da Nang', address: 'Da Nang, Testland' });

    const list = await request(app).get('/api/cities');
    expect(list.body.map((c) => c.name)).toEqual(['Da Nang']);

    const deleted = await request(app).delete(`/api/cities/${created.body.id}`);
    expect(deleted.status).toBe(204);
    expect((await request(app).get('/api/cities')).body).toEqual([]);
  });

  it('rejects duplicates case-insensitively', async () => {
    await request(app).post('/api/cities').send({ name: 'Hue' });
    const res = await request(app).post('/api/cities').send({ name: 'HUE' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CITY_ALREADY_SAVED');
  });

  it('does not save unknown cities', async () => {
    const res = await request(app).post('/api/cities').send({ name: 'Atlantis' });
    expect(res.status).toBe(404);
    expect((await request(app).get('/api/cities')).body).toEqual([]);
  });

  it('validates the request body', async () => {
    expect((await request(app).post('/api/cities').send({})).status).toBe(400);
    expect((await request(app).post('/api/cities').send({ name: "x'; DROP TABLE saved_cities;--" })).status).toBe(400);
    const badJson = await request(app)
      .post('/api/cities')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(badJson.body.error.code).toBe('INVALID_JSON');
  });

  it(`limits the list to ${MAX_SAVED_CITIES} cities`, async () => {
    for (let i = 0; i < MAX_SAVED_CITIES; i++) {
      await request(app).post('/api/cities').send({ name: `City ${'abcdefghijk'[i]}` });
    }
    const res = await request(app).post('/api/cities').send({ name: 'One More' });
    expect(res.status).toBe(422);
  });

  it('returns 404 when deleting a missing city and 400 for a bad id', async () => {
    expect((await request(app).delete('/api/cities/999')).status).toBe(404);
    expect((await request(app).delete('/api/cities/abc')).status).toBe(400);
  });
});

describe('CORS and unknown routes', () => {
  it('allows the configured origin only', async () => {
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const blocked = await request(app).get('/api/health').set('Origin', 'http://evil.example');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers unknown endpoints with JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
