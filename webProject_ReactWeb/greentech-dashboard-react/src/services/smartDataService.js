import axios from 'axios';
import AuthService from './authService';

const API_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      AuthService.logout();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// class SmartDataService {
    
//     getMetrics(type) {
//         return axiosInstance.get(`/metrics/${type}`);
//     }

//     calculateTotal(dataList) {
//         if (!dataList || dataList.length === 0) return 0;
//         return dataList.reduce((sum, item) => sum + (item.value || 0), 0);
//     }
// }





class EnergyDataService {
  getEnergyMetrics() {
    return axiosInstance.get(`/energy/metrics`);
  }

  calculateTotal(dataList) {
        if (!dataList || dataList.length === 0) return 0;
        return dataList.reduce((sum, item) => sum + (item.value || 0), 0);
    }
}

export const energyDataService = new EnergyDataService();

// export default new SmartDataService();