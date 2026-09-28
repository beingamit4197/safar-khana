/**
 * YouTube Data API v3 helpers.
 * API key stays in Functions secrets — never in the React bundle.
 */

const { google } = require('googleapis');

function getYoutube() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }
  return google.youtube({ version: 'v3', auth: apiKey });
}

function parseDurationIso8601(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)
  );
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatCount(n) {
  const num = Number(n || 0);
  if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
}

async function fetchChannel(channelIdOrHandle) {
  const youtube = getYoutube();
  const isHandle = channelIdOrHandle.startsWith('@');
  const res = await youtube.channels.list({
    part: ['snippet', 'statistics', 'contentDetails', 'brandingSettings'],
    ...(isHandle
      ? { forHandle: channelIdOrHandle }
      : { id: [channelIdOrHandle] }),
  });
  const item = res.data.items?.[0];
  if (!item) throw new Error(`Channel not found: ${channelIdOrHandle}`);

  const sn = item.snippet || {};
  const st = item.statistics || {};
  const uploadsPlaylistId =
    item.contentDetails?.relatedPlaylists?.uploads || null;
  const branding = item.brandingSettings?.image || {};

  return {
    id: item.id,
    title: sn.title,
    description: sn.description || '',
    customUrl: sn.customUrl || '',
    publishedAt: sn.publishedAt,
    thumbnails: sn.thumbnails || {},
    bannerUrl: branding.bannerExternalUrl || null,
    subscriberCount: Number(st.subscriberCount || 0),
    viewCount: Number(st.viewCount || 0),
    videoCount: Number(st.videoCount || 0),
    subscribers: formatCount(st.subscriberCount),
    views: formatCount(st.viewCount),
    uploadsPlaylistId,
    syncedAt: new Date().toISOString(),
  };
}

async function listPlaylistItemIds(playlistId, { maxPages = 20 } = {}) {
  const youtube = getYoutube();
  const ids = [];
  let pageToken;
  let pages = 0;
  do {
    const res = await youtube.playlistItems.list({
      part: ['contentDetails', 'snippet'],
      playlistId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items || []) {
      const videoId = item.contentDetails?.videoId;
      if (videoId) ids.push(videoId);
    }
    pageToken = res.data.nextPageToken;
    pages += 1;
  } while (pageToken && pages < maxPages);
  return ids;
}

async function fetchVideosByIds(videoIds) {
  const youtube = getYoutube();
  const out = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const res = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: chunk,
    });
    for (const item of res.data.items || []) {
      const sn = item.snippet || {};
      const st = item.statistics || {};
      const durationSec = parseDurationIso8601(item.contentDetails?.duration);
      const title = sn.title || '';
      const description = sn.description || '';
      const shortsHint =
        /#shorts\b/i.test(title) ||
        /#shorts\b/i.test(description) ||
        /\bshorts\b/i.test(title);
      out.push({
        id: item.id,
        title,
        description,
        publishedAt: sn.publishedAt,
        thumbnails: sn.thumbnails || {},
        thumbnail:
          sn.thumbnails?.maxres?.url ||
          sn.thumbnails?.high?.url ||
          sn.thumbnails?.medium?.url ||
          null,
        tags: sn.tags || [],
        categoryId: sn.categoryId || null,
        durationSec,
        duration: formatDuration(durationSec),
        // Shorts: classic <=60s, or tagged; newer Shorts can be longer but tagged.
        isShort: (durationSec > 0 && durationSec <= 60) || (shortsHint && durationSec <= 180),
        viewCount: Number(st.viewCount || 0),
        likeCount: Number(st.likeCount || 0),
        commentCount: Number(st.commentCount || 0),
        views: formatCount(st.viewCount),
        syncedAt: new Date().toISOString(),
      });
    }
  }
  return out;
}

async function fetchPlaylists(channelId) {
  const youtube = getYoutube();
  const playlists = [];
  let pageToken;
  do {
    const res = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      channelId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items || []) {
      const sn = item.snippet || {};
      playlists.push({
        id: item.id,
        title: sn.title,
        description: sn.description || '',
        publishedAt: sn.publishedAt,
        thumbnails: sn.thumbnails || {},
        thumbnail:
          sn.thumbnails?.maxres?.url ||
          sn.thumbnails?.high?.url ||
          sn.thumbnails?.medium?.url ||
          null,
        videoCount: Number(item.contentDetails?.itemCount || 0),
        syncedAt: new Date().toISOString(),
      });
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return playlists;
}

async function fetchPlaylistVideoIds(playlistId) {
  return listPlaylistItemIds(playlistId, { maxPages: 10 });
}

module.exports = {
  fetchChannel,
  listPlaylistItemIds,
  fetchVideosByIds,
  fetchPlaylists,
  fetchPlaylistVideoIds,
  parseDurationIso8601,
  formatDuration,
  formatCount,
};
