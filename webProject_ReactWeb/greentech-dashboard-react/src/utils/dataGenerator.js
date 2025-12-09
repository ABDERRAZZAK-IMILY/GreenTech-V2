// Fonction pour générer des données aléatoires
const generateRandomData = (count, min, max) => {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

// Données pour différentes périodes
export const getLineChartData = (metric, period) => {
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
