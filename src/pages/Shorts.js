import { useState } from 'react';
import { useArchive } from '../context/ArchiveContext';
import { shortVideos } from '../data/archive';
import ShortCard from '../components/ShortCard';
import './pages.css';

export default function Shorts() {
  const { videos } = useArchive();
  const shorts = shortVideos(videos);
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <header className="page-hero">
        <h1>Shorts</h1>
        <p>
          Play button → watch in place. Tap the card → it lifts to the side and
          plays.
        </p>
      </header>
      {shorts.length === 0 ? (
        <p className="empty-note">No shorts yet.</p>
      ) : (
        <div className="shorts-grid">
          {shorts.map((short) => (
            <ShortCard
              key={short.id}
              video={short}
              activeId={activeId}
              onActivate={setActiveId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
