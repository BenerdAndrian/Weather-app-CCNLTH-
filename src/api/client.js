// Base URL of the backend. Empty string = same origin; in development the
// Vite dev server proxies /api to the Express server (see vite.config.js).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Error thrown for any non-2xx response. `status` and `code` come from the
// backend's { error: { code, message } } body so the UI can react to them.
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Is the backend running?');
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'UNKNOWN_ERROR',
      body?.error?.message ?? `Request failed with status ${response.status}.`,
    );
  }
  return body;
}
