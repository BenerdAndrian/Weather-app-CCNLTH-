// An error the API is allowed to show to the client.
// `status` is the HTTP status, `code` is a stable machine-readable name.
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
