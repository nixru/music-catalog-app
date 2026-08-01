import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) navigate('/library');
  };

  return (
    <div className="max-w-sm mx-auto mt-20 px-6">
      <h1 className="font-display text-3xl text-paper-100 mb-1">Welcome back</h1>
      <p className="text-paper-300/60 text-sm mb-8">Sign in to see your saved albums.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-mono text-paper-300/60 mb-1">USERNAME</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-ink-900 border border-ink-700 rounded px-3 py-2 text-paper-100 focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-paper-300/60 mb-1">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-ink-900 border border-ink-700 rounded px-3 py-2 text-paper-100 focus:outline-none focus:border-gold-500"
          />
        </div>

        {error && <p className="text-wine-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-gold-500 text-ink-950 font-medium py-2 rounded hover:bg-gold-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-ink-700" />
        <span className="text-xs text-paper-300/40">OR</span>
        <div className="h-px flex-1 bg-ink-700" />
      </div>

      <GoogleSignInButton />

      <p className="text-sm text-paper-300/60 mt-6">
        No account yet? <Link to="/register" className="text-gold-400 hover:underline">Create one</Link>
      </p>
    </div>
  );
}
