/**
 * Local dry-run: reads from YouTube, prints a summary, writes nothing.
 * Usage:
 *   cd functions
 *   YOUTUBE_API_KEY=xxx YOUTUBE_CHANNEL_ID=@handle-or-UCxxx npm run sync:local
 */

const {
  fetchChannel,
  listPlaylistItemIds,
  fetchVideosByIds,
  fetchPlaylists,
} = require('./youtube');

async function main() {
  const channelRef = process.env.YOUTUBE_CHANNEL_ID;
  if (!process.env.YOUTUBE_API_KEY || !channelRef) {
    console.error('Set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID (@handle or UC… id)');
    process.exit(1);
  }

  const channel = await fetchChannel(channelRef);
  console.log(`Channel: ${channel.title} (${channel.id})`);
  console.log(`  ${channel.subscribers} subs · ${channel.views} views · ${channel.videoCount} videos`);

  const ids = await listPlaylistItemIds(channel.uploadsPlaylistId);
  console.log(`Uploads found: ${ids.length}`);

  const sample = await fetchVideosByIds(ids.slice(0, 5));
  console.log('Latest 5:');
  for (const v of sample) {
    console.log(`  ${v.id} | ${v.duration} | ${v.isShort ? 'SHORT' : 'LONG '} | ${v.title}`);
  }

  const playlists = await fetchPlaylists(channel.id);
  console.log(`Playlists: ${playlists.length}`);
  for (const p of playlists.slice(0, 10)) {
    console.log(`  ${p.id} | ${p.videoCount} videos | ${p.title}`);
  }

  console.log(`\nUse this in Firebase config: YOUTUBE_CHANNEL_ID=${channel.id}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
