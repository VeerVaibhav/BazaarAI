require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const scanRouter = require('./routes/scan');
const enrichRouter = require('./routes/enrich');
const shopRouter = require('./routes/shop');
const productRouter = require('./routes/product');

const app = express();

// --- Global Middleware ---
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// --- Rate Limiter for /api/scan ---
const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many scan requests. Slow down.', success: false },
});

// --- Routes ---
app.use('/api/scan', scanLimiter, scanRouter);
app.use('/api/enrich', enrichRouter);
app.use('/api/shop', shopRouter);
app.use('/api/product', productRouter);

// --- Health Check ---
app.get('/', (_req, res) => {
  res.json({ status: 'ok', app: 'BaazarAI API' });
});

// --- Global Error Handler ---
app.use((err, _req, res, _next) => {
  console.error('[global]', err.message);
  res.status(500).json({ error: err.message, success: false });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 BaazarAI API running on port ${PORT}`);
});
