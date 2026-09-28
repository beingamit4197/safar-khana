import { Link, useParams } from 'react-router-dom';
import { useArchive } from '../context/ArchiveContext';
import { findVideo, relatedVideos } from '../data/archive';
import { youtubeWatchUrl } from '../lib/format';
import { VideoCard } from '../components/VideoCard';
import './pages.css';
import './detail.css';

export default function Watch() {
  const { videoId } = useParams();
  const archive = useArchive();
  const video = findVideo(archive.videos, videoId);
  const related = relatedVideos(archive, video);

  if (!video) {
    return (
      <div className="container page-placeholder">
        <h1>Video not found</h1>
        <Link to="/videos" className="btn btn-primary">
          ← Back to Videos
        </Link>
      </div>
    );
  }

  const watchUrl = youtubeWatchUrl(video.id);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied');
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem', paddingTop: '1.5rem' }}>
      <Link to="/videos" className="back-link">
        ← Back to Videos
      </Link>

      <div className={`watch-player${video.isShort ? ' watch-player--short' : ''}`}>
        {video.source === 'youtube' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <img src={video.thumbnail} alt="" />
            <div className="watch-player__cta">
              <span className="watch-player__note">Sample video — player appears after YouTube sync</span>
            </div>
          </>
        )}
      </div>

      <h1 className="watch-title">{video.title}</h1>
      <div className="watch-meta">
        <span>{video.views} views</span>
        <span>·</span>
        <span>{video.published}</span>
        <span>·</span>
        <span>{video.duration}</span>
      </div>

      <div className="watch-actions">
        <button type="button" className="btn-ghost" onClick={share}>
          Share
        </button>
        <a
          className="btn btn-primary"
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on YouTube ↗
        </a>
      </div>

      {video.description && (
        <>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Description
          </h2>
          <div className="watch-desc">{video.description}</div>
        </>
      )}

      {video.tags?.length > 0 && (
        <div className="watch-tags">
          {video.tags.slice(0, 12).map((tag) => (
            <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
              #{tag.replace(/\s+/g, '')}
            </Link>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <>
          <div className="section-head">
            <h3 className="section-title">You May Also Like</h3>
          </div>
          <div className="video-grid">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
