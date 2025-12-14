import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.25.0.1:8080/api/auth'; 

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log(" ============> data received: ", data);

    if (response.ok) {
      // ⚠️ HNA FIN KAN LMOUCHKIL: Beddelna "accessToken" b "token"
      if (data.token) {
        
        // 1. Save Token
        await AsyncStorage.setItem('userToken', data.token);
        
        // 2. Save Role
        await AsyncStorage.setItem('userRole', data.role || 'user');

        // 3. Save ID
        if (data.id) {
           // Bima anna l'ID f log ban string "6938...", n9dro nkhznowh direct
           await AsyncStorage.setItem('userId', String(data.id)); 
           console.log("✅ User ID saved:", data.id);
        }
      } else {
          console.warn("⚠️ Token makaynch f data!");
      }
      
      return data;
    } else {
      throw new Error(data.message || 'Erreur de connexion');
    }
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userRole');
  await AsyncStorage.removeItem('userId');
};

export default {
  login,
  logout,
};