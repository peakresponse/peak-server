const { rateLimit } = require('express-rate-limit');
const rollbar = require('./rollbar');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: (req) => {
    if (req.user) {
      return 5000;
    }
    return 1000;
  },
  handler: (req, res, next, options) => {
    rollbar.error(new Error(options.message), req);
    return res.status(options.statusCode).send(options.message);
  },
  keyGenerator: async (req) => {
    if (req.user) {
      return req.user.id;
    }
    return req.ip;
  },
  skipSuccessfulRequests: true,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = limiter;
