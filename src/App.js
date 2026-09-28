import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Shorts from './pages/Shorts';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Watch from './pages/Watch';
import About from './pages/About';
import Search from './pages/Search';
import { ArchiveProvider } from './context/ArchiveContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
    <ArchiveProvider>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="videos" element={<Videos />} />
          <Route path="shorts" element={<Shorts />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlist/:playlistId" element={<PlaylistDetail />} />
          <Route path="watch/:videoId" element={<Watch />} />
          <Route path="about" element={<About />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ArchiveProvider>
    </ThemeProvider>
  );
}

export default App;
