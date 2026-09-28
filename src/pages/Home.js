import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { longVideos, mostWatched, shortVideos } from '../data/archive';
import {
  VideoCard,
  PlaylistCard,
} from '../components/VideoCard';
import ShortCard from '../components/ShortCard';
import './Home.css';

export default function Home() {
  const archive = useArchive();
  const CHANNEL = archive.channel;
  const CATEGORIES = archive.categories;
  const PLAYLISTS = archive.playlists;
  const [FEATURED, ...rest] = longVideos(archive.videos);
  const LATEST_VIDEOS = rest.slice(0, 4);
  const SHORTS = shortVideos(archive.videos).slice(0, 6);
  const MOST_WATCHED = mostWatched(archive.videos);
  const [activeShort, setActiveShort] = useState(null);

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero__content">
          <div className="home-hero__intro">
            <div className="home-hero__avatar">
              <img
                src={CHANNEL.avatar}
                alt=""
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="home-hero__eyebrow">
                Visual Dispatch & Field Archive
              </span>
              <div className="home-hero__meta-line">
                {[CHANNEL.handle, CHANNEL.joined].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          <h1 className="home-hero__title">{CHANNEL.name}</h1>
          <p className="home-hero__tagline">{CHANNEL.tagline}</p>
          <p className="home-hero__desc">{CHANNEL.description}</p>

          <div className="home-hero__bar">
            <div className="home-hero__stats">
              <strong>{CHANNEL.subscribers} Subscribers</strong>
              <span className="sep">/</span>
              <span>{CHANNEL.views} Total Views</span>
              <span className="sep">/</span>
              <span>{CHANNEL.videoCount} Videos</span>
              <span className="sep">/</span>
              <span>{CHANNEL.joined}</span>
            </div>
            <a
              className="btn btn-primary"
              href={CHANNEL.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe on YouTube ↗
            </a>
          </div>
        </div>
      </section>

      <div className="categories">
        <ul className="container categories__list">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <Link to={`/videos?q=${encodeURIComponent(cat)}`}>{cat}</Link>
            </li>
          ))}
        </ul>
      </div>

      {FEATURED && (
      <section className="section" style={{ borderTop: 'none' }}>
        <div className="container">
          <div className="featured">
            <div className="featured__top">
              <span className="label">Latest Video</span>
              {FEATURED.fieldEntry && (
                <span className="featured__entry">
                  FIELD ENTRY {FEATURED.fieldEntry}
                </span>
              )}
            </div>
            <Link to={`/watch/${FEATURED.id}`} className="featured__media">
              <img src={FEATURED.thumbnail} alt={FEATURED.title} />
              <div className="featured__overlay" />
              <span className="duration">{FEATURED.duration}</span>
              <div className="featured__play">
                <span>▶ Watch Video</span>
              </div>
            </Link>
            <h2 className="featured__title">{FEATURED.title}</h2>
            <div className="featured__meta">
              <span>Published {FEATURED.published}</span>
              <span>·</span>
              <span>Duration {FEATURED.duration}</span>
              <span>·</span>
              <span className="views">{FEATURED.views} Views</span>
              {FEATURED.badge && <span className="badge">{FEATURED.badge}</span>}
            </div>
          </div>
        </div>
      </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h3 className="section-title">Latest Uploads</h3>
              <p className="section-sub">
                Chronological road records and culinary expeditions
              </p>
            </div>
            <Link to="/videos" className="section-link">
              View All Uploads →
            </Link>
          </div>
          <div className="video-grid">
            {LATEST_VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h3 className="section-title">Shorts</h3>
              <p className="section-sub">
                Bite-sized road dispatches & street bites
              </p>
            </div>
            <Link to="/shorts" className="section-link">
              View All Shorts →
            </Link>
          </div>
          <div className="shorts-grid">
            {SHORTS.map((short) => (
              <ShortCard
                key={short.id}
                video={short}
                activeId={activeShort}
                onActivate={setActiveShort}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h3 className="section-title">Curated Expeditions & Playlists</h3>
              <p className="section-sub">
                Regional documentations structured for serial viewing
              </p>
            </div>
            <Link to="/playlists" className="section-link">
              View All Playlists →
            </Link>
          </div>
          <div className="playlist-grid">
            {PLAYLISTS.slice(0, 3).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h3 className="section-title">All-Time Most Watched</h3>
              <p className="section-sub">Popular dispatches from the archive</p>
            </div>
            <Link to="/videos" className="section-link">
              View Popular →
            </Link>
          </div>
          <div className="ranked">
            {MOST_WATCHED.map((item) => (
              <Link
                key={item.id}
                to={`/watch/${item.id}`}
                className="ranked__item"
              >
                <span className="ranked__num">{item.rank}</span>
                <div className="ranked__thumb">
                  <img src={item.thumbnail} alt="" />
                </div>
                <h4 className="ranked__title line-clamp-2">{item.title}</h4>
                <span className="ranked__views">{item.views} views</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <p className="stats__brand">Safar Khana</p>
          <div className="stats__grid">
            <div>
              <span className="stats__value">{CHANNEL.subscribers}</span>
              <span className="stats__label">Subscribers</span>
            </div>
            <div>
              <span className="stats__value">{CHANNEL.videoCount}+</span>
              <span className="stats__label">Videos</span>
            </div>
            <div>
              <span className="stats__value">{CHANNEL.views}+</span>
              <span className="stats__label">Views</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta__box">
            <h3 className="cta__title">Stay Updated</h3>
            <p className="cta__text">
              Join the caravan on YouTube. New road stories release every Sunday
              at 10 AM IST.
            </p>
            <a
              className="btn btn-primary"
              href={CHANNEL.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe on YouTube ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
