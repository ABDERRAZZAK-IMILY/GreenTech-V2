// Produits de la boutique - identiques à la version web
export const products = [
  {
    id: 1,
    name: "Bon d'achat Jumia",
    description: "Voucher de 1200 MAD pour vos achats en ligne",
    cost: 2000,
    category: 'rewards',
    icon: '🎁',
    badge: 'Populaire',
    badgeColor: '#3b82f6'
  },
  {
    id: 2,
    name: "Journée Télétravail Bonus",
    description: "Une journée de télétravail supplémentaire",
    cost: 1500,
    category: 'perks',
    icon: '🏠',
    badge: null,
    badgeColor: null
  },
  {
    id: 3,
    name: "Parking Premium - 1 Mois",
    description: "Accès au parking couvert pendant 1 mois",
    cost: 1000,
    category: 'benefits',
    icon: '🅿️',
    badge: null,
    badgeColor: null
  },
  {
    id: 4,
    name: "Café Gratuit - 1 Semaine",
    description: "Café et boissons chaudes offerts pendant 1 semaine",
    cost: 500,
    category: 'benefits',
    icon: '☕',
    badge: 'Meilleure affaire',
    badgeColor: '#10b981'
  },
  {
    id: 5,
    name: "Prime Verte - 1500 MAD",
    description: "Prime en espèces pour performance écologique",
    cost: 5000,
    category: 'rewards',
    icon: '💰',
    badge: 'Premium',
    badgeColor: '#f59e0b'
  },
  {
    id: 6,
    name: "Déjeuner Équipe Offert",
    description: "Déjeuner pour toute l'équipe dans un restaurant éco-responsable",
    cost: 8000,
    category: 'rewards',
    icon: '🍽️',
    badge: 'Collectif',
    badgeColor: '#8b5cf6'
  },
  {
    id: 7,
    name: "Week-end Éco-Tourisme",
    description: "Week-end découverte dans un éco-lodge au Maroc",
    cost: 12000,
    category: 'rewards',
    icon: '🌿',
    badge: 'Expérience',
    badgeColor: '#ec4899'
  }
];

export const filters = [
  { id: 'all', label: 'Tout', icon: '🌟' },
  { id: 'rewards', label: 'Récompenses', icon: '🎁' },
  { id: 'perks', label: 'Avantages', icon: '⭐' },
  { id: 'benefits', label: 'Bénéfices', icon: '💎' }
];
