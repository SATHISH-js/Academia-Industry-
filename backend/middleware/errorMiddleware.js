const { sendError } = require('../utils/responseHandler');

/**
 * 404 Route Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[Unhandled Server Error]', err);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return sendError(res, `File upload error: ${err.message}`, 400);
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Invalid JSON payload received', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  sendError(res, message, statusCode, err.errors || null);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
