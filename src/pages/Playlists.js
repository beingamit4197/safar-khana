import { useArchive } from '../context/ArchiveContext';
import { PlaylistCard } from '../components/VideoCard';
import './pages.css';

export default function Playlists() {
  const { playlists } = useArchive();
  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header className="page-hero">
        <h1>Playlists</h1>
        <p>Curated regional documentations structured for serial viewing.</p>
      </header>
      {playlists.length === 0 ? (
        <p className="empty-note">No public playlists yet.</p>
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
