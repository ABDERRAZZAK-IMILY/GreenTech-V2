// Configuration API Backend
// Mode automatique: l'app essaie plusieurs URLs pour trouver le backend

import Constants from 'expo-constants';
import { getBackendUrl } from '../helper/apiPath';


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
