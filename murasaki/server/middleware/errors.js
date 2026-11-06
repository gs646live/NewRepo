/** Error with an HTTP status code, thrown from controllers. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
}

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  let status = error.status ?? error.statusCode ?? 500;
  if (error.name === 'SequelizeValidationError') status = 400;
  if (status >= 500) console.error('[api]', error);
  let message = error.message;
  if (status >= 500) message = 'Something went wrong on the server.';
  else if (error.type === 'entity.parse.failed') message = 'Request body is not valid JSON.';
  res.status(status).json({
    error: message,
    ...(error.details ? { details: error.details } : {}),
  });
}
