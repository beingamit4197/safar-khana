import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchArchive } from '../data/archive';
import { useArchive } from '../context/ArchiveContext';
import { VideoCard, PlaylistCard } from '../components/VideoCard';
import ShortCard from '../components/ShortCard';
import './pages.css';

export default function Search() {
  const archive = useArchive();
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);
  const [activeShort, setActiveShort] = useState(null);

  const results = useMemo(() => searchArchive(archive, query), [archive, query]);

  const onSubmit = (e) => {
    e.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  const total =
    results.videos.length + results.shorts.length + results.playlists.length;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header className="page-hero">
        <h1>
          Search{query.trim() ? `: “${query.trim()}”` : ''}
        </h1>
        <p>
          {query.trim()
            ? `${total} results across videos, shorts, and playlists.`
            : 'Search the Safar Khana archive.'}
        </p>
      </header>

      <form className="search-field" onSubmit={onSubmit} style={{ width: 'min(100%, 32rem)' }}>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search videos, shorts, playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {!query.trim() && (
        <p className="empty-note">
          Try <Link to="/search?q=Delhi" onClick={() => setQuery('Delhi')}>Delhi</Link>,{' '}
          <Link to="/search?q=Spiti" onClick={() => setQuery('Spiti')}>Spiti</Link>, or{' '}
          <Link to="/search?q=Food" onClick={() => setQuery('Food')}>Food</Link>.
        </p>
      )}

      {query.trim() && total === 0 && (
        <p className="empty-note">No matches for “{query.trim()}”.</p>
      )}

      {results.videos.length > 0 && (
        <section className="result-group">
          <h2>Videos</h2>
          <div className="video-grid">
            {results.videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {results.playlists.length > 0 && (
        <section className="result-group">
          <h2>Playlists</h2>
          <div className="playlist-grid">
            {results.playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        </section>
      )}

      {results.shorts.length > 0 && (
        <section className="result-group">
          <h2>Shorts</h2>
          <div className="shorts-grid">
            {results.shorts.map((s) => (
              <ShortCard
                key={s.id}
                video={s}
                activeId={activeShort}
                onActivate={setActiveShort}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
