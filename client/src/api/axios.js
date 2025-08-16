import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api' })

api.interceptors.request.use((cfg)=>{
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = 'Bearer '+token
  return cfg
})

api.interceptors.response.use(
  (r)=>r,
  (err)=>{
    const msg = err?.response?.data?.error || err.message || 'API error'
    console.warn('API Error:', msg)
    return Promise.reject(err)
  }
)
export default api
