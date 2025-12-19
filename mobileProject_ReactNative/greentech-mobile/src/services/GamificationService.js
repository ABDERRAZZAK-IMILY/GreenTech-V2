import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Make sure axios is installed
import { getBackendUrl } from '../helper/apiPath';

const API_URL = `${getBackendUrl()}/api/v1/gamification`;

// Helper to get headers with the JWT Token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 1. Get current user's gamification stats
const getMyStats = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/my-stats`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// 2. Get leaderboard
const getLeaderboard = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/leaderboard`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// 3. Get active challenges
const getActiveChallenges = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/challenges`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

// 4. Submit a challenge proof
const submitChallenge = async (challengeId, proofImage) => {
  try {
    const headers = await getAuthHeaders();
    
    const challengeData = {
      challengeId: challengeId,
      // Note: If you need to upload a real file, you should use FormData instead of JSON
      proofImageUrl: proofImage || 'no-proof-required' 
    };

    const response = await axios.post(`${API_URL}/submit-challenge`, challengeData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error submitting challenge:', error);
    throw error;
  }
};

// 5. Get user's submissions
const getMySubmissions = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/my-submissions`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

// Export all functions as a default object
export default {
  getMyStats,
  getLeaderboard,
  getActiveChallenges,
  submitChallenge,
  getMySubmissions
};