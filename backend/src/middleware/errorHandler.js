/* Centralised error handling so controllers just `throw` or call next(err). */

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongo duplicate key (e.g. double registration race that slipped past
  // the app-level check but is stopped by the unique index)
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'This action conflicts with an existing record (already registered?).',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', details: err.errors });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid identifier: ${err.value}` });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds maximum limit of 200MB' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    details: err.details,
  });
}

module.exports = { ApiError, notFound, errorHandler };
