import { Link } from 'react-router-dom';
import './VideoCard.css';

export { default as ShortCard } from './ShortCard';

export function VideoCard({ video }) {
  if (!video) return null;
  return (
    <Link to={`/watch/${video.id}`} className="video-card">
      <div className="video-card__thumb">
        <img src={video.thumbnail} alt="" loading="lazy" />
        <span className="duration">{video.duration}</span>
      </div>
      <h4 className="video-card__title line-clamp-2">{video.title}</h4>
      <div className="video-card__meta">
        {video.published} · {video.views} views
      </div>
    </Link>
  );
}

export function PlaylistCard({ playlist }) {
  if (!playlist) return null;
  return (
    <Link to={`/playlist/${playlist.id}`} className="playlist-card">
      <div className="playlist-card__thumb">
        <img src={playlist.thumbnail} alt="" loading="lazy" />
        <span className="playlist-card__count">{playlist.videoCount} Videos</span>
      </div>
      <h4 className="playlist-card__title">{playlist.title}</h4>
      <p className="playlist-card__meta">{playlist.updated}</p>
      <span className="playlist-card__link">View Playlist →</span>
    </Link>
  );
}
