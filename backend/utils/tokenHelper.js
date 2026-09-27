const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.includes('replace_with') ||
    JWT_SECRET.toLowerCase().includes('change_in_production')) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

/**
 * Generate JWT token containing user id, email, and role
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tokenVersion: Number(user.token_version || 0)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
