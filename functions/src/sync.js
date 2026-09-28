/**
 * Sync YouTube public channel data → Firestore.
 *
 * Collections:
 *   channel/main
 *   videos/{videoId}
 *   playlists/{playlistId}
 *   syncMeta/lastRun
 */

const admin = require('firebase-admin');
const {
  fetchChannel,
  listPlaylistItemIds,
  fetchVideosByIds,
  fetchPlaylists,
  fetchPlaylistVideoIds,
} = require('./youtube');

function db() {
  return admin.firestore();
}

async function syncChannelArchive({
  channelId = process.env.YOUTUBE_CHANNEL_ID,
  maxVideos = Number(process.env.YOUTUBE_MAX_VIDEOS || 200),
} = {}) {
  if (!channelId) {
    throw new Error('YOUTUBE_CHANNEL_ID is not set');
  }

  const startedAt = new Date().toISOString();
  const channel = await fetchChannel(channelId);
  await db().collection('channel').doc('main').set(channel, { merge: true });

  if (!channel.uploadsPlaylistId) {
    throw new Error('uploads playlist id missing on channel');
  }

  const uploadIds = await listPlaylistItemIds(channel.uploadsPlaylistId);
  const limitedIds = uploadIds.slice(0, maxVideos);
  const videos = await fetchVideosByIds(limitedIds);

  const batchSize = 400;
  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = db().batch();
    for (const video of videos.slice(i, i + batchSize)) {
      batch.set(db().collection('videos').doc(video.id), video, { merge: true });
    }
    await batch.commit();
  }

  const playlists = await fetchPlaylists(channel.id);
  for (const playlist of playlists) {
    const videoIds = await fetchPlaylistVideoIds(playlist.id);
    await db()
      .collection('playlists')
      .doc(playlist.id)
      .set({ ...playlist, videoIds }, { merge: true });
  }

  const meta = {
    startedAt,
    finishedAt: new Date().toISOString(),
    channelId: channel.id,
    videoCount: videos.length,
    playlistCount: playlists.length,
    shortsCount: videos.filter((v) => v.isShort).length,
  };
  await db().collection('syncMeta').doc('lastRun').set(meta, { merge: true });
  return meta;
}

module.exports = { syncChannelArchive };
