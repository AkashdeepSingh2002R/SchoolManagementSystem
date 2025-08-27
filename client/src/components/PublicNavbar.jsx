import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/theme.jsx";

function IconMenu(p){return(<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)}
function IconClose(p){return(<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)}
function IconSun(p){return(<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)}
function IconMoon(p){return(<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><path d="M20 12.5A8.5 8.5 0 1 1 11.5 4 6.5 6.5 0 0 0 20 12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)}

export default function PublicNavbar(){
  const { dark, setDark } = useTheme();
  const [open, setOpen] = useState(false);

  // trimmed navigation
  const links = [
    { to: "/admissions", label: "Admissions" },
    { to: "/programs",   label: "Programs"   },
    { to: "/news",       label: "News"       },
    { to: "/contact",    label: "Contact"    },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#7a1f2a] grid place-items-center text-white font-bold">B</div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Bluebell Public School
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({isActive}) =>
                  "px-3 py-2 rounded-lg text-sm font-medium " +
                  (isActive
                    ? "bg-[#7a1f2a] text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800")
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href="/#login"
              className="ml-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#7a1f2a] text-white hover:bg-[#691a24]"
            >
              Login
            </a>

            <button
              onClick={() => setDark(!dark)}
              className="ml-1 inline-flex items-center justify-center rounded-lg px-3 py-2 text-slate-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Toggle theme"
            >
              {dark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-slate-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Toggle theme"
            >
              {dark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-lg text-slate-900 hover:bg-stone-100 dark:text-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Open menu"
            >
              <IconMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Solid mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu overlay"
          />
          <aside className="absolute right-0 top-0 h-full w-[86%] max-w-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-l border-stone-200 dark:border-slate-700 shadow-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7a1f2a] text-white font-bold grid place-items-center">B</div>
                <span className="font-semibold">Bluebell</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Close menu"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 grid gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({isActive}) =>
                    "px-3 py-2 rounded-lg text-sm font-medium hover:bg-stone-100 dark:hover:bg-slate-800 " +
                    (isActive ? "bg-[#7a1f2a] text-white" : "")
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              <a
                href="/#login"
                onClick={() => setOpen(false)}
                className="mt-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[#7a1f2a] text-white hover:bg-[#691a24]"
              >
                Login
              </a>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
