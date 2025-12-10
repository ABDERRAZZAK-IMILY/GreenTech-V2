import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // L'adresse dyal Backend
});

// Interceptor: Kayzid "Authorization: Bearer ..." f ay request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Jebed token li enregistriti f Login
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;


