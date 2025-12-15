import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'http://localhost:8080/api/v1/gamification'; 

// Helper pour récupérer les headers d'authentification (Token)
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};


const getMyStats = async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/my-stats`, { 
        method: 'GET',
        headers: headers,
    });
    
    if (!response.ok) {
        throw new Error('Erreur de chargement des statistiques utilisateur');
    }
    
    return await response.json();
};
export default {
    getMyStats
};