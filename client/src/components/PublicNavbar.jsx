import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/theme.jsx';

export default function PublicNavbar(){
  const { dark, setDark } = useTheme();
  const { pathname } = useLocation();
  const item =
    "px-3 py-2 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors";
  const active =
    "bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:text-gray-900";

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">B</div>
          <span className="text-lg font-extrabold tracking-tight">Bluebell Public School</span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1">
          <NavLink to="/" end className={({isActive}) => item + ' ' + (isActive ? active : '')}>Home</NavLink>
          <NavLink to="/academics" className={({isActive}) => item + ' ' + (isActive ? active : '')}>Academics</NavLink>
          <NavLink to="/admissions" className={({isActive}) => item + ' ' + (isActive ? active : '')}>Admissions</NavLink>
          <NavLink to="/news" className={({isActive}) => item + ' ' + (isActive ? active : '')}>News</NavLink>
          <NavLink to="/events" className={({isActive}) => item + ' ' + (isActive ? active : '')}>Events</NavLink>
          <NavLink to="/about" className={({isActive}) => item + ' ' + (isActive ? active : '')}>About</NavLink>
          <NavLink to="/contact" className={({isActive}) => item + ' ' + (isActive ? active : '')}>Contact</NavLink>

          {/* Login as a section on home */}
          <a href={pathname === '/' ? '#login' : '/#login'} className={item}>Login</a>

          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-2 rounded-xl border dark:border-gray-800 ml-1"
            aria-label="Toggle theme"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </nav>
      </div>
    </header>
  );
}