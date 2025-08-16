// client/src/api/axios.example.js
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true, // enable if you use cookies
});
export default api;
