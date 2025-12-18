import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/ai';

export const fetchAiAlertsFromApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};