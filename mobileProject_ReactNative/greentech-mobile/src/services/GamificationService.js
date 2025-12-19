import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Helper function to handle fetch requests cleanly
const request = async (endpoint, method = 'GET', body = null) => {
  try {
    const headers = await getAuthHeaders();
    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    // Return JSON if content exists, otherwise return null (for 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : null;

  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error);
    throw error;
  }
};

// ==================== USER ENDPOINTS ====================

// Get current user's gamification stats
const getMyStats = async () => {
  return request('/my-stats');
};

// Get leaderboard
const getLeaderboard = async () => {
  return request('/leaderboard');
};

// Get active challenges
const getActiveChallenges = async () => {
  return request('/challenges');
};

// Alias for getActiveChallenges
const getChallenges = async () => {
  return getActiveChallenges();
};

// Submit a challenge proof
const submitChallenge = async (challengeId, proofImage) => {
  const challengeData = {
    challengeId: challengeId,
    proofImageUrl: proofImage || 'no-proof-required'
  };
  return request('/submit-challenge', 'POST', challengeData);
};

// Get user's submissions
const getMySubmissions = async () => {
  return request('/my-submissions');
};

// ==================== ADMIN ENDPOINTS ====================

// Admin: Get all challenges (including inactive)
const getAllChallenges = async () => {
  return request('/admin/challenges');
};

// Admin: Get all submissions
const getAllSubmissions = async () => {
  return request('/admin/submissions');
};

// Admin: Get pending submissions only
const getPendingSubmissions = async () => {
  return request('/admin/submissions/pending');
};

// Admin: Get submissions statistics
const getSubmissionsStats = async () => {
  return request('/admin/submissions/stats');
};

// Admin: Validate submission (approve or reject)
const validateSubmission = async (submissionId, status, adminComment = '') => {
  return request(`/admin/submissions/${submissionId}/validate`, 'POST', { 
    status, 
    adminComment 
  });
};

// Admin: Create challenge
const createChallenge = async (challengeData) => {
  return request('/admin/challenges', 'POST', challengeData);
};

// Admin: Update challenge
const updateChallenge = async (challengeId, challengeData) => {
  return request(`/admin/challenges/${challengeId}`, 'PUT', challengeData);
};

// Admin: Toggle challenge status (active/inactive)
const toggleChallengeStatus = async (challengeId) => {
  return request(`/admin/challenges/${challengeId}/toggle`, 'PATCH');
};

// Admin: Delete challenge
const deleteChallenge = async (challengeId) => {
  return request(`/admin/challenges/${challengeId}`, 'DELETE');
};

// Admin: Award points manually
const awardPoints = async (userId, points, reason) => {
  return request('/admin/award-points', 'POST', { userId, points, reason });
};

// Admin: Deduct points manually
const deductPoints = async (userId, points, reason) => {
  return request('/admin/deduct-points', 'POST', { userId, points, reason });
};

export default {
  getMyStats,
  getLeaderboard,
  getActiveChallenges,
  getChallenges,
  submitChallenge,
  getMySubmissions,
  getAllChallenges,
  getAllSubmissions,
  getPendingSubmissions,
  getSubmissionsStats,
  validateSubmission,
  createChallenge,
  updateChallenge,
  toggleChallengeStatus,
  deleteChallenge,
  awardPoints,
  deductPoints
};