import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GrooveMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
      <circle cx="14" cy="14" r="13" fill="none" stroke="#D9A441" strokeWidth="1" opacity="0.5" />
      <circle cx="14" cy="14" r="9.5" fill="none" stroke="#D9A441" strokeWidth="1" opacity="0.7" />
      <circle cx="14" cy="14" r="6" fill="none" stroke="#D9A441" strokeWidth="1" />
      <circle cx="14" cy="14" r="2" fill="#D9A441" />
    </svg>
  );
}

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 text-sm tracking-wide transition-colors ${
    isActive ? 'text-gold-400 border-b border-gold-400' : 'text-paper-300/70 hover:text-paper-100'
  }`;

export default function NavBar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-ink-700 bg-ink-950/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <GrooveMark />
          <span className="font-display text-xl tracking-tight text-paper-100">Crate</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/search" className={linkClass}>Search</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/library" className={linkClass}>Library</NavLink>
              <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-paper-300/60 font-mono text-xs hidden sm:inline">{username}</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-3 py-1.5 border border-ink-700 rounded text-paper-300 hover:border-wine-500 hover:text-wine-500 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="px-3 py-1.5 text-paper-300 hover:text-paper-100">Sign in</NavLink>
              <NavLink to="/register" className="px-3 py-1.5 bg-gold-500 text-ink-950 rounded font-medium hover:bg-gold-400 transition-colors">
                Create account
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
