import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useUser } from '../context/UserContext.jsx';
import NameDialog from './NameDialog.jsx';
import { User } from './icons.jsx';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-murasaki-100 text-murasaki-900' : 'text-murasaki-600 hover:text-murasaki-900'
  }`;

export default function Layout() {
  const { username, openNameDialog } = useUser();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-murasaki-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-3" aria-label="Murasaki home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-murasaki-800 font-jp text-2xl font-semibold text-white shadow-sm transition group-hover:rotate-[-4deg]">
              紫
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-murasaki-900">Murasaki</span>
              <span className="hidden text-xs font-medium text-murasaki-500 sm:block">Learn Japanese</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main">
            <NavLink to="/" end className={(state) => `hidden sm:inline-flex ${navClass(state)}`}>
              Practice
            </NavLink>
            <NavLink to="/progress" className={navClass}>
              Progress
            </NavLink>
            <button
              type="button"
              onClick={openNameDialog}
              className="ml-1 inline-flex max-w-[8rem] sm:max-w-[10rem] items-center gap-2 rounded-full border border-murasaki-200 bg-white py-1.5 pr-3 pl-1.5 text-sm font-semibold text-murasaki-800 transition hover:border-murasaki-400"
              title={username ? `Signed in as ${username}` : 'Set a nickname to save progress'}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-murasaki-100 text-murasaki-800">
                <User width={16} height={16} />
              </span>
              <span className="truncate">{username ?? 'Guest'}</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-murasaki-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-murasaki-500 sm:flex-row sm:px-6">
          <p>
            <span className="font-jp text-sm text-murasaki-800">紫</span> Murasaki — one character at a time.
          </p>
          <p>Hiragana · Katakana · Kanji (JLPT N5 → N1)</p>
        </div>
      </footer>

      <NameDialog />
    </div>
  );
}
