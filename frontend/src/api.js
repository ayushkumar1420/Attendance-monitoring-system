import axios from 'axios';

const api = axios.create({
  // Configure VITE_API_URL to the deployed backend in Vercel. Local Vite
  // defaults to its /api proxy, which targets localhost:5000.
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

