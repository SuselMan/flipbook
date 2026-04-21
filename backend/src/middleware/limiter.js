const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const limiter = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 30,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
