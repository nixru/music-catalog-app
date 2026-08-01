import { useState, useEffect, useCallback } from 'react';
import { getLibrary, deleteLibraryItem, updateLibraryItem } from '../api/client';
import { Link } from 'react-router-dom';

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n === value ? null : n)}
          className={`text-lg leading-none transition-colors ${
            value >= n ? 'text-gold-400' : 'text-ink-700 hover:text-gold-500/50'
          }`}
          aria-label={`Rate ${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Library() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    getLibrary()
      .then(({ data }) => setItems(data))
      .catch(() => setError('Could not load your library.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRate = async (id, rating) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, userRating: rating } : i)));
    try {
      await updateLibraryItem(id, { userRating: rating });
    } catch {
      load(); // revert on failure
    }
  };

  const handleNotesBlur = async (id) => {
    const notes = notesDraft[id];
    if (notes === undefined) return;
    try {
      await updateLibraryItem(id, { userNotes: notes });
    } catch {
      load();
    }
  };

  const handleRemove = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteLibraryItem(id);
    } catch {
      load();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-paper-100 mb-1">Your library</h1>
          <p className="text-paper-300/60 text-sm">{items.length} album{items.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Link to="/search" className="text-sm text-gold-400 hover:underline">+ Find more albums</Link>
      </div>

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-ink-900 border border-ink-700 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && <p className="text-wine-500 text-sm">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20 text-paper-300/40 border border-dashed border-ink-700 rounded-lg">
          <p className="font-display text-xl mb-2 text-paper-300/70">Your crate is empty</p>
          <p className="text-sm mb-4">Search the catalog and start saving albums you love.</p>
          <Link to="/search" className="inline-block px-4 py-2 bg-gold-500 text-ink-950 rounded font-medium hover:bg-gold-400">
            Search albums
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 bg-ink-900 border border-ink-700 rounded-lg p-4">
            <div className="w-20 h-20 shrink-0 rounded overflow-hidden bg-ink-800">
              {item.artworkUrl ? (
                <img src={item.artworkUrl.replace('100x100', '200x200')} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-paper-300/30 font-display text-xl">♪</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-paper-100 truncate">{item.title}</h3>
                  <p className="text-sm text-paper-300/70 truncate">{item.artistName}</p>
                  <p className="font-mono text-[11px] text-paper-300/50 mt-0.5">
                    {item.releaseDate ? new Date(item.releaseDate).getFullYear() : '—'}
                    {item.genre && ` · ${item.genre}`}
                    {item.trackCount != null && ` · ${item.trackCount} tracks`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-xs text-paper-300/50 hover:text-wine-500 shrink-0"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <Stars value={item.userRating || 0} onChange={(v) => handleRate(item.id, v)} />
                <input
                  defaultValue={item.userNotes || ''}
                  onChange={(e) => setNotesDraft((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={() => handleNotesBlur(item.id)}
                  placeholder="Add a note…"
                  className="flex-1 bg-transparent border-b border-ink-700 text-sm text-paper-200 placeholder-paper-300/30 focus:outline-none focus:border-gold-500 py-0.5"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
