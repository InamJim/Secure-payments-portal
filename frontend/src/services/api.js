import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:30356/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Attach JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API ERROR:", error.response || error.message);

        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Auth
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// Payments
export const paymentService = {
    createPayment: (data) => api.post('/payments/pay', data),
    getAllPayments: () => api.get('/payments/all'),
    getMyPayments: () => api.get('/payments/my'),
    verifyPayment: (id) => api.post(`/payments/verify/${id}`),
};

export default api;