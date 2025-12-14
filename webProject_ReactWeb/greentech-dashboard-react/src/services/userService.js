import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/v1/users';

class UserService {
  
  // Get authorization header with token
  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get all users (Admin only)
  async getAllUsers() {
    try {
      const response = await axios.get(API_URL, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user (Admin only)
  async createUser(userData) {
    try {
      const response = await axios.post(API_URL, userData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await axios.put(`${API_URL}/${userId}`, userData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default new UserService();
