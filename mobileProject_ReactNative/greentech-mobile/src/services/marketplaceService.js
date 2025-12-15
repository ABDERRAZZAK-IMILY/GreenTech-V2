import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from '../helper/apiPath';


const API_URL = `${getBackendUrl()}/api/v1/marketplace`; 

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getAllProducts = async () => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: headers,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur de récupération des produits');
    }
    
    return await response.json();
};

const createOrder = async (orderData) => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors de la création de la commande');
    }
    
    return await response.json();
};

const getMyOrders = async () => {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/my-orders`, {
        method: 'GET',
        headers: headers,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors de la récupération des commandes');
    }
    
    return await response.json();
};


export default {
    getAllProducts,
    createOrder,
    getMyOrders,
};