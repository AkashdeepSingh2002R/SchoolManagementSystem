// client/src/api/axios.js
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  'https://schoolmanagementsystem-pscb.onrender.com/api'; // your live Render API

const api = axios.create({ baseURL: BASE_URL });

// Attach Bearer token
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = 'Bearer ' + token;
  return cfg;
});

// Surface API errors
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err?.response?.data?.error || err.message || 'API error';
    console.warn('API Error:', msg);
    return Promise.reject(err);
  }
);

export default api;
