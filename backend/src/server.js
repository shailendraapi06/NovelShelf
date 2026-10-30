require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { connectDB, getDbStatus } = require('./config/db');
const seedDatabase = require('./scripts/seed');

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const readingRoutes = require('./routes/readingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads directory (covers and non-quarantined assets)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/contributions', contributionRoutes);
app.use('/api/v1/reading', readingRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NovelShelf MERN Backend API',
    database: getDbStatus()
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Archival server encounter unexpected anomaly.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  NovelShelf Backend Server Active`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  API Base: http://localhost:${PORT}/api/v1`);
    console.log(`  Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`====================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal initialization error:', err);
});

