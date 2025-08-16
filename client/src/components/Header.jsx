import { Link } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import { useTheme } from '../context/theme.jsx';

export default function Header({ onOpenSidebar = () => {} }){
  const { dark, setDark } = useTheme();

  return (
    // Keep header above content; sticky at top
    <header className="border-b dark:border-gray-900 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded border border-gray-200 dark:border-gray-800"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M3.75 6.75h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5zm0 6h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5zm0 6h16.5a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Search takes available space */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Brand link (desktop), placed before dark-mode button */}
       
        {/* Dark mode toggle */}
        <div className="shrink-0">
          <button
            onClick={()=>setDark(!dark)}
            className="text-xs px-3 py-1 rounded border border-gray-200 dark:border-gray-800"
            aria-label="Toggle dark mode"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}
