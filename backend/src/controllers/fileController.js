const File = require('../models/File');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to analyze Excel data
const analyzeExcelData = (workbook, chartType = 'bar', xAxis = '', yAxes = []) => {
  try {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (!data || data.length === 0) {
      throw new Error('Excel file is empty or invalid');
    }

    // Get all columns
    const allColumns = Object.keys(data[0]);
    
    // Use provided axes or select defaults
    const selectedXAxis = xAxis || allColumns[0];
    const selectedYAxes = yAxes.length > 0 ? yAxes : [allColumns[1]];

    // Validate axes
    if (!allColumns.includes(selectedXAxis)) {
      throw new Error('Selected X-axis column not found in data');
    }

    selectedYAxes.forEach(yAxis => {
      if (!allColumns.includes(yAxis)) {
        throw new Error(`Selected Y-axis column "${yAxis}" not found in data`);
      }
    });

    // Calculate trends for Y-axes
    const trends = selectedYAxes.map(col => {
      const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
      return { column: col, trend, average: avg };
    });

    // Prepare chart data based on selected axes
    const chartData = {
      labels: data.map(row => row[selectedXAxis].toString()),
      datasets: selectedYAxes.map((col, index) => ({
        label: col,
        data: data.map(row => parseFloat(row[col])),
        borderColor: `hsl(${index * 360 / selectedYAxes.length}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 360 / selectedYAxes.length}, 70%, 50%, 0.5)`
      }))
    };

    return {
      keyInsight: `Analysis of ${data.length} rows shows trends in ${selectedYAxes.length} numeric columns.`,
      trendAnalysis: trends.map(t => 
        `${t.column} shows a ${t.trend} trend with average of ${t.average.toFixed(2)}`
      ).join('. '),
      chartData,
      columns: allColumns
    };
  } catch (error) {
    throw new Error(`Failed to analyze Excel file: ${error.message}`);
  }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

exports.uploadFile = async (req, res) => {
  let workbook = null;
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'File Upload Error',
        message: 'No file uploaded' 
      });
    }

    console.log('Processing file:', {
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      chartType: req.body.chartType,
      xAxis: req.body.xAxis,
      yAxes: req.body.yAxes
    });

    // Read and analyze the Excel file
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (error) {
      throw new Error(`Invalid Excel file format: ${error.message}`);
    }

    const chartType = req.body.chartType || 'bar';
    const xAxis = req.body.xAxis || '';
    const yAxes = req.body.yAxes ? JSON.parse(req.body.yAxes) : [];
    const analysis = analyzeExcelData(workbook, chartType, xAxis, yAxes);

    // Save file information to database
    const file = new File({
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      analysis: {
        keyInsight: analysis.keyInsight,
        trendAnalysis: analysis.trendAnalysis
      },
      chartData: analysis.chartData,
      chartType: chartType,
      xAxis: xAxis,
      yAxes: yAxes
    });

    await file.save();

    res.json({
      success: true,
      data: analysis.chartData,
      analysis: file.analysis,
      columns: analysis.columns,
      file: {
        id: file._id,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: file.uploadedAt,
        chartType: file.chartType,
        xAxis: file.xAxis,
        yAxes: file.yAxes
      }
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      });
    }

    console.error('File upload error:', {
      error: error.message,
      file: req.file ? {
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file'
    });

    res.status(500).json({ 
      error: 'File Upload Error',
      message: error.message || 'Failed to process Excel file'
    });
  }
};

exports.updateChart = async (req, res) => {
  try {
    const { fileId, chartType, xAxis, yAxes } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if the file exists
    if (!file.path || !fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Read and analyze the Excel file with new axes
    const workbook = xlsx.readFile(file.path);
    const analysis = analyzeExcelData(workbook, chartType, xAxis, yAxes);

    // Update file in database
    file.chartData = analysis.chartData;
    file.analysis = {
      keyInsight: analysis.keyInsight,
      trendAnalysis: analysis.trendAnalysis
    };
    file.chartType = chartType;
    file.xAxis = xAxis;
    file.yAxes = yAxes;

    await file.save();

    res.json({
      data: analysis.chartData,
      analysis: file.analysis
    });
  } catch (error) {
    console.error('Error updating chart:', error);
    res.status(500).json({ error: 'Failed to update chart' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    
    res.json(files.map(file => ({
      id: file._id,
      name: file.name,
      size: formatFileSize(file.size),
      uploadedAt: file.uploadedAt,
      analysis: file.analysis,
      chartType: file.chartType,
      xAxis: file.xAxis,
      yAxes: file.yAxes
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const files = await File.find();
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

    res.json({
      totalFiles,
      chartsCreated: totalFiles,
      storageUsed: formatFileSize(totalSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 