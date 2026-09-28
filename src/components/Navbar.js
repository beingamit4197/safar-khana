import { NavLink, Link } from 'react-router-dom';
import { useArchive } from '../context/ArchiveContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const links = [
  { to: '/videos', label: 'Videos' },
  { to: '/shorts', label: 'Shorts' },
  { to: '/playlists', label: 'Playlists' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { channel: CHANNEL } = useArchive();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          {CHANNEL.name}
        </Link>

        <nav className="navbar__links" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__theme"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <path
                  d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
          <Link to="/search" className="navbar__search" aria-label="Search">
            <svg
              className="navbar__search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span>Search</span>
          </Link>
          <a
            className="btn btn-dark"
            href={CHANNEL.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube ↗
          </a>
        </div>
      </div>
    </header>
  );
}
