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

class TrashDataService {
  getTrashMetrics() {
    return axiosInstance.get(`/trash/metrics`);
  }

  getTodayMetrics() {
    return axiosInstance.get(`/trash/today`);
  }

  // Get all trash monitors
  getAllMonitors() {
    return axiosInstance.get(`/trash/monitor/all`);
  }

  // Create new trash monitor
  createMonitor(monitorData) {
    return axiosInstance.post(`/trash/monitor`, monitorData);
  }

  // Update trash monitor status
  updateMonitorStatus(macAddress, statusData) {
    return axiosInstance.patch(`/trash/monitor/${macAddress}`, statusData);
  }

  // Submit manual trash data
  submitManualData(data) {
    return axiosInstance.post(`/trash/ingest`, data);
  }

  calculateTotal(dataList) {
    if (!dataList || dataList.length === 0) return 0;
    return dataList.reduce((sum, item) => sum + (item.weight || 0), 0);
  }
}

class EnergyDataService {
  getEnergyMetrics() {
    return axiosInstance.get(`/energy/metrics`);
  }

  getTodayMetrics() {
    return axiosInstance.get(`/energy/today`);
  }

  // Get all energy monitors
  getAllMonitors() {
    return axiosInstance.get(`/energy/monitor/all`);
  }

  // Create new energy monitor
  createMonitor(monitorData) {
    return axiosInstance.post(`/energy/monitor/create`, monitorData);
  }

  // Update energy monitor status
  updateMonitorStatus(macAddress, statusData) {
    return axiosInstance.patch(`/energy/monitor/update/${macAddress}`, statusData);
  }

  // Submit manual energy data
  submitManualData(data) {
    return axiosInstance.post(`/energy/ingest`, data);
  }

  calculateTotal(dataList) {
    if (!dataList || dataList.length === 0) return 0;
    return dataList.reduce((sum, item) => sum + (item.energyConsumed || 0), 0);
  }
}

class GasDataService {
  getGasMetrics() {
    return axiosInstance.get(`/gas/metrics`);
  }
// Submit manual gas data
  submitManualData(data) {
    return axiosInstance.post(`/gas/ingest`, data);
  }

  
  getTodayMetrics() {
    return axiosInstance.get(`/gas/today`);
  }

  calculateTotal(dataList) {
    if (!dataList || dataList.length === 0) return 0;
    return dataList.reduce((sum, item) => sum + (item.consumedGas || 0), 0);
  }
}

class VehicleDataService {
  getVehicleMetrics() {
    return axiosInstance.get(`/vehicle/metrics`);
  }

  getTodayMetrics() {
    return axiosInstance.get(`/vehicle/today`);
  }

  // Submit manual vehicle data
  submitManualData(data) {
    return axiosInstance.post(`/vehicle/ingest`, data);
  }

  // Calculate distance between two GPS coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate total distance from vehicle logs
  calculateTotal(dataList) {
    if (!dataList || dataList.length === 0) return 0;
    if (dataList.length === 1) return 0; // Need at least 2 points
    
    let totalDistance = 0;
    
    // Sort by createdAt to ensure chronological order
    const sortedData = [...dataList].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    // Calculate distance between consecutive points
    for (let i = 1; i < sortedData.length; i++) {
      const prev = sortedData[i - 1];
      const curr = sortedData[i];
      
      if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
        const distance = this.calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
        
        // Add distance only if it's reasonable (less than 100km between consecutive points)
        // This helps filter out GPS errors or unrealistic jumps
        if (distance < 100) {
          totalDistance += distance;
        }
      }
    }
    
    return totalDistance;
  }
}

export const energyDataService = new EnergyDataService();
export const trashDataService = new TrashDataService();
export const gasDataService = new GasDataService();
export const vehicleDataService = new VehicleDataService();



