import { useArchive } from '../context/ArchiveContext';
import './pages.css';
import './detail.css';

export default function About() {
  const { channel: CHANNEL } = useArchive();
  return (
    <div className="container" style={{ paddingBottom: '3rem', paddingTop: '1.5rem' }}>
      <div className="about-banner">
        <img
          src={CHANNEL.banner}
          alt=""
          referrerPolicy="no-referrer"
          decoding="async"
        />
      </div>

      <div className="about-card">
        <div className="about-card__avatar">
          <img
            src={CHANNEL.avatar}
            alt={CHANNEL.name}
            referrerPolicy="no-referrer"
            decoding="async"
          />
        </div>
        <div>
          <h1>{CHANNEL.name}</h1>
          <div className="handle">{CHANNEL.handle}</div>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>
            {CHANNEL.tagline}
          </p>
        </div>
      </div>

      <div className="about-stats">
        <div>
          <strong>{CHANNEL.subscribers}</strong>
          <span>Subscribers</span>
        </div>
        <div>
          <strong>{CHANNEL.views}+</strong>
          <span>Total Views</span>
        </div>
        <div>
          <strong>{CHANNEL.videoCount}</strong>
          <span>Videos</span>
        </div>
        <div>
          <strong>{CHANNEL.joined.replace('Joined ', '')}</strong>
          <span>Joined</span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
        About the Channel
      </h2>
      <p className="about-body" style={{ whiteSpace: 'pre-wrap' }}>
        {CHANNEL.about}
      </p>
      {CHANNEL.description !== CHANNEL.about && (
        <p className="about-body" style={{ marginTop: '1rem' }}>
          {CHANNEL.description}
        </p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <a
          className="btn btn-primary"
          href={CHANNEL.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Official YouTube Channel →
        </a>
      </div>
    </div>
  );
}
