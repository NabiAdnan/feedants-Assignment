const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

/*
 * ---------------------------------------------------------
 * Uploads directory
 * ---------------------------------------------------------
 * __dirname = backend/src
 * '..'      = backend
 *
 * Therefore this points to:
 * backend/uploads
 */
const uploadPath = path.resolve(
  __dirname,
  '..',
  process.env.UPLOAD_DIR || 'uploads'
);

console.log('Working directory:', process.cwd());
console.log('Upload directory:', uploadPath);

/*
 * ---------------------------------------------------------
 * Security
 * ---------------------------------------------------------
 */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

/*
 * ---------------------------------------------------------
 * CORS
 * ---------------------------------------------------------
 */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);

/*
 * ---------------------------------------------------------
 * Body parsing
 * ---------------------------------------------------------
 */
app.use(express.json());

/*
 * ---------------------------------------------------------
 * Logging
 * ---------------------------------------------------------
 */
app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

/*
 * ---------------------------------------------------------
 * Static uploaded files
 * ---------------------------------------------------------
 *
 * Example:
 * /uploads/judges/manju-dubey.png
 *
 * maps to:
 * backend/uploads/judges/manju-dubey.png
 */
app.use('/uploads', express.static(uploadPath));

/*
 * ---------------------------------------------------------
 * Registration rate limiter
 * ---------------------------------------------------------
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many registration attempts, please slow down.',
  },
});

app.use(
  '/api/competitions/:id/register',
  registerLimiter
);

/*
 * ---------------------------------------------------------
 * Health check
 * ---------------------------------------------------------
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

/*
 * ---------------------------------------------------------
 * API routes
 * ---------------------------------------------------------
 */
app.use('/api/auth', authRoutes);

app.use('/api/competitions', competitionRoutes);

/*
 * ---------------------------------------------------------
 * 404 handler
 * ---------------------------------------------------------
 */
app.use(notFound);

/*
 * ---------------------------------------------------------
 * Global error handler
 * ---------------------------------------------------------
 */
app.use(errorHandler);

module.exports = app;