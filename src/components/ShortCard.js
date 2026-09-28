import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './ShortCard.css';

function youtubeEmbed(id, { autoplay = 0 } = {}) {
  const params = new URLSearchParams({
    autoplay: String(autoplay),
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

function captionFromDescription(description = '') {
  const lines = String(description)
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return '';
  // Prefer a short first paragraph as on-screen caption
  const first = lines[0];
  return first.length > 180 ? `${first.slice(0, 177)}…` : first;
}

export default function ShortCard({ video, activeId, onActivate }) {
  const shellRef = useRef(null);
  const [mode, setMode] = useState('idle'); // idle | inline | staging | stage
  const [flyStyle, setFlyStyle] = useState(null);

  const isActive = activeId === video?.id;
  const playingInline = isActive && mode === 'inline';
  const staged = isActive && (mode === 'staging' || mode === 'stage');
  const caption = useMemo(
    () => captionFromDescription(video?.description),
    [video?.description]
  );

  const close = useCallback(() => {
    setMode('idle');
    setFlyStyle(null);
    onActivate?.(null);
  }, [onActivate]);

  useEffect(() => {
    if (!isActive && mode !== 'idle') {
      setMode('idle');
      setFlyStyle(null);
    }
  }, [isActive, mode]);

  useEffect(() => {
    if (!staged) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [staged, close]);

  if (!video) return null;

  const playInline = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate?.(video.id);
    setMode('inline');
    setFlyStyle(null);
  };

  const expandStage = (e) => {
    e.preventDefault();
    if (e.target.closest('.short-card__play')) return;

    const el = shellRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const stageW = Math.min(360, Math.max(260, window.innerWidth * 0.34));
    const stageH = stageW * (16 / 9);
    const finalW = stageW;
    const finalH = Math.min(stageH, window.innerHeight - 64);
    const isMobile = window.innerWidth < 720;
    const finalLeft = isMobile
      ? Math.max(16, (window.innerWidth - finalW) / 2)
      : Math.max(16, window.innerWidth - finalW - 28);
    const finalTop = Math.max(24, (window.innerHeight - finalH) / 2);

    const ease =
      'top 0.48s cubic-bezier(0.22, 1, 0.36, 1), left 0.48s cubic-bezier(0.22, 1, 0.36, 1), width 0.48s cubic-bezier(0.22, 1, 0.36, 1), height 0.48s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.48s ease, box-shadow 0.48s ease';

    setFlyStyle({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: 8,
      zIndex: 90,
      transition: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    });
    onActivate?.(video.id);
    setMode('staging');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyStyle({
          position: 'fixed',
          top: finalTop,
          left: finalLeft,
          width: finalW,
          height: finalH,
          borderRadius: 16,
          zIndex: 90,
          transition: ease,
          boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
        });
        window.setTimeout(() => setMode('stage'), 420);
      });
    });
  };

  return (
    <>
      <article
        ref={shellRef}
        className={`short-card${playingInline ? ' short-card--inline' : ''}${
          staged ? ' short-card--placeholder' : ''
        }`}
      >
        {!staged && (
          <>
            {playingInline ? (
              <iframe
                className="short-card__frame"
                src={youtubeEmbed(video.id, { autoplay: 1 })}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                <button
                  type="button"
                  className="short-card__hit"
                  onClick={expandStage}
                  aria-label={`Expand ${video.title}`}
                />
                <img src={video.thumbnail} alt="" loading="lazy" />
                <div className="short-card__scrim" />
                <button
                  type="button"
                  className="short-card__play"
                  onClick={playInline}
                  aria-label={`Play ${video.title} here`}
                >
                  ▶
                </button>
                <div className="short-card__body">
                  <p className="short-card__title line-clamp-2">{video.title}</p>
                  <span className="short-card__views">{video.views} views</span>
                </div>
              </>
            )}
            {playingInline && (
              <button
                type="button"
                className="short-card__close"
                onClick={close}
                aria-label="Stop"
              >
                ✕
              </button>
            )}
          </>
        )}
      </article>

      {staged && (
        <>
          <button
            type="button"
            className={`short-stage__backdrop${mode === 'stage' ? ' is-open' : ''}`}
            aria-label="Close player"
            onClick={close}
          />

          {mode === 'stage' && (
            <aside className="short-dock__info" aria-live="polite">
              <div className="short-dock__info-inner">
                <span className="short-dock__eyebrow">Short</span>
                <h2 className="short-dock__title">{video.title}</h2>
                <p className="short-dock__meta">
                  {video.views} views
                  {video.published ? ` · ${video.published}` : ''}
                  {video.duration ? ` · ${video.duration}` : ''}
                </p>
                {caption && (
                  <p className="short-dock__caption">{caption}</p>
                )}
                {video.description && video.description !== caption && (
                  <p className="short-dock__desc line-clamp-6">
                    {video.description}
                  </p>
                )}
              </div>
            </aside>
          )}

          <div className="short-stage" style={flyStyle}>
            {mode === 'stage' ? (
              <iframe
                className="short-card__frame"
                src={youtubeEmbed(video.id, { autoplay: 1 })}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <img src={video.thumbnail} alt="" />
            )}
            <button
              type="button"
              className="short-card__close short-card__close--stage"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </>
  );
}
