import React, { useState, useEffect, useCallback, useRef } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import 'echarts-gl';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: 'fa-chart-bar', supports3D: true },
  { id: 'line', label: 'Line Chart', icon: 'fa-chart-line', supports3D: true },
  { id: 'pie', label: 'Pie Chart', icon: 'fa-chart-pie', supports3D: true },
  { id: 'scatter', label: 'Scatter Plot', icon: 'fa-braille', supports3D: true },
  { id: 'radar', label: 'Radar Chart', icon: 'fa-spider', supports3D: false },
  { id: 'doughnut', label: 'Doughnut Chart', icon: 'fa-circle-notch', supports3D: true }
];

const DIMENSION_OPTIONS = [
  { id: '2d', label: '2D', icon: 'fa-square' },
  { id: '3d', label: '3D', icon: 'fa-cube' }
];

const getEChartsOption = (chartData, chartType, is3D) => {
  if (!chartData) return {};

  const baseOption = {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: chartData.datasets.map(d => d.label),
      top: '5%',
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    animation: true
  };

  if (is3D) {
    switch (chartType) {
      case 'bar':
        return {
          ...baseOption,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis3D: {
            type: 'category',
            data: chartData.labels,
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis3D: {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          zAxis3D: {
            type: 'value',
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          grid3D: {
            boxWidth: 200,
            boxHeight: 100,
            boxDepth: 80,
            viewControl: {
              projection: 'perspective',
              autoRotate: true,
              autoRotateSpeed: 10,
              distance: 300,
              alpha: 20,
              beta: 40
            },
            light: {
              main: {
                intensity: 1.2,
                shadow: true
              },
              ambient: {
                intensity: 0.3
              }
            },
            environment: '#fff'
          },
          series: chartData.datasets.map(dataset => ({
            type: 'bar3D',
            data: dataset.data.map((value, index) => [
              index,
              value,
              Math.random() * 20
            ]),
            name: dataset.label,
            shading: 'realistic',
            itemStyle: {
              opacity: 0.8,
              color: function(params) {
                const colorList = [
                  '#5470c6',
                  '#91cc75',
                  '#fac858',
                  '#ee6666',
                  '#73c0de',
                  '#3ba272'
                ];
                return colorList[params.dataIndex % colorList.length];
              }
            }
          }))
        };

      case 'pie':
      case 'doughnut':
        return {
          ...baseOption,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center'
          },
          series: [{
            type: 'pie',
            radius: chartType === 'doughnut' ? ['40%', '70%'] : '70%',
            center: ['40%', '50%'],
            startAngle: 45,
            data: chartData.datasets[0].data.map((value, index) => ({
              value,
              name: chartData.labels[index],
              itemStyle: {
                color: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.8)`
              }
            })),
            emphasis: {
              focus: 'self',
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}\n{d}%',
              fontSize: 12,
              fontWeight: 'bold',
              position: 'outside'
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 20,
              smooth: true
            }
          }]
        };

      default:
        return {
          ...baseOption,
          xAxis3D: {
            type: 'category',
            data: chartData.labels
          },
          yAxis3D: {
            type: 'value'
          },
          zAxis3D: {
            type: 'value'
          },
          grid3D: {
            viewControl: {
              projection: 'perspective',
              autoRotate: true,
              autoRotateSpeed: 10
            }
          },
          series: chartData.datasets.map(dataset => ({
            type: `${chartType}3D`,
            data: dataset.data.map((value, index) => [index, value, Math.random() * 20]),
            name: dataset.label
          }))
        };
    }
  } else {
    // 2D chart options
    switch (chartType) {
      case 'pie':
      case 'doughnut':
        return {
          ...baseOption,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center'
          },
          series: [{
            type: 'pie',
            radius: chartType === 'doughnut' ? ['45%', '75%'] : '75%',
            center: ['40%', '50%'],
            data: chartData.datasets[0].data.map((value, index) => ({
              value,
              name: chartData.labels[index],
              itemStyle: {
                color: `hsl(${index * 360 / chartData.labels.length}, 70%, 50%)`
              }
            })),
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{d}%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: [4, 8],
              borderRadius: 4
            },
            labelLine: {
              show: true,
              smooth: true
            },
            emphasis: {
              focus: 'self',
              scaleSize: 10
            }
          }]
        };

      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: chartData.labels,
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: chartData.datasets.map(dataset => ({
            type: 'bar',
            data: dataset.data,
            name: dataset.label,
            barMaxWidth: 50,
            itemStyle: {
              borderRadius: [5, 5, 0, 0]
            }
          }))
        };

      default:
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: chartData.labels,
            boundaryGap: false
          },
          yAxis: {
            type: 'value'
          },
          series: chartData.datasets.map(dataset => ({
            type: chartType,
            data: dataset.data,
            name: dataset.label,
            smooth: true
          }))
        };
    }
  }
};

const LandingPage = () => {
  const [files, setFiles] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    chartsCreated: 0,
    storageUsed: '0 MB'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [chartDimension, setChartDimension] = useState('2d');
  const [is3DSupported, setIs3DSupported] = useState(true);
  const [xAxis, setXAxis] = useState('');
  const [yAxes, setYAxes] = useState([]);
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  // Add cleanup and initialization for chart instance
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [chartInstance]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/history');
      setUploadHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch upload history');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        setSelectedFile(file);
        handleFileUpload(file);
      } else {
        toast.error('File size exceeds 10MB limit');
      }
    } else {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    // If it's a file from history
    if (typeof e === 'object' && !e.target) {
      setSelectedFile(e);
      setChartData(e.chartData);
      setAnalysis(e.analysis);
      return;
    }
    
    // If it's a new file upload
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isExcel) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);
    handleFileUpload(file);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      chartType: selectedChartType,
      xAxis,
      yAxes
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chartType', selectedChartType);
    formData.append('xAxis', xAxis);
    formData.append('yAxes', JSON.stringify(yAxes));

    try {
      const response = await axios.post('/upload', formData);
      console.log('Upload response:', response.data);

      const { data, analysis, columns } = response.data;
      setChartData(data);
      setAnalysis(analysis);
      setAvailableColumns(columns || []);
      
      // Set default axes if not selected
      if (!xAxis && columns?.length > 0) {
        setXAxis(columns[0]);
      }
      if (yAxes.length === 0 && columns?.length > 1) {
        setYAxes([columns[1]]);
      }
      
      await fetchStats();
      await fetchHistory();
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error details:', {
        error: error.message,
        response: error.response?.data,
        file: {
          name: file.name,
          type: file.type,
          size: file.size
        }
      });
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadChart = useCallback(() => {
    if (chartRef.current) {
      const url = chartRef.current.getEchartsInstance().getDataURL();
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = url;
      link.click();
      toast.success('Chart downloaded successfully');
    }
  }, []);

  const handleChartTypeChange = (type) => {
    setSelectedChartType(type);
    const chartConfig = CHART_TYPES.find(chart => chart.id === type);
    setIs3DSupported(chartConfig?.supports3D || false);
    if (!chartConfig?.supports3D) {
      setChartDimension('2d');
    }
  };

  const get3DStyles = (chartType) => {
    switch (chartType) {
      case 'bar':
        return {
          transform: 'perspective(1000px) rotateX(20deg) rotateY(10deg)',
          transformStyle: 'preserve-3d',
        };
      case 'pie':
      case 'doughnut':
        return {
          transform: 'perspective(1000px) rotateX(30deg)',
          transformStyle: 'preserve-3d',
        };
      case 'line':
        return {
          transform: 'perspective(1000px) rotateX(20deg) rotateY(10deg)',
          transformStyle: 'preserve-3d',
        };
      case 'scatter':
        return {
          transform: 'perspective(1000px) rotateX(25deg) rotateY(15deg)',
          transformStyle: 'preserve-3d',
        };
      default:
        return {};
    }
  };

  const getChartOptions = (chartType, dimension) => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        }
      }
    };

    if (dimension === '3d') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `Value: ${typeof value === 'object' ? value.y : value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              drawBorder: true,
              color: 'rgba(0,0,0,0.1)',
            },
            ticks: {
              padding: 10
            }
          },
          y: {
            grid: {
              display: true,
              drawBorder: true,
              color: 'rgba(0,0,0,0.1)',
            },
            ticks: {
              padding: 10
            }
          }
        },
        elements: {
          bar: {
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.8)',
            borderSkipped: false,
          },
          line: {
            borderWidth: 3,
            tension: 0.4
          },
          point: {
            radius: 6,
            borderWidth: 2
          }
        }
      };
    }

    return baseOptions;
  };

  const enhance3DDataset = (datasets, chartType) => {
    return datasets.map((dataset, index) => {
      const baseColor = `hsl(${index * 360 / datasets.length}, 70%, 50%)`;
      const gradientColor = `hsla(${index * 360 / datasets.length}, 70%, 50%, 0.8)`;
      
      return {
        ...dataset,
        borderWidth: chartType === 'line' ? 3 : 2,
        borderColor: baseColor,
        backgroundColor: chartType === 'line' ? 'transparent' : gradientColor,
        fill: chartType === 'line' ? false : true,
        tension: chartType === 'line' ? 0.4 : 0,
        ...(chartType === 'bar' && {
          borderRadius: 4,
          maxBarThickness: 30,
        })
      };
    });
  };

  const renderDimensionSelector = () => (
    <div style={styles.dimensionSelector}>
      <h4 style={styles.sectionTitle}>Chart Dimension</h4>
      <div style={styles.dimensionOptions}>
        {DIMENSION_OPTIONS.map(dimension => (
          <button
            key={dimension.id}
            style={{
              ...styles.dimensionButton,
              ...(chartDimension === dimension.id ? styles.selectedDimension : {}),
              ...((!is3DSupported && dimension.id === '3d') ? styles.disabledDimension : {})
            }}
            onClick={() => handleDimensionChange(dimension.id)}
            disabled={!is3DSupported && dimension.id === '3d'}
            title={!is3DSupported && dimension.id === '3d' ? 'This chart type does not support 3D' : ''}
          >
            <i className={`fas ${dimension.icon}`}></i>
            <span>{dimension.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAxisControls = () => (
    <div style={styles.axisControls}>
      <div style={styles.axisSection}>
        <h4 style={styles.axisTitle}>X-Axis</h4>
        <div style={styles.columnGrid}>
          {availableColumns.map(column => (
            <div
              key={column}
              style={{
                ...styles.columnOption,
                ...(xAxis === column ? styles.selectedColumn : {})
              }}
              onClick={() => handleXAxisChange(column)}
            >
              {column}
            </div>
          ))}
        </div>
      </div>
      <div style={styles.axisSection}>
        <h4 style={styles.axisTitle}>Y-Axis</h4>
        <div style={styles.columnGrid}>
          {availableColumns.map(column => (
            <div
              key={column}
              style={{
                ...styles.columnOption,
                ...(yAxes.includes(column) ? styles.selectedColumn : {})
              }}
              onClick={() => handleYAxisChange(column)}
            >
              {column}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChartOptions = () => (
    <div style={styles.chartOptions}>
      <h3 style={styles.optionsTitle}>Chart Options</h3>
      <div style={styles.chartTypeGrid}>
        {CHART_TYPES.map(type => (
          <div
            key={type.id}
            style={{
              ...styles.chartTypeOption,
              ...(selectedChartType === type.id ? styles.selectedOption : {})
            }}
            onClick={() => handleChartTypeChange(type.id)}
          >
            <i className={`fas ${type.icon}`} style={styles.chartTypeIcon}></i>
            <span>{type.label}</span>
            {type.supports3D && (
              <span style={styles.support3dBadge} title="Supports 3D">
                <i className="fas fa-cube"></i>
              </span>
            )}
          </div>
        ))}
      </div>
      {renderDimensionSelector()}
      {availableColumns.length > 0 && renderAxisControls()}
    </div>
  );

  // Update chart dimension handler
  const handleDimensionChange = (dimension) => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    setChartDimension(dimension);
  };

  // Add axis selection handlers
  const handleXAxisChange = (column) => {
    setXAxis(column);
    updateChartData(column, yAxes);
  };

  const handleYAxisChange = (column) => {
    const updatedYAxes = yAxes.includes(column)
      ? yAxes.filter(y => y !== column)
      : [...yAxes, column];
    setYAxes(updatedYAxes);
    updateChartData(xAxis, updatedYAxes);
  };

  const updateChartData = async (newXAxis, newYAxes) => {
    if (!selectedFile || !newXAxis || newYAxes.length === 0) return;

    try {
      setLoading(true);
      const response = await axios.post('/update-chart', {
        fileId: selectedFile.id,
        chartType: selectedChartType,
        xAxis: newXAxis,
        yAxes: newYAxes
      });

      const { data, analysis } = response.data;
      setChartData(data);
      setAnalysis(analysis);
    } catch (error) {
      toast.error('Failed to update chart');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (fileId) => {
    try {
      await axios.delete(`/history/${fileId}`);
      await fetchHistory(); // Refresh history after deletion
      toast.success('File deleted from history');
    } catch (error) {
      toast.error('Failed to delete file from history');
    }
  };

  const handleGenerateFromHistory = async (historyItem) => {
    try {
      setLoading(true);
      const response = await axios.get(`/history/${historyItem.id}/data`);
      const { data, analysis, columns } = response.data;
      setChartData(data);
      setAnalysis(analysis);
      setAvailableColumns(columns || []);
      setSelectedFile(historyItem);
      toast.success('Chart generated from history');
    } catch (error) {
      toast.error('Failed to generate chart from history');
    } finally {
      setLoading(false);
    }
  };

  // Update the history section render
  const renderHistory = () => (
    <section style={styles.historyBox}>
      <h3 style={styles.uploadTitle}>Upload History</h3>
      {uploadHistory.length > 0 ? (
        <div style={styles.historyList}>
          {uploadHistory.map((file, index) => (
            <div key={index} style={styles.historyItem}>
              <i className="fas fa-file-excel" style={styles.historyIcon}></i>
              <div style={styles.historyDetails}>
                <p style={styles.fileName}>{file.name}</p>
                <p style={styles.fileInfo}>
                  {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div style={styles.historyActions}>
                <button 
                  style={styles.generateButton}
                  onClick={() => handleGenerateFromHistory(file)}
                  title="Generate Chart"
                  disabled={loading}
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-chart-line'}`}></i>
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDeleteHistory(file.id)}
                  title="Delete from History"
                  disabled={loading}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyHistory}>
          <i className="fas fa-history" style={styles.emptyIcon}></i>
          <p>No files uploaded yet</p>
          <p style={styles.uploadNote}>Your uploaded files will appear here</p>
        </div>
      )}
    </section>
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Header */}
        <header>
          <h1 style={styles.heading}>Analytics Dashboard</h1>
          <p style={styles.subheading}>Upload and visualize your Excel data with interactive charts</p>
        </header>

        {/* Summary Cards */}
        <section style={styles.summaryGrid}>
          {[
            { color: '#3b82f6', icon: 'fa-file-excel', label: 'Total Files', value: stats.totalFiles },
            { color: '#22c55e', icon: 'fa-chart-line', label: 'Charts Created', value: stats.chartsCreated },
            { color: '#facc15', icon: 'fa-bolt', label: 'Processing Speed', value: 'Fast' },
            { color: '#a855f7', icon: 'fa-database', label: 'Storage Used', value: stats.storageUsed }
          ].map(({ color, icon, label, value }, idx) => (
            <div key={idx} style={styles.card}>
              <div style={{ ...styles.iconCircle, backgroundColor: color }}>
                <i className={`fas ${icon}`}></i>
              </div>
              <div>
                <p style={styles.cardLabel}>{label}</p>
                <p style={styles.cardValue}>{value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Upload & Chart Area */}
        <section style={styles.uploadGrid}>
          <div style={styles.uploadBox}>
            <h2 style={styles.uploadTitle}>Upload Excel File</h2>
            <div 
              style={styles.uploadArea}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {loading ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Processing...</p>
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt" style={styles.uploadIcon}></i>
                  <p>Drag and drop your Excel file here, or</p>
                  <input
                    type="file"
                    id="fileInput"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button 
                    style={styles.browseButton}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    browse files
                  </button>
                  <p style={styles.uploadNote}>Supports .xlsx, .xls files up to 10MB</p>
                </>
              )}
            </div>
            {renderChartOptions()}
          </div>
          <div style={styles.chartArea}>
            {chartData ? (
              <div style={styles.chartContainer}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>
                    Data Visualization 
                    <span style={styles.dimensionBadge}>
                      <i className={`fas ${chartDimension === '3d' ? 'fa-cube' : 'fa-square'}`}></i>
                      {chartDimension.toUpperCase()}
                    </span>
                  </h3>
                  <button
                    style={styles.downloadButton}
                    onClick={handleDownloadChart}
                    title="Download Chart"
                  >
                    <i className="fas fa-download"></i>
                    Download Chart
                  </button>
                </div>
                <div style={styles.chartWrapper}>
                  <ReactECharts
                    ref={chartRef}
                    option={getEChartsOption(chartData, selectedChartType, chartDimension === '3d')}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    onChartReady={(instance) => {
                      setChartInstance(instance);
                    }}
                    notMerge={true}
                    lazyUpdate={false}
                  />
                </div>
              </div>
            ) : (
              <div style={styles.chartPrompt}>
                <i className="fas fa-chart-line" style={styles.chartIcon}></i>
                <p>Upload an Excel file to generate charts</p>
              </div>
            )}
          </div>
        </section>

        {renderHistory()}

        {/* Insights and Trends */}
        <section style={styles.trendGrid}>
          <div style={styles.insightBox}>
            <i className="fas fa-lightbulb" style={{ marginTop: 4 }}></i>
            <div>
              <p style={styles.insightTitle}>Key Insight</p>
              <p style={styles.insightText}>
                {analysis?.keyInsight || 'Upload your Excel files and generate charts to receive AI-powered insights about your data patterns and trends.'}
              </p>
            </div>
          </div>
          <div style={styles.trendBox}>
            <i className="fas fa-chart-line" style={{ marginTop: 4 }}></i>
            <div>
              <p style={styles.insightTitle}>Trend Analysis</p>
              <p style={styles.insightText}>
                {analysis?.trendAnalysis || 'Our analytics engine will automatically detect patterns and provide recommendations for data visualization.'}
              </p>
            </div>
            <span style={styles.betaBadge}>Beta</span>
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f7f7f7',
    fontFamily: 'sans-serif',
    fontSize: '13px',
    color: '#4a4a4a',
    padding: '1rem',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: '1.5rem',
  },
  heading: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#222',
  },
  subheading: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  iconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: '11px',
    color: '#6b7280',
    margin: 0,
  },
  cardValue: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#222',
    margin: 0,
  },
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  uploadBox: {
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  uploadTitle: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#222',
    marginBottom: '8px',
  },
  uploadArea: {
    border: '1px dashed #9ca3af',
    borderRadius: '6px',
    padding: '24px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#6b7280',
  },
  uploadIcon: {
    fontSize: '24px',
    marginBottom: '8px',
    color: '#6b7280',
  },
  browseButton: {
    background: 'none',
    border: 'none',
    textDecoration: 'underline',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '11px',
    marginTop: '4px',
  },
  uploadNote: {
    fontSize: '9px',
    marginTop: '4px',
    color: '#9ca3af',
  },
  chartPrompt: {
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '11px',
    color: '#6b7280',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  chartIcon: {
    fontSize: '30px',
    marginBottom: '12px',
  },
  historyBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  insightBox: {
    backgroundColor: '#e0e7ff',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '11px',
    color: '#4f46e5',
  },
  trendBox: {
    backgroundColor: '#dcfce7',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '11px',
    color: '#15803d',
    position: 'relative',
  },
  insightTitle: {
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '4px',
  },
  insightText: {
    color: '#4b5563',
    fontSize: '11px',
  },
  betaBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '600',
    padding: '1px 8px',
    borderRadius: '9999px',
    userSelect: 'none',
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
  },
  chartArea: {
    backgroundColor: '#fff',
    borderRadius: '6px',
    padding: '1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    minHeight: '400px',
    height: '100%',
  },
  chartContainer: {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '4px',
    marginTop: '12px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  historyIcon: {
    color: '#3b82f6',
    fontSize: '16px',
  },
  historyDetails: {
    flex: 1,
    minWidth: 0, // Prevent text overflow
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileInfo: {
    fontSize: '11px',
    color: '#6b7280',
    margin: '2px 0 0 0',
  },
  historyActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#2563eb',
    },
    '&:disabled': {
      backgroundColor: '#93c5fd',
      cursor: 'not-allowed',
      opacity: 0.7
    }
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#dc2626',
    },
    '&:disabled': {
      backgroundColor: '#fca5a5',
      cursor: 'not-allowed',
      opacity: 0.7
    }
  },
  emptyHistory: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  chartOptions: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
  },
  optionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  chartTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  chartTypeOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
    position: 'relative',
  },
  selectedOption: {
    backgroundColor: '#e0e7ff',
    borderColor: '#818cf8',
    color: '#4f46e5',
  },
  chartTypeIcon: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  axisControls: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  axisSection: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  axisTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '0.75rem',
  },
  columnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '0.5rem',
  },
  columnOption: {
    padding: '0.5rem',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
  selectedColumn: {
    backgroundColor: '#e0e7ff',
    borderColor: '#818cf8',
    color: '#4f46e5',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0 0.5rem',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#2563eb',
    },
  },
  dimensionSelector: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '0.75rem',
  },
  dimensionOptions: {
    display: 'flex',
    gap: '0.5rem',
  },
  dimensionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#475569',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  },
  selectedDimension: {
    backgroundColor: '#e0e7ff',
    borderColor: '#818cf8',
    color: '#4f46e5',
  },
  disabledDimension: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: '#fff',
    },
  },
  support3dBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    fontSize: '10px',
    color: '#6366f1',
  },
  dimensionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginLeft: '0.5rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#64748b',
  },
  chartWrapper: {
    flex: 1,
    minHeight: '350px',
    position: 'relative',
    margin: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  '@media (max-width: 768px)': {
    uploadGrid: {
      gridTemplateColumns: '1fr',
    },
    summaryGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    },
    chartArea: {
      minHeight: '300px',
    },
    chartContainer: {
      minHeight: '350px',
    },
    chartWrapper: {
      minHeight: '300px',
    },
  },
  '@media (max-width: 480px)': {
    container: {
      padding: '0.5rem',
    },
    summaryGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    chartTypeGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    chartWrapper: {
      minHeight: '250px'
    },
    chartContainer: {
      minHeight: '300px'
    }
  }
};

export default LandingPage;

