import { Link, useParams } from 'react-router-dom';
import { useArchive } from '../context/ArchiveContext';
import { findPlaylist, playlistVideos } from '../data/archive';
import './pages.css';
import './detail.css';

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const archive = useArchive();
  const playlist = findPlaylist(archive.playlists, playlistId);
  const videos = playlistVideos(archive.videos, playlist);

  if (!playlist) {
    return (
      <div className="container page-placeholder">
        <h1>Playlist not found</h1>
        <Link to="/playlists" className="btn btn-primary">
          ← Back to Playlists
        </Link>
      </div>
    );
  }

  const first = videos[0];

  return (
    <div className="container" style={{ paddingBottom: '3rem', paddingTop: '1.5rem' }}>
      <Link to="/playlists" className="back-link">
        ← Back to Playlists
      </Link>

      <div className="playlist-detail__hero">
        <div className="playlist-detail__cover">
          <img src={playlist.thumbnail} alt="" />
        </div>
        <div>
          <h1 className="playlist-detail__title">{playlist.title}</h1>
          <p className="playlist-detail__meta">
            {playlist.videoCount} Videos · Complete playlist · {playlist.updated}
          </p>
          <p className="playlist-detail__desc">{playlist.description}</p>
          {first && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Link to={`/watch/${first.id}`} className="btn btn-primary">
                ▶ Play All
              </Link>
              <a
                className="btn btn-dark"
                href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube ↗
              </a>
            </div>
          )}
        </div>
      </div>

      <h2 className="section-title" style={{ marginBottom: '1rem' }}>
        Playlist Description
      </h2>
      <p className="playlist-detail__desc" style={{ marginBottom: '2rem' }}>
        {playlist.description}
      </p>

      <div className="tracklist">
        {videos.map((video, index) => (
          <Link key={video.id} to={`/watch/${video.id}`} className="track">
            <span className="track__num">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="track__thumb">
              <img src={video.thumbnail} alt="" />
            </div>
            <h3 className="track__title line-clamp-2">{video.title}</h3>
            <span className="track__dur">{video.duration}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
