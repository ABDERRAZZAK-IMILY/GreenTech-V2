// Données de l'employé - identiques à la version web
export const employeeData = {
  name: 'Mohammed Alami',
  level: 7,
  currentPoints: 3450,
  nextLevelPoints: 4000,
  rank: 12,
  totalEmployees: 85,
  co2Saved: 245, // kg
  badges: [
    { id: 1, name: 'Éco-Warrior', icon: '🌿', unlocked: true },
    { id: 2, name: 'Transport Vert', icon: '🚴', unlocked: true },
    { id: 3, name: 'Recycleur Pro', icon: '♻️', unlocked: true },
    { id: 4, name: 'Économie d\'Énergie', icon: '💡', unlocked: false },
    { id: 5, name: 'Champion CO2', icon: '🏆', unlocked: false },
    { id: 6, name: 'Mentor Écologique', icon: '🎓', unlocked: false },
  ],
  transport: {
    kmTotal: 342,
    kmEcoDrive: 298,
    fuelConsumed: 28.5, // litres
    co2Transport: 67.5, // kg
    avgCompany: 95 // kg
  },
  stats: {
    week: { points: 450, co2: 32, actions: 18 },
    month: { points: 1850, co2: 142, actions: 76 },
    year: { points: 18500, co2: 1420, actions: 852 }
  }
};
