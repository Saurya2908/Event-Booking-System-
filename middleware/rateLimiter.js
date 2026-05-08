/**
 * Rate Limiting Middleware.
 * Protects against brute-force and abuse.
 */
const rateLimit = require("express-rate-limit");

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
});

/**
 * Strict rate limiter for auth endpoints: 10 requests per 15 minutes per IP.
 * Prevents brute-force login/register attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

module.exports = { globalLimiter, authLimiter };
