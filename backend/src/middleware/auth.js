const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the Bearer token and attaches `req.user`.
 * Kept intentionally simple for this assignment; in production you'd add
 * refresh tokens, token revocation, rate limiting per user, etc.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Missing or malformed Authorization header' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Optional auth: attaches req.user if a valid token is present, but does
 * not reject the request otherwise. Used on GET /competitions/:id so
 * logged-out users can still view the screen (just without personal
 * registration/submission state).
 */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');
    if (user) req.user = user;
  } catch (err) {
    // ignore invalid token in optional mode
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
