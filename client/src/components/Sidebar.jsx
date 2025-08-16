import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/theme.jsx'
import { useAuth } from '../context/auth.jsx'

export default function Sidebar(){
  const { dark } = useTheme()
  const { logout } = useAuth()
  const nav = useNavigate()

  const items = [
    { to:'/app', label:'Dashboard' },
    { to:'/app/calendar', label:'Calendar' },
    { to:'/app/announcements', label:'Announcements' },
    { to:'/app/meetings', label:'Meeting Room' },
    { to:'/app/newsletter', label:'Newsletter' },
    { to:'/app/messages', label:'Messages' },
  ]

  return (
    <aside className="w-64 border-r dark:border-gray-900 min-h-screen p-4 hidden md:block">
      <div className="mb-6">
        <div className="text-lg font-bold">Bluebell Admin</div>
        <div className="text-xs text-gray-500">{dark ? 'Dark' : 'Light'} mode</div>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it)=> (
          <NavLink
            key={it.to}
            to={it.to}
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-900'}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">
        <button
          onClick={()=>{ logout(); nav('/'); }}
          className="px-3 py-2 rounded-lg border dark:border-gray-800"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
