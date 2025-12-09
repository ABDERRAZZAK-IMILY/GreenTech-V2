import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

class AuthService {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });

    console.log('Backend response:', response.data);

    if (response.data.token) {
      const userRole = (response.data.role || response.data.userRole || 'user').toLowerCase();
      
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', userRole);
      
      console.log('Saved userRole:', userRole);
    }

    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
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