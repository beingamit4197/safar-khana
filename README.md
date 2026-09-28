# Safar Khana

**Explore · Travel · Food · Stories**

Public media hub for the [Safar Khana](https://www.youtube.com/@safarkhana) YouTube channel — a structured archive of long videos, Shorts, and playlists, not just a links page.

**Live:** [https://beingamit4197.github.io/safar-khana/](https://beingamit4197.github.io/safar-khana/)

---

## Features

- **Home** — brand hero, latest featured video, uploads, Shorts, playlists, most watched, channel stats
- **Videos / Shorts / Playlists** — browseable archive with search & filters
- **Watch** — embedded player, description, tags, related videos
- **Interactive Shorts** — inline play with expand for a taller watch view
- **About** — channel banner, avatar, stats, full description
- **Dark / light theme** — Navbar toggle, preference saved in `localStorage`
- **Real YouTube data** — shipped as a static archive dump (`src/data/youtubeArchive.json`); optional Firebase/Firestore sync later

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, CSS (design tokens + `data-theme`) |
| Routing | React Router 6 |
| Bundler | Create React App (`react-scripts`) |
| Data | YouTube Data API → JSON archive (optional Firebase Functions + Firestore) |
| Hosting | GitHub Pages |

---

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/videos` | Long-form videos |
| `/shorts` | Shorts grid |
| `/playlists` | Playlists |
| `/playlist/:playlistId` | Playlist detail + tracklist |
| `/watch/:videoId` | Watch page |
| `/about` | About the channel |
| `/search` | Search |

---

## Quick start

```bash
npm install
npm start
```

App runs at [http://127.0.0.1:3000](http://127.0.0.1:3000).

| Script | Purpose |
| --- | --- |
| `npm start` / `npm run dev` | Local development |
| `npm run build` | Production build (`build/`, SPA `404.html` for Pages) |
| `npm test` | CRA test runner |
| `npm run export:youtube` | Refresh archive JSON via YouTube API (see below) |

---

## Data source

By default the site reads **`src/data/youtubeArchive.json`** (exported from the YouTube Data API for `@safarkhana`).

To refresh the dump (needs a YouTube Data API key — never commit it):

```bash
cd functions
npm install
YOUTUBE_API_KEY=... YOUTUBE_CHANNEL_ID=@safarkhana npm run export:archive
```

Optional Firebase path (Firestore + Cloud Functions sync) is scaffolded under `functions/` and `.env.example`. Keep `REACT_APP_USE_FIRESTORE=false` until credentials are configured.

---

## Deploy (GitHub Pages)

Push to `main` triggers [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

Site URL: **https://beingamit4197.github.io/safar-khana/**

Local production build check:

```bash
npm run build
```

---

## Project layout

```
src/
  components/     Navbar, Footer, VideoCard, ShortCard
  context/        ArchiveProvider, ThemeProvider
  data/           youtubeArchive.json, helpers
  pages/          Home, Videos, Shorts, Watch, …
  lib/            contentApi, firebase stub, formatters
functions/        YouTube export + optional sync
```

---

## License

Private project for the Safar Khana channel archive.
