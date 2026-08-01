import { useState, useEffect, useCallback, useRef } from 'react';
import { searchCatalog, getLibrary, addToLibrary } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function mapResult(r) {
  return {
    appleCatalogId: r.collectionId,
    title: r.collectionName,
    artistName: r.artistName,
    genre: r.primaryGenreName,
    releaseDate: r.releaseDate ? r.releaseDate.substring(0, 10) : null,
    trackCount: r.trackCount,
    artworkUrl: r.artworkUrl100,
  };
}

export default function Search() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 400);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [libraryIds, setLibraryIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);
  const { isAuthenticated } = useAuth();
  const requestSeq = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    getLibrary()
      .then(({ data }) => setLibraryIds(new Set(data.map((i) => i.appleCatalogId))))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!debouncedTerm.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    searchCatalog(debouncedTerm, 'album', 24)
      .then(({ data }) => {
        if (seq !== requestSeq.current) return; // stale response, ignore
        setResults((data.results || []).map(mapResult).filter((a) => a.appleCatalogId));
      })
      .catch(() => {
        if (seq !== requestSeq.current) return;
        setError('Could not reach the catalog. Try again in a moment.');
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  }, [debouncedTerm]);

  const handleAdd = useCallback(async (album) => {
    if (!isAuthenticated) return;
    setAddingId(album.appleCatalogId);
    try {
      await addToLibrary(album);
      setLibraryIds((prev) => new Set(prev).add(album.appleCatalogId));
    } catch (err) {
      // Duplicate (409) or validation error - surface briefly, non-blocking.
      console.error(err);
    } finally {
      setAddingId(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-paper-100 mb-1">Search the catalog</h1>
      <p className="text-paper-300/60 text-sm mb-6">Powered by the iTunes Search API — albums only.</p>

      <input
        autoFocus
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search for an artist or album…"
        className="w-full bg-ink-900 border border-ink-700 rounded-lg px-4 py-3 text-paper-100 text-lg focus:outline-none focus:border-gold-500 mb-8"
      />

      {!isAuthenticated && (
        <div className="mb-6 text-sm text-paper-300/60 border border-ink-700 rounded-lg px-4 py-3 bg-ink-900">
          Sign in to save albums to your library.
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-ink-900 border border-ink-700 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-wine-500 text-sm">{error}</p>
      )}

      {!loading && !error && debouncedTerm.trim() && results.length === 0 && (
        <div className="text-center py-16 text-paper-300/50">
          <p className="font-display text-xl mb-1">No albums found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      )}

      {!loading && !debouncedTerm.trim() && (
        <div className="text-center py-16 text-paper-300/40">
          <p className="font-display text-xl mb-1">Start typing to dig through the catalog</p>
          <p className="text-sm">Try an artist name like "Radiohead" or an album title.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((album) => (
            <AlbumCard
              key={album.appleCatalogId}
              album={album}
              inLibrary={libraryIds.has(album.appleCatalogId)}
              adding={addingId === album.appleCatalogId}
              onAdd={isAuthenticated ? () => handleAdd(album) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
