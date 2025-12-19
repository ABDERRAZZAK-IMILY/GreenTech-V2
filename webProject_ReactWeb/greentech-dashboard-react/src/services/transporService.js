import axios from "axios";
import AuthService from './authService';


// const API_URL = 'http://localhost:8080/api/vehicle';

const API_URL = process.env.REACT_APP_API_URL + '/vehicle';



class TransportService {
    // Get authorization header with token
    getAuthHeader() {
        const token = AuthService.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    // Add a new vehicle
    async addVehicle(vehicleData) {
        try {
            const response = await axios.post(`${API_URL}/add`, vehicleData, {
                headers: this.getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error adding vehicle:', error);
            throw error;
        }
    }

    // Get all vehicles
    async getAllVehicles() {
        try {
            const response = await axios.get(`${API_URL}/all`, {
                headers: this.getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    }
    // get vihicle by ID
    async getVehicleById(vehicleId) {
        try {
            const response = await axios.get(`${API_URL}/${vehicleId}`, {
                headers: this.getAuthHeader()
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching vehicle:', error);
            throw error;
        }
    }
    // Delete vehicle by ID
    async deleteVehicle(vehicleId) {
        try {
            const response = await axios.delete(`${API_URL}/delete/${vehicleId}`, {
                headers: this.getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            throw error;
        }
    }

}
export default new TransportService();