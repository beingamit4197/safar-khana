export function longVideos(videos) {
  return videos.filter((v) => !v.isShort);
}

export function shortVideos(videos) {
  return videos.filter((v) => v.isShort);
}

export function byLatest(a, b) {
  return (b.publishedAt || '').localeCompare(a.publishedAt || '');
}

export function mostWatched(videos, count = 5) {
  return longVideos(videos)
    .slice()
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, count)
    .map((v, i) => ({ ...v, rank: String(i + 1).padStart(2, '0') }));
}

export function findVideo(videos, id) {
  return videos.find((v) => v.id === id) || null;
}

export function findPlaylist(playlists, id) {
  return playlists.find((p) => p.id === id) || null;
}

export function playlistVideos(videos, playlist) {
  if (!playlist) return [];
  return playlist.videoIds.map((id) => findVideo(videos, id)).filter(Boolean);
}

export function relatedVideos(archive, video, count = 4) {
  const pool = longVideos(archive.videos).filter((v) => v.id !== video?.id);
  if (!video) return pool.slice(0, count);

  const tagSet = new Set((video.tags || []).map((t) => t.toLowerCase()));
  const sharedPlaylistIds = new Set(
    archive.playlists
      .filter((p) => p.videoIds.includes(video.id))
      .flatMap((p) => p.videoIds)
  );

  return pool
    .map((v) => ({
      v,
      score:
        (sharedPlaylistIds.has(v.id) ? 5 : 0) +
        (v.categoryId && v.categoryId === video.categoryId ? 2 : 0) +
        (v.tags || []).filter((t) => tagSet.has(t.toLowerCase())).length * 3 +
        Math.min(v.viewCount / 1e6, 2),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.v);
}

function matches(q) {
  return (text) => (text || '').toLowerCase().includes(q);
}

export function filterVideos(videos, { sort = 'latest', type = 'all', query = '' } = {}) {
  let list = videos.slice();
  if (type === 'shorts') list = shortVideos(list);
  else if (type === 'long') list = longVideos(list);

  const q = query.trim().toLowerCase();
  if (q) {
    const m = matches(q);
    list = list.filter(
      (v) => m(v.title) || (v.tags || []).some(m) || (v.categories || []).some(m)
    );
  }

  if (sort === 'oldest') list.sort((a, b) => byLatest(b, a));
  else if (sort === 'views') list.sort((a, b) => b.viewCount - a.viewCount);
  else list.sort(byLatest);
  return list;
}

export function searchArchive(archive, query) {
  const q = query.trim().toLowerCase();
  if (!q) return { videos: [], shorts: [], playlists: [] };
  const m = matches(q);
  const hit = (v) =>
    m(v.title) || m(v.description) || (v.tags || []).some(m) || (v.categories || []).some(m);
  return {
    videos: longVideos(archive.videos).filter(hit),
    shorts: shortVideos(archive.videos).filter(hit),
    playlists: archive.playlists.filter((p) => m(p.title) || m(p.description)),
  };
}
