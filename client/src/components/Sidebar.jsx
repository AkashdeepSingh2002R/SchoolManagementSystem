import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/theme.jsx'
import { useAuth } from '../context/auth.jsx'
import { useEffect } from 'react'

/**
 * Responsive Sidebar
 * - Mobile: off-canvas drawer (overlay below, drawer above header)
 * - Desktop: fixed left column; content uses md:ml-64 so nothing sits under it
 */
export default function Sidebar({ open=false, onClose=()=>{} }){
  const { dark } = useTheme()
  const { logout } = useAuth()
  const nav = useNavigate()

  // Close on ESC (mobile)
  useEffect(()=>{
    const onKey = (e)=>{ if(e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [onClose])

  const items = [
    { to:'/app', label:'Dashboard' },
    { to:'/app/calendar', label:'Calendar' },
    { to:'/app/announcements', label:'Announcements' },
    { to:'/app/meetings', label:'Meeting Room' },
    { to:'/app/newsletter', label:'Newsletter' },
    { to:'/app/messages', label:'Messages' },
  ]

  const baseLink = 'block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 hover:dark:bg-gray-800'
  const activeLink = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'

  return (
    <>
      {/* Backdrop — only on mobile; sits above header but below drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Drawer (mobile) & fixed column (desktop) */}
      <aside
        className={`border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950
                    w-64 h-screen overflow-y-auto
                    fixed inset-y-0 left-0
                    z-50 /* above overlay/header when open on mobile */
                    transition-transform duration-200 ease-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0`}
        aria-label="Sidebar"
      >
        {/* Brand (desktop only) */}
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-800">
          <div className="px-3 py-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">B</div>
              <span className="text-lg font-extrabold tracking-tight">Bluebell Public School</span>
            </Link>
          </div>
        </div>

        {/* Mobile close row */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="font-semibold">Menu</span>
          <button onClick={onClose} aria-label="Close sidebar" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {items.map(it => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) => `${baseLink} ${isActive ? activeLink : 'text-gray-700 dark:text-gray-300'}`}
            >
              {it.label}
            </NavLink>
          ))}
          <hr className="my-2 border-gray-200 dark:border-gray-800" />
          <button
            onClick={() => { logout(); nav('/'); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            Logout
          </button>
        </nav>
      </aside>
    </>
  )
}
