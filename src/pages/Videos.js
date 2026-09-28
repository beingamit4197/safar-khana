import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterVideos } from '../data/archive';
import { useArchive } from '../context/ArchiveContext';
import { VideoCard } from '../components/VideoCard';
import './pages.css';

const FILTERS = [
  { id: 'all', label: 'All', sort: 'latest', type: 'all' },
  { id: 'latest', label: 'Latest', sort: 'latest', type: 'long' },
  { id: 'oldest', label: 'Oldest', sort: 'oldest', type: 'long' },
  { id: 'views', label: 'Most Viewed', sort: 'views', type: 'long' },
  { id: 'long', label: 'Long Videos', sort: 'latest', type: 'long' },
  { id: 'shorts', label: 'Shorts', sort: 'latest', type: 'shorts' },
];

export default function Videos() {
  const archive = useArchive();
  const [params] = useSearchParams();
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState(params.get('q') || '');
  const filter = FILTERS.find((f) => f.id === active) || FILTERS[0];

  const videos = useMemo(
    () =>
      filterVideos(archive.videos, {
        sort: filter.sort,
        type: filter.type,
        query,
      }),
    [archive.videos, filter, query]
  );

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header className="page-hero">
        <h1>All Videos</h1>
        <p>Complete archive of long-form dispatches and field cuts.</p>
      </header>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Video filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active === f.id}
              className={`filter-chip${active === f.id ? ' active' : ''}`}
              onClick={() => setActive(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {videos.length === 0 ? (
        <p className="empty-note">No videos match this filter.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
