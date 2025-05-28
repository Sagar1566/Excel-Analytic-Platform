require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/excel-analytics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  }
});

// MongoDB Schema
const FileSchema = new mongoose.Schema({
  name: String,
  path: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
  analysis: {
    keyInsight: String,
    trendAnalysis: String,
  },
  chartData: Object
});

const File = mongoose.model('File', FileSchema);

// Helper function to analyze Excel data
function analyzeExcelData(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  // Basic analysis
  const numericColumns = Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'number'
  );
  
  const trends = numericColumns.map(col => {
    const values = data.map(row => row[col]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
    return { column: col, trend, average: avg };
  });

  // Prepare chart data
  const chartData = {
    labels: data.map((_, index) => `Data Point ${index + 1}`),
    datasets: numericColumns.map((col, index) => ({
      label: col,
      data: data.map(row => row[col]),
      borderColor: `hsl(${index * 360 / numericColumns.length}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 360 / numericColumns.length}, 70%, 50%, 0.5)`,
    }))
  };

  return {
    keyInsight: `Analysis of ${data.length} rows shows ${trends.length} numeric columns.`,
    trendAnalysis: trends.map(t => 
      `${t.column} shows a ${t.trend} trend with average of ${t.average.toFixed(2)}`
    ).join('. '),
    chartData
  };
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// API Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const analysis = analyzeExcelData(workbook);

    const file = new File({
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      analysis: {
        keyInsight: analysis.keyInsight,
        trendAnalysis: analysis.trendAnalysis
      },
      chartData: analysis.chartData
    });

    await file.save();

    res.json({
      data: analysis.chartData,
      analysis: file.analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files.map(file => ({
      id: file._id,
      name: file.name,
      size: formatFileSize(file.size),
      uploadedAt: file.uploadedAt,
      analysis: file.analysis
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const files = await File.find();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    res.json({
      totalFiles,
      chartsCreated: totalFiles,
      storageUsed: formatFileSize(totalSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 