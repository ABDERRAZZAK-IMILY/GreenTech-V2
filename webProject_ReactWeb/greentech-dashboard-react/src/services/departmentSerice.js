
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/departments';

const getToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
};

export const createDepartment = async (departmentData) => {
    const token = getToken();
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
    const token = getToken();
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

