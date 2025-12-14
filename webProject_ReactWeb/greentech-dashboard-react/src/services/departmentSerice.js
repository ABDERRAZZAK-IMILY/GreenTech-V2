
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/departments';
const token = JSON.parse(localStorage.getItem('user')).token;

export const createDepartment = async (departmentData) => {

    console.log(token);


    try {
        const response = await axios.post(`${API_URL}`,
            departmentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response
    } catch (error) {
        console.log(error);
    }
}
export const getAllDepartments = async () => {
    try {
        const response = await axios.get(`${API_URL}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response
    } catch (error) {
        console.log(error);
    }
}

