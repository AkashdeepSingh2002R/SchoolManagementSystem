import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'
const AuthCtx = createContext(null)
export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  useEffect(()=>{
    const cached = localStorage.getItem('user')
    if(cached) setUser(JSON.parse(cached))
  },[])
  const login = async (email, password)=>{
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }
  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
export const useAuth = ()=> useContext(AuthCtx)
