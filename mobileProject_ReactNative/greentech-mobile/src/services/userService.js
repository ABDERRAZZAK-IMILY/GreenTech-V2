import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from '../helper/apiPath';

const API_URL = `${getBackendUrl()}/api/v1/users`; 

// Helper pour récupérer le token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getUserById = async () => {
  const headers = await getAuthHeaders();
  const id = await AsyncStorage.getItem('userId');
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) throw new Error('Erreur récupération utilisateur');
  // console.log(response);
  
  return await response.json();
};

const getUserProfile = async () => {
  const headers = await getAuthHeaders();
  const id = await AsyncStorage.getItem('userId');
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

const updatePassword = async (oldPassword, newPassword) => {
  const headers = await getAuthHeaders();
  const id = await AsyncStorage.getItem('userId');
  
  const response = await fetch(`${API_URL}/${id}/password`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Échec de la mise à jour du mot de passe';
    
    throw new Error(errorMessage);
  }

  return await response.json();
};
export default {
  getUserById,
  getUserProfile,
  updateUser,
  updatePassword,
};