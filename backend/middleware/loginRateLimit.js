const { sendError } = require('../utils/responseHandler');

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map();

function loginRateLimit(req, res, next) {
  // Keep local signup/login testing convenient; production always retains the limiter.
  if (process.env.NODE_ENV === 'development') return next();

  const email = String(req.body.email || '').toLowerCase();
  const key = `${req.ip || 'unknown'}:${email}`;
  const now = Date.now();
  const recent = (failures.get(key) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_FAILURES) {
    failures.set(key, recent);
    return sendError(res, 'Too many failed sign-in attempts. Try again in 15 minutes.', 429);
  }

  res.once('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      const updated = [...recent, Date.now()];
      failures.set(key, updated);
    }
    // Expire old keys to keep this process-local limiter bounded over time.
    if (failures.size > 5000) {
      for (const [storedKey, times] of failures) {
        const stillRecent = times.filter(time => Date.now() - time < WINDOW_MS);
        if (stillRecent.length) failures.set(storedKey, stillRecent);
        else failures.delete(storedKey);
      }
      while (failures.size > 5000) failures.delete(failures.keys().next().value);
    }
  });
  next();
}

module.exports = { loginRateLimit };
