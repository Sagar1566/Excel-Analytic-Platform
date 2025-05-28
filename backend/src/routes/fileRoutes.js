const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { uploadFile, getHistory, getStats, updateChart } = require('../controllers/fileController');
const File = require('../models/File');

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type - be more permissive with MIME types
  const allowedMimeTypes = [
    'application/vnd.ms-excel',                                           // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/octet-stream',                                          // Some systems send this
    'application/zip',                                                   // Some systems send this for .xlsx
    ''  // Some systems might not send a mime type
  ];
  
  console.log('File upload request:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Check file extension
  const filetypes = /xlsx|xls/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Be more permissive - if the file extension is correct, accept it
  if (extname) {
    console.log('File accepted:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    return cb(null, true);
  }
  
  console.log('File rejected:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    reason: 'Invalid file extension'
  });
  
  cb(new Error('Only Excel files (.xlsx or .xls) are allowed'));
};

// Configure multer with updated options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file per request
  }
}).single('file');

// Wrap upload middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  console.log('Upload middleware started');
  
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', {
        code: err.code,
        message: err.message,
        field: err.field
      });
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File Upload Error',
          message: 'File size cannot exceed 10MB'
        });
      }
      return res.status(400).json({
        error: 'File Upload Error',
        message: err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: 'File Upload Error',
        message: err.message
      });
    }

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        error: 'File Upload Error',
        message: 'No file was uploaded'
      });
    }

    console.log('File upload successful:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    next();
  });
};

// Routes
router.post('/upload', uploadMiddleware, uploadFile);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.post('/update-chart', updateChart);

// Get file data from history
router.get('/history/:fileId/data', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if the file exists
    if (!file.path || !fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Read and analyze the Excel file
    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (!data || data.length === 0) {
      throw new Error('Excel file is empty or invalid');
    }

    // Get all columns
    const allColumns = Object.keys(data[0]);
    
    res.json({
      data: file.chartData,
      analysis: file.analysis,
      columns: allColumns,
      xAxis: file.xAxis,
      yAxes: file.yAxes,
      chartType: file.chartType
    });
  } catch (error) {
    console.error('Error getting file data:', error);
    res.status(500).json({ error: 'Failed to get file data' });
  }
});

// Delete file from history
router.delete('/history/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the physical file if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete the database record
    await File.findByIdAndDelete(req.params.fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router; 