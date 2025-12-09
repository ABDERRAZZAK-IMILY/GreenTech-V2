import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

class AuthService {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });

    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  
  getToken() {
    const user = this.getCurrentUser();
    return user?.token;
  }
}

export default new AuthService();