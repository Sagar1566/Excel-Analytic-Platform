const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  analysis: {
    keyInsight: String,
    trendAnalysis: String
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  chartType: {
    type: String,
    enum: ['bar', 'line', 'pie', 'scatter', 'radar', 'doughnut'],
    default: 'bar'
  },
  xAxis: {
    type: String,
    default: ''
  },
  yAxes: [{
    type: String
  }],
  selectedColumns: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('File', FileSchema); 