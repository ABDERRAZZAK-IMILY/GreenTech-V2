import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/v1/gamification';

// const API_URL = process.env.REACT_APP_API_URL + '/v1/gamification';

class GamificationService {
  
  // Get authorization header with token
  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get current user's gamification stats
  async getMyStats() {
    try {
      const response = await axios.get(`${API_URL}/my-stats`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get leaderboard (all users stats ranked by points)
  async getLeaderboard() {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // Get active challenges
  async getActiveChallenges() {
    try {
      const response = await axios.get(`${API_URL}/challenges`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  // Submit a challenge proof
  async submitChallenge(challengeId, proofImage) {
    try {
      const challengeData = {
        challengeId: challengeId,
        proofImageUrl: proofImage || 'no-proof-required' // Backend expects this field
      };
      const response = await axios.post(`${API_URL}/submit-challenge`, challengeData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting challenge:', error);
      throw error;
    }
  }

  // Get user's submissions
  async getMySubmissions() {
    try {
      const response = await axios.get(`${API_URL}/my-submissions`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // ==================== ADMIN ENDPOINTS ====================

  // Admin: Get all challenges (including inactive)
  async getAllChallenges() {
    try {
      const response = await axios.get(`${API_URL}/admin/challenges`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all challenges:', error);
      throw error;
    }
  }

  // Admin: Get all submissions
  async getAllSubmissions() {
    try {
      const response = await axios.get(`${API_URL}/admin/submissions`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all submissions:', error);
      throw error;
    }
  }

  // Admin: Get pending submissions only
  async getPendingSubmissions() {
    try {
      const response = await axios.get(`${API_URL}/admin/submissions/pending`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      throw error;
    }
  }

  // Admin: Get submissions statistics
  async getSubmissionsStats() {
    try {
      const response = await axios.get(`${API_URL}/admin/submissions/stats`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions stats:', error);
      throw error;
    }
  }

  // Admin: Validate submission (approve or reject)
  async validateSubmission(submissionId, status, adminComment = '') {
    try {
      const response = await axios.post(
        `${API_URL}/admin/submissions/${submissionId}/validate`,
        { status, adminComment },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating submission:', error);
      throw error;
    }
  }

  // Admin: Create challenge
  async createChallenge(challengeData) {
    try {
      const response = await axios.post(`${API_URL}/admin/challenges`, challengeData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  // Admin: Update challenge
  async updateChallenge(challengeId, challengeData) {
    try {
      const response = await axios.put(
        `${API_URL}/admin/challenges/${challengeId}`,
        challengeData,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  // Admin: Toggle challenge status (active/inactive)
  async toggleChallengeStatus(challengeId) {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/challenges/${challengeId}/toggle`,
        {},
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling challenge status:', error);
      throw error;
    }
  }

  // Admin: Delete challenge
  async deleteChallenge(challengeId) {
    try {
      const response = await axios.delete(`${API_URL}/admin/challenges/${challengeId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  // Admin: Award points manually
  async awardPoints(userId, points, reason) {
    try {
      const response = await axios.post(
        `${API_URL}/admin/award-points`,
        { userId, points, reason },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Admin: Deduct points manually
  async deductPoints(userId, points, reason) {
    try {
      const response = await axios.post(
        `${API_URL}/admin/deduct-points`,
        { userId, points, reason },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error deducting points:', error);
      throw error;
    }
  }

  // Alias for getChallenges
  async getChallenges() {
    return this.getActiveChallenges();
  }
}

export default new GamificationService();
