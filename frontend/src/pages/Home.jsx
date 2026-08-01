import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
      <p className="font-mono text-xs tracking-widest text-gold-500 mb-4">MUSIC CATALOG INSIGHTS</p>
      <h1 className="font-display text-5xl leading-tight text-paper-100 mb-6">
        Build a crate<br />worth digging through.
      </h1>
      <p className="text-paper-300/70 text-lg mb-10 max-w-xl mx-auto">
        Search the full iTunes album catalog, save what matters to your own library,
        and see the shape of your taste in genre, year, and rating breakdowns.
      </p>
      <div className="flex justify-center gap-3">
        <Link to="/search" className="px-5 py-2.5 bg-gold-500 text-ink-950 rounded font-medium hover:bg-gold-400 transition-colors">
          Search albums
        </Link>
        {!isAuthenticated && (
          <Link to="/register" className="px-5 py-2.5 border border-ink-700 text-paper-200 rounded hover:border-gold-500 transition-colors">
            Create account
          </Link>
        )}
      </div>
    </div>
  );
}
