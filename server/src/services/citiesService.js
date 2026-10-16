import { HttpError } from '../errors.js';

export const MAX_SAVED_CITIES = 10;

// Business rules for the saved-cities list. Route handlers stay thin and
// call these functions. All SQL uses bound parameters (no string building),
// which prevents SQL injection.
export function createCitiesService({ db, weatherService }) {
  const listStmt = db.prepare(
    'SELECT id, name, address, created_at AS createdAt FROM saved_cities ORDER BY id DESC',
  );
  const countStmt = db.prepare('SELECT COUNT(*) AS count FROM saved_cities');
  const findByNameStmt = db.prepare('SELECT id FROM saved_cities WHERE name = ?');
  const insertStmt = db.prepare(
    'INSERT INTO saved_cities (name, address) VALUES (?, ?) RETURNING id, name, address, created_at AS createdAt',
  );
  const deleteStmt = db.prepare('DELETE FROM saved_cities WHERE id = ?');

  function list() {
    return listStmt.all().map((row) => ({ ...row }));
  }

  async function add(name) {
    if (findByNameStmt.get(name)) {
      throw new HttpError(409, 'CITY_ALREADY_SAVED', `"${name}" is already in your list.`);
    }
    if (countStmt.get().count >= MAX_SAVED_CITIES) {
      throw new HttpError(422, 'CITY_LIMIT_REACHED', `You can save at most ${MAX_SAVED_CITIES} cities.`);
    }
    // Only save places the weather provider knows (throws 404 otherwise).
    const forecast = await weatherService.getForecast(name);
    return { ...insertStmt.get(name, forecast.resolvedAddress ?? name) };
  }

  function remove(id) {
    const result = deleteStmt.run(id);
    if (result.changes === 0) {
      throw new HttpError(404, 'CITY_NOT_FOUND', `Saved city ${id} does not exist.`);
    }
  }

  return { list, add, remove };
}
