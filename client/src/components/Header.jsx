import SearchBar from './SearchBar.jsx';
import { useTheme } from '../context/theme.jsx';

export default function Header(){
  const { dark, setDark } = useTheme();
  return (
    <header className="border-b dark:border-gray-900 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur z-10">
      <div className="max-w-6xl mx-auto p-3 flex items-center gap-4">
        <SearchBar />
        <div className="ml-auto">
          <button onClick={()=>setDark(!dark)} className="text-xs px-3 py-1 rounded border dark:border-gray-800">
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}
