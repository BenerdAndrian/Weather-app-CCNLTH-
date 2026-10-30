import { HttpError } from './errors.js';

// Letters (any language), spaces, commas, dots, apostrophes and hyphens.
// This blocks anything that is not a place name before it reaches the
// upstream URL or the database.
const CITY_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} ,.'-]*$/u;

export function parseCityName(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'INVALID_CITY', 'City name is required.');
  }
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 80 || !CITY_PATTERN.test(name)) {
    throw new HttpError(
      400,
      'INVALID_CITY',
      "City name must be 1-80 characters and contain only letters, spaces and , . ' -",
    );
  }
  return name;
}

export function parseSuggestionQuery(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'INVALID_QUERY', 'Search query is required.');
  }
  const query = value.trim().replace(/\s+/g, ' ');
  if (query.length > 80) {
    throw new HttpError(400, 'INVALID_QUERY', 'Search query must be 80 characters or fewer.');
  }
  return query;
}

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'INVALID_ID', 'Id must be a positive integer.');
  }
  return id;
}
