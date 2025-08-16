import { createContext, useContext, useEffect, useState } from 'react'
const ThemeCtx = createContext(null)
export function ThemeProvider({ children }){
  const [dark, setDark] = useState(false)
  useEffect(()=>{
    const saved = localStorage.getItem('dark'); if(saved!==null) setDark(saved==='1')
  },[])
  useEffect(()=>{
    localStorage.setItem('dark', dark?'1':'0')
    const el = document.documentElement
    if(dark) el.classList.add('dark'); else el.classList.remove('dark')
  }, [dark])
  return <ThemeCtx.Provider value={{ dark, setDark }}>{children}</ThemeCtx.Provider>
}
export const useTheme = ()=> useContext(ThemeCtx)
