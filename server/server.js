const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes/index');
const errorMiddleware = require('./src/middleware/error.middleware');

const app = express();

// Connect to MongoDB
connectDB();

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// Files are stored at the project root /uploads/, one level above server/
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Avelia API is running' });
});

// Error handler (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Avelia server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
