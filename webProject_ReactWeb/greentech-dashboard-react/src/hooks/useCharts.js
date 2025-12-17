import { useEffect, useRef } from 'react';
import { getLineChartData, getComparisonData, getEmissionsData } from '../utils/dataGenerator';

export const useCharts = (selectedMetric, selectedPeriod, selectedComparison, emissionsPeriod, refreshTrigger = 0, metrics = null, historyData = null, monthlyMetrics = null, comparisonData = null) => {
  const chartsRef = useRef({});
  const isInitialized = useRef(false);

  // Initial chart creation (only once)
  useEffect(() => {
    if (isInitialized.current) return;

    const initCharts = () => {
      if (!window.Chart) {
        console.error('Chart.js not loaded');
        return;
      }

      const emissionsCanvas = document.getElementById('emissionsChart');
      const electricityCanvas = document.getElementById('electricityChart');
      const carbonGaugeCanvas = document.getElementById('carbonGauge');
      const comparisonCanvas = document.getElementById('comparisonChart');

      if (!emissionsCanvas || !electricityCanvas || !carbonGaugeCanvas || !comparisonCanvas) {
        console.log('Canvas elements not ready yet');
        return;
      }

      const emissionsCtx = emissionsCanvas.getContext('2d');
      const electricityCtx = electricityCanvas.getContext('2d');
      const gaugeCtx = carbonGaugeCanvas.getContext('2d');
      const comparisonCtx = comparisonCanvas.getContext('2d');

      // Get initial data
      const emissionsData = getEmissionsData(emissionsPeriod, metrics, monthlyMetrics);

      // Use historyData if available (for initial load though unlikely), else getLineChartData
      let lineData = getLineChartData(selectedMetric, selectedPeriod);
      if (historyData && historyData.metric === selectedMetric) {
        lineData = {
          labels: historyData.labels,
          data: historyData.data,
          label: lineData.label, // keep original label
          color: lineData.color // keep original color
        };
      }

      // Get initial comparison data - prefer real data from props, fallback to static
      let initialComparisonData;
      if (comparisonData && comparisonData[selectedComparison] &&
        comparisonData[selectedComparison].currentMonth.some(v => v > 0)) {
        initialComparisonData = comparisonData[selectedComparison];
      } else {
        initialComparisonData = getComparisonData(selectedComparison);
      }

      // Emissions Doughnut Chart
      chartsRef.current.emissions = new window.Chart(emissionsCtx, {
        type: 'doughnut',
        data: {
          labels: emissionsData.labels,
          datasets: [{
            data: emissionsData.data,
            backgroundColor: emissionsData.isEmpty ? ['rgba(255, 255, 255, 0.1)'] : ['#f093fb', '#f59e0b', '#3b82f6', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: !emissionsData.isEmpty,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} kg CO2 (${percentage}%)`;
                }
              }
            }
          }
        },
        plugins: [{
          id: 'doughnutPercentages',
          afterDatasetDraw(chart) {
            const { ctx, data } = chart;
            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

            // Check if this is empty state
            if (data.labels[0] === 'Aucune donnée') {
              // Draw "No Data" text in center
              const centerX = chart.getDatasetMeta(0).data[0]?.x || chart.width / 2;
              const centerY = chart.getDatasetMeta(0).data[0]?.y || chart.height / 2;

              ctx.save();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('Aucune donnée', centerX, centerY);
              ctx.restore();
              return;
            }

            chart.getDatasetMeta(0).data.forEach((arc, index) => {
              const value = data.datasets[0].data[index];
              const percentage = ((value / total) * 100).toFixed(1);

              // Calculate position at the middle of the arc
              const angle = (arc.startAngle + arc.endAngle) / 2;
              const radius = (arc.innerRadius + arc.outerRadius) / 2;
              const x = arc.x + Math.cos(angle) * radius;
              const y = arc.y + Math.sin(angle) * radius;

              // Draw percentage text
              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${percentage}%`, x, y);
              ctx.restore();
            });
          }
        }]
      });

      // Electricity/Metric Line Chart
      chartsRef.current.electricity = new window.Chart(electricityCtx, {
        type: 'line',
        data: {
          labels: lineData.labels,
          datasets: [{
            label: lineData.label,
            data: lineData.data,
            borderColor: lineData.color,
            backgroundColor: `${lineData.color}1a`,
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#e0e0e0'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#e0e0e0'
              }
            }
          }
        }
      });

      // Carbon Gauge
      chartsRef.current.gauge = new window.Chart(gaugeCtx, {
        type: 'doughnut',
        data: {
          labels: ['Utilisé', 'Restant'],
          datasets: [{
            data: [83, 17],
            backgroundColor: ['#667eea', 'rgba(255, 255, 255, 0.1)'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          animation: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          }
        }
      });

      // Comparison Bar Chart
      chartsRef.current.comparison = new window.Chart(comparisonCtx, {
        type: 'bar',
        data: {
          labels: initialComparisonData.labels,
          datasets: [
            {
              label: 'Mois précédent',
              data: initialComparisonData.previousMonth,
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            },
            {
              label: 'Mois actuel',
              data: initialComparisonData.currentMonth,
              backgroundColor: '#667eea'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#e0e0e0'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#e0e0e0'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#e0e0e0'
              }
            }
          }
        }
      });

      isInitialized.current = true;
      console.log('Charts initialized successfully');
    };

    const timer = setTimeout(initCharts, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Only run once on mount

  // Update line chart when metric or period changes OR historyData changes
  useEffect(() => {
    if (!isInitialized.current || !chartsRef.current.electricity) return;

    let lineData = getLineChartData(selectedMetric, selectedPeriod);

    // Override with history data if available
    if (historyData && historyData.metric === selectedMetric && selectedPeriod !== '24h') {
      const baseColor = lineData.color;
      lineData = {
        labels: historyData.labels,
        data: historyData.data,
        label: lineData.label,
        color: baseColor
      };
    }

    const chart = chartsRef.current.electricity;

    // Update only the data, labels, and colors
    chart.data.labels = lineData.labels;
    chart.data.datasets[0].label = lineData.label;
    chart.data.datasets[0].data = lineData.data;
    chart.data.datasets[0].borderColor = lineData.color;
    chart.data.datasets[0].backgroundColor = `${lineData.color}1a`;

    chart.update();
  }, [selectedMetric, selectedPeriod, historyData]);

  // Update comparison chart when comparison metric changes or comparisonData updates
  useEffect(() => {
    if (!isInitialized.current || !chartsRef.current.comparison) return;

    // Use real comparison data if available, otherwise fallback to static data
    let chartData;
    if (comparisonData && comparisonData[selectedComparison] &&
      comparisonData[selectedComparison].currentMonth.some(v => v > 0)) {
      chartData = comparisonData[selectedComparison];
    } else {
      // Fallback to static data from dataGenerator
      chartData = getComparisonData(selectedComparison);
    }

    const chart = chartsRef.current.comparison;

    // Update the data and labels
    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.previousMonth;
    chart.data.datasets[1].data = chartData.currentMonth;

    chart.update();
  }, [selectedComparison, comparisonData]);

  // Update emissions chart when period or metrics change
  useEffect(() => {
    if (!isInitialized.current || !chartsRef.current.emissions) return;

    const emissionsData = getEmissionsData(emissionsPeriod, metrics, monthlyMetrics);
    const chart = chartsRef.current.emissions;

    // Update data, labels, and colors based on empty state
    chart.data.datasets[0].data = emissionsData.data;
    chart.data.labels = emissionsData.labels;
    chart.data.datasets[0].backgroundColor = emissionsData.isEmpty
      ? ['rgba(255, 255, 255, 0.1)']
      : ['#f093fb', '#f59e0b', '#3b82f6', '#10b981'];
    chart.options.plugins.tooltip.enabled = !emissionsData.isEmpty;

    chart.update();
  }, [emissionsPeriod, metrics, monthlyMetrics]);

  // Update all charts when refreshTrigger changes (real-time data from WebSocket)
  useEffect(() => {
    if (!isInitialized.current || refreshTrigger === 0) return;


    // Update line chart
    if (chartsRef.current.electricity) {
      const lineData = getLineChartData(selectedMetric, selectedPeriod);
      chartsRef.current.electricity.data.labels = lineData.labels;
      chartsRef.current.electricity.data.datasets[0].data = lineData.data;
      chartsRef.current.electricity.update('active');
    }

    // Update emissions chart
    if (chartsRef.current.emissions) {
      const emissionsData = getEmissionsData(emissionsPeriod, metrics, monthlyMetrics);
      chartsRef.current.emissions.data.datasets[0].data = emissionsData.data;
      chartsRef.current.emissions.data.labels = emissionsData.labels;
      chartsRef.current.emissions.data.datasets[0].backgroundColor = emissionsData.isEmpty
        ? ['rgba(255, 255, 255, 0.1)']
        : ['#f093fb', '#f59e0b', '#3b82f6', '#10b981'];
      chartsRef.current.emissions.options.plugins.tooltip.enabled = !emissionsData.isEmpty;
      chartsRef.current.emissions.update('active');
    }

    // Update comparison chart
    if (chartsRef.current.comparison) {
      // Use real comparison data if available
      let chartData;
      if (comparisonData && comparisonData[selectedComparison] &&
        comparisonData[selectedComparison].currentMonth.some(v => v > 0)) {
        chartData = comparisonData[selectedComparison];
      } else {
        chartData = getComparisonData(selectedComparison);
      }

      chartsRef.current.comparison.data.datasets[0].data = chartData.previousMonth;
      chartsRef.current.comparison.data.datasets[1].data = chartData.currentMonth;
      chartsRef.current.comparison.update('active');
    }

  }, [refreshTrigger, selectedMetric, selectedPeriod, selectedComparison, emissionsPeriod]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartsRef.current.emissions) chartsRef.current.emissions.destroy();
      if (chartsRef.current.electricity) chartsRef.current.electricity.destroy();
      if (chartsRef.current.gauge) chartsRef.current.gauge.destroy();
      if (chartsRef.current.comparison) chartsRef.current.comparison.destroy();
    };
  }, []);
};
