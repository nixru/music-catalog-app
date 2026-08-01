function formatYear(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).getFullYear();
}

export default function AlbumCard({ album, inLibrary, onAdd, onRemove, adding }) {
  return (
    <div className="group bg-ink-900 border border-ink-700 rounded-lg overflow-hidden hover:border-gold-500/40 transition-colors flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-ink-800">
        {album.artworkUrl ? (
          <img
            src={album.artworkUrl.replace('100x100', '300x300')}
            alt={`${album.title} artwork`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-paper-300/30 font-display text-3xl">
            ♪
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="font-display text-base leading-snug text-paper-100 line-clamp-2" title={album.title}>
          {album.title}
        </h3>
        <p className="text-sm text-paper-300/70 line-clamp-1">{album.artistName}</p>
        <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-paper-300/50">
          <span>{formatYear(album.releaseDate)}</span>
          {album.genre && <><span>·</span><span className="line-clamp-1">{album.genre}</span></>}
          {album.trackCount != null && <><span>·</span><span>{album.trackCount} tracks</span></>}
        </div>

        <div className="mt-2">
          {onAdd && (
            <button
              onClick={onAdd}
              disabled={inLibrary || adding}
              className={`w-full text-sm py-1.5 rounded border transition-colors ${
                inLibrary
                  ? 'border-teal-600 text-teal-400 cursor-default'
                  : 'border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-ink-950 disabled:opacity-50'
              }`}
            >
              {inLibrary ? 'In library ✓' : adding ? 'Adding…' : '+ Add to library'}
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-full text-sm py-1.5 rounded border border-ink-700 text-paper-300/70 hover:border-wine-500 hover:text-wine-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
