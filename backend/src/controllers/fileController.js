const File = require('../models/File');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Helper function to analyze Excel data
const analyzeExcelData = (workbook, chartType = 'bar', selectedColumns = []) => {
  try {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (!data || data.length === 0) {
      throw new Error('Excel file is empty or invalid');
    }

    // Get all columns
    const allColumns = Object.keys(data[0]);
    
    // Filter numeric columns
    const numericColumns = allColumns.filter(key => 
      !isNaN(data[0][key]) && typeof data[0][key] !== 'boolean'
    );
    
    if (numericColumns.length === 0) {
      throw new Error('No numeric columns found in the Excel file');
    }

    // Use selected columns if provided, otherwise use all numeric columns
    const columnsToUse = selectedColumns.length > 0 
      ? selectedColumns.filter(col => numericColumns.includes(col))
      : numericColumns;

    if (columnsToUse.length === 0) {
      throw new Error('No valid numeric columns selected');
    }

    const trends = columnsToUse.map(col => {
      const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
      return { column: col, trend, average: avg };
    });

    // Prepare chart data based on chart type
    let chartData;
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        // For pie/doughnut charts, use the last row of data
        chartData = {
          labels: columnsToUse,
          datasets: [{
            data: columnsToUse.map(col => data[data.length - 1][col]),
            backgroundColor: columnsToUse.map((_, index) => 
              `hsla(${index * 360 / columnsToUse.length}, 70%, 50%, 0.8)`
            ),
          }]
        };
        break;

      case 'radar':
        chartData = {
          labels: columnsToUse,
          datasets: [{
            label: 'Current Values',
            data: columnsToUse.map(col => data[data.length - 1][col]),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }]
        };
        break;

      case 'scatter':
        // Use first numeric column for X and others for Y
        chartData = {
          datasets: columnsToUse.slice(1).map((col, index) => ({
            label: col,
            data: data.map(row => ({
              x: parseFloat(row[columnsToUse[0]]),
              y: parseFloat(row[col])
            })),
            backgroundColor: `hsla(${index * 360 / (columnsToUse.length - 1)}, 70%, 50%, 0.8)`,
          }))
        };
        break;

      default: // bar, line
        chartData = {
          labels: data.map((_, index) => `Data Point ${index + 1}`),
          datasets: columnsToUse.map((col, index) => ({
            label: col,
            data: data.map(row => parseFloat(row[col])),
            borderColor: `hsl(${index * 360 / columnsToUse.length}, 70%, 50%)`,
            backgroundColor: `hsla(${index * 360 / columnsToUse.length}, 70%, 50%, 0.5)`,
            fill: chartType === 'line' ? false : true,
          }))
        };
    }

    return {
      keyInsight: `Analysis of ${data.length} rows shows trends in ${columnsToUse.length} numeric columns.`,
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
      columns: req.body.columns
    });

    // Read and analyze the Excel file
    let workbook;
    try {
      workbook = xlsx.readFile(req.file.path);
    } catch (error) {
      throw new Error(`Invalid Excel file format: ${error.message}`);
    }

    const chartType = req.body.chartType || 'bar';
    const selectedColumns = req.body.columns ? JSON.parse(req.body.columns) : [];
    const analysis = analyzeExcelData(workbook, chartType, selectedColumns);

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
      selectedColumns: selectedColumns,
      userId: req.user?._id
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
        selectedColumns: file.selectedColumns
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

exports.getHistory = async (req, res) => {
  try {
    const query = req.user?._id ? { userId: req.user._id } : {};
    const files = await File.find(query).sort({ uploadedAt: -1 });
    
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
};

exports.getStats = async (req, res) => {
  try {
    const query = req.user?._id ? { userId: req.user._id } : {};
    const totalFiles = await File.countDocuments(query);
    const files = await File.find(query);
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