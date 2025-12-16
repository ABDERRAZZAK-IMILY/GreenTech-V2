// Configuration API Backend
// Mode automatique: l'app essaie plusieurs URLs pour trouver le backend

import Constants from 'expo-constants';

// Récupérer l'IP du serveur Expo automatiquement
const getBackendUrl = () => {
  // En développement, utiliser l'IP du serveur Expo (même machine que le backend)
  const expoHostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;

  if (expoHostUri) {
    // Extraire l'IP du hostUri (format: "192.168.1.30:8081")
    const ip = expoHostUri.split(':')[0];
    return `http://${ip}:8080`;
  }

  // Fallback sur localhost
  return 'http://localhost:8080';
};

export const API_CONFIG = {
  // URL détectée automatiquement
  BASE_URL: getBackendUrl(),
  // Endpoints
  ENDPOINTS: {
    POSITION: '/api/position',
  },
  SEND_INTERVAL: 2000, // 2 secondes - mise à jour rapide
};

export default API_CONFIG;
