// Actions quotidiennes - identiques à la version web
export const dailyActions = [
  {
    id: 1,
    title: 'Éteindre ordinateur en pause',
    icon: 'desktop-outline',
    points: 15,
    completed: false,
    submitted: false,
    category: 'energie',
    requiresProof: true,
    proofDescription: 'Screenshot de l\'historique d\'extinction de votre ordinateur (Windows/Mac)'
  },
  {
    id: 2,
    title: 'Apporter sa tasse/mug personnel',
    icon: 'cafe-outline',
    points: 10,
    completed: false,
    submitted: false,
    category: 'dechets',
    requiresProof: true,
    proofDescription: 'Photo de votre tasse/mug personnel sur votre bureau'
  },
  {
    id: 3,
    title: 'Utiliser un pass transport en commun',
    icon: 'bus-outline',
    points: 20,
    completed: false,
    submitted: false,
    category: 'transport',
    requiresProof: true,
    proofDescription: 'Photo de votre pass de transport en commun mensuel actif'
  },
  {
    id: 4,
    title: 'Marcher pour venir au travail',
    icon: 'walk-outline',
    points: 25,
    completed: false,
    submitted: false,
    category: 'transport',
    requiresProof: true,
    proofDescription: 'Screenshot de votre application podomètre montrant les pas effectués aujourd\'hui'
  },
  {
    id: 5,
    title: 'Utiliser une trottinette électrique',
    icon: 'flash-outline',
    points: 20,
    completed: false,
    submitted: false,
    category: 'transport',
    requiresProof: true,
    proofDescription: 'Photo de votre trottinette électrique au parking de l\'entreprise'
  },
  {
    id: 6,
    title: 'Déjeuner avec lunch box réutilisable',
    icon: 'restaurant-outline',
    points: 15,
    completed: false,
    submitted: false,
    category: 'dechets',
    requiresProof: true,
    proofDescription: 'Photo de votre lunch box réutilisable avec votre repas'
  },
  {
    id: 7,
    title: 'Participer à une action de nettoyage',
    icon: 'people-outline',
    points: 50,
    completed: false,
    submitted: false,
    category: 'collectif',
    requiresProof: true,
    proofDescription: 'Photo de vous avec l\'équipe pendant l\'action de nettoyage'
  },
  {
    id: 8,
    title: 'Installer une plante au bureau',
    icon: 'leaf-outline',
    points: 30,
    completed: false,
    submitted: false,
    category: 'bureau',
    requiresProof: true,
    proofDescription: 'Photo de la plante installée sur votre bureau avec votre espace visible'
  }
];

// Données de tracking GPS en temps réel
export const currentPosition = {
  lat: 33.5731,
  lng: -7.5898,
  address: 'Avenue Mohammed V, Casablanca',
  speed: 45,
  ecoMode: true,
  fuelConsumption: 6.2
};

export const tripData = {
  distance: 23.5,
  duration: '34 min',
  avgSpeed: 42,
  ecoScore: 85,
  co2Saved: 1.8,
  fuelSaved: 0.7
};
