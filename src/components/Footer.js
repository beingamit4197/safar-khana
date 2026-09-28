import { Link } from 'react-router-dom';
import { useArchive } from '../context/ArchiveContext';
import './Footer.css';

export default function Footer() {
  const { channel: CHANNEL } = useArchive();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="footer__brand">{CHANNEL.name}</div>
          <p className="footer__copy">
            © {new Date().getFullYear()} Safar Khana. Roadside dusk editorial
            travel & food archive.
          </p>
        </div>
        <nav className="footer__nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/videos">Videos</Link>
          <Link to="/shorts">Shorts</Link>
          <Link to="/playlists">Playlists</Link>
          <Link to="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
