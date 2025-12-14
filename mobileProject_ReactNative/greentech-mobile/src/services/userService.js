import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080/api/v1/users'; 

// Helper pour récupérer le token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getUserById = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) throw new Error('Erreur récupération utilisateur');
  return await response.json();
};

const getUserProfile = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}/profile`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) throw new Error('Erreur récupération profil');
  return await response.json();
};

const updateUser = async (id, userData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Erreur mise à jour');
  return await response.json();
};

export default {
  getUserById,
  getUserProfile,
  updateUser,
};