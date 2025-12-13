// Helper to get real-time data from localStorage
const getRealTimeData = (type) => {
  try {
    const data = localStorage.getItem(`realtime_${type}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${type} data:`, error);
    return null;
  }
};

// Helper to group data by hour for 24h view
const groupDataByHour = (dataList, field) => {
  const hourlyData = Array(12).fill(0); // Every 2 hours
  const hourlyCounts = Array(12).fill(0);

  dataList.forEach(item => {
    if (item.createdAt && item[field] !== undefined) {
      const date = new Date(item.createdAt);
      const hour = date.getHours();
      const index = Math.floor(hour / 2); // Group by 2-hour intervals
      if (index < 12) {
        hourlyData[index] += item[field];
        hourlyCounts[index]++;
      }
    }
  });

  return hourlyData;
};

// Fonction pour générer des données aléatoires
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Données pour différentes périodes
export const getLineChartData = (metric, period) => {
  // Try to get real-time data for electricity
  if (metric === 'electricity' && period === '24h') {
    const realData = getRealTimeData('energy');
    if (realData && realData.length > 0) {
      const hourlyData = groupDataByHour(realData, 'energyConsumed');
      return {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: hourlyData,
        color: '#f093fb',
        label: 'Consommation (kWh)'
      };
    }
  }

  // Try to get real-time data for waste
  if (metric === 'waste' && period === '24h') {
    const realData = getRealTimeData('trash');
    if (realData && realData.length > 0) {
      const hourlyData = groupDataByHour(realData, 'weight');
      return {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: hourlyData,
        color: '#10b981',
        label: 'Déchets (kg)'
      };
    }
  }

  // Try to get real-time data for gas
  if (metric === 'gas' && period === '24h') {
    const realData = getRealTimeData('gas');
    if (realData && realData.length > 0) {
      const hourlyData = groupDataByHour(realData, 'consumedGas');
      return {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: hourlyData,
        color: '#f59e0b',
        label: 'Gaz (m³)'
      };
    }
  }

  // Try to get real-time data for transport/vehicle
  if (metric === 'transport' && period === '24h') {
    const realData = getRealTimeData('vehicle');
    if (realData && realData.length > 0) {
      // For vehicle, just count trips per time slot
      const hourlyCounts = Array(12).fill(0);
      realData.forEach(item => {
        if (item.createdAt) {
          const date = new Date(item.createdAt);
          const hour = date.getHours();
          const index = Math.floor(hour / 2);
          if (index < 12) {
            hourlyCounts[index] += 5; // 5km per trip
          }
        }
      });
      return {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: hourlyCounts,
        color: '#3b82f6',
        label: 'Distance (km)'
      };
    }
  }

  // Fallback to static data
  const dataConfigs = {
    electricity: {
      '24h': {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: [45, 42, 38, 40, 65, 95, 120, 115, 110, 98, 75, 52],
        color: '#f093fb',
        label: 'Consommation (kWh)'
      },
      '7j': {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [850, 920, 880, 910, 780, 650, 580],
        color: '#f093fb',
        label: 'Consommation (kWh)'
      },
      '30j': {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [3200, 3450, 3100, 3300],
        color: '#f093fb',
        label: 'Consommation (kWh)'
      }
    },
    waste: {
      '24h': {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: [2, 1, 1, 3, 8, 12, 15, 18, 16, 12, 8, 4],
        color: '#10b981',
        label: 'Déchets (kg)'
      },
      '7j': {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [95, 102, 88, 110, 85, 65, 45],
        color: '#10b981',
        label: 'Déchets (kg)'
      },
      '30j': {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [420, 450, 380, 410],
        color: '#10b981',
        label: 'Déchets (kg)'
      }
    },
    gas: {
      '24h': {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: [0.5, 0.4, 0.3, 0.8, 1.5, 2.2, 2.8, 2.5, 2.0, 1.8, 1.2, 0.8],
        color: '#f59e0b',
        label: 'Gaz (m³)'
      },
      '7j': {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [18, 20, 17, 19, 16, 12, 10],
        color: '#f59e0b',
        label: 'Gaz (m³)'
      },
      '30j': {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [75, 82, 70, 78],
        color: '#f59e0b',
        label: 'Gaz (m³)'
      }
    },
    transport: {
      '24h': {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
        data: [0, 0, 0, 5, 12, 8, 15, 10, 8, 12, 5, 0],
        color: '#3b82f6',
        label: 'Distance (km)'
      },
      '7j': {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [45, 52, 48, 50, 42, 25, 18],
        color: '#3b82f6',
        label: 'Distance (km)'
      },
      '30j': {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [180, 195, 175, 185],
        color: '#3b82f6',
        label: 'Distance (km)'
      }
    }
  };

  return dataConfigs[metric][period];
};

// Données pour le bar chart de comparaison
export const getComparisonData = (metric) => {
  const comparisonConfigs = {
    electricity: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      previousMonth: [650, 680, 640, 670],
      currentMonth: [580, 620, 590, 610]
    },
    waste: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      previousMonth: [110, 115, 105, 112],
      currentMonth: [95, 102, 88, 98]
    },
    gas: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      previousMonth: [22, 24, 21, 23],
      currentMonth: [18, 20, 17, 19]
    },
    transport: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      previousMonth: [200, 210, 195, 205],
      currentMonth: [180, 195, 175, 185]
    }
  };

  return comparisonConfigs[metric];
};

// Données pour le doughnut chart des émissions
export const getEmissionsData = (period) => {
  if (period === 'today') {
    return {
      labels: ['Électricité', 'Gaz', 'Transport', 'Déchets'],
      data: [250, 89, 50, 28]
    };
  } else {
    return {
      labels: ['Électricité', 'Gaz', 'Transport', 'Déchets'],
      data: [7500, 2670, 1500, 840]
    };
  }
};
