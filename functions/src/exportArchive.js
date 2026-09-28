/**
 * Fetch full public channel archive → src/data/youtubeArchive.json
 * (no secrets written; API key via env only)
 *
 *   cd functions
 *   YOUTUBE_API_KEY=... YOUTUBE_CHANNEL_ID=@safarkhana npm run export:archive
 */

const fs = require('fs');
const path = require('path');
const {
  fetchChannel,
  listPlaylistItemIds,
  fetchVideosByIds,
  fetchPlaylists,
  fetchPlaylistVideoIds,
} = require('./youtube');

async function main() {
  const channelRef = process.env.YOUTUBE_CHANNEL_ID || '@safarkhana';
  const maxVideos = Number(process.env.YOUTUBE_MAX_VIDEOS || 500);

  if (!process.env.YOUTUBE_API_KEY) {
    console.error('Set YOUTUBE_API_KEY');
    process.exit(1);
  }

  console.log(`Fetching channel ${channelRef}…`);
  const channel = await fetchChannel(channelRef);
  console.log(`  ${channel.title} · ${channel.subscribers} · ${channel.videoCount} videos`);

  const uploadIds = await listPlaylistItemIds(channel.uploadsPlaylistId, {
    maxPages: 40,
  });
  const limited = uploadIds.slice(0, maxVideos);
  console.log(`Fetching ${limited.length} video details…`);
  const videos = await fetchVideosByIds(limited);
  videos.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  console.log('Fetching playlists…');
  const playlistsRaw = await fetchPlaylists(channel.id);
  const playlists = [];
  for (const p of playlistsRaw) {
    const videoIds = await fetchPlaylistVideoIds(p.id);
    playlists.push({
      ...p,
      videoIds,
      updated: 'Updated recently',
    });
    console.log(`  ${p.title} (${videoIds.length} items)`);
  }

  // Drop heavy nested thumbnails blobs from dump (keep flat thumbnail URL)
  const slimVideos = videos.map(({ thumbnails, ...rest }) => rest);
  const slimPlaylists = playlists.map(({ thumbnails, ...rest }) => rest);
  const { thumbnails, uploadsPlaylistId, ...slimChannel } = channel;

  const archive = {
    exportedAt: new Date().toISOString(),
    channel: {
      ...slimChannel,
      thumbnails,
      avatar:
        thumbnails?.high?.url ||
        thumbnails?.medium?.url ||
        thumbnails?.default?.url ||
        null,
    },
    videos: slimVideos,
    playlists: slimPlaylists,
    categories: [
      'Food',
      'Travel',
      'Hotels',
      'Street Food',
      'Road Trips',
      'Vlogs',
    ],
    stats: {
      videoCount: slimVideos.length,
      shortsCount: slimVideos.filter((v) => v.isShort).length,
      longCount: slimVideos.filter((v) => !v.isShort).length,
      playlistCount: slimPlaylists.length,
    },
  };

  const outPath = path.resolve(
    __dirname,
    '../../src/data/youtubeArchive.json'
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(archive, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log(
    `  ${archive.stats.longCount} long · ${archive.stats.shortsCount} shorts · ${archive.stats.playlistCount} playlists`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
