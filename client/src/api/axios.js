// client/src/api/axios.js
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Bearer token from localStorage
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = 'Bearer ' + token;
  return cfg;
});

// Standard error surface
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.error || err.message || 'API error';
    console.warn('API Error:', msg);
    return Promise.reject(err);
  }
);

export default api;
