require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Create uploads directory with absolute path
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://gajbharsn:Agi8bpl6GaJojY7X@rikaexcel.efngffp.mongodb.net/excelanalytics?retryWrites=true&w=majority&appName=RikaExcel', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

connectDB();

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uploadsDir: fs.existsSync(uploadsDir) ? 'exists' : 'missing'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);

// 404 handler
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Clean up uploaded file if there's an error
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File is too large. Maximum size is 10MB'
        : err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📁 Uploads directory: ${uploadsDir}
🌐 API URL: http://localhost:${PORT}/api
  `);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app; 