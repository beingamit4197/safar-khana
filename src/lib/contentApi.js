import { getDb, isFirestoreEnabled } from './firebase';
import { formatCount, monthYear, timeAgo } from './format';
import * as mock from '../data/mock';
import youtubeArchive from '../data/youtubeArchive.json';

const TAGLINE = 'Explore · Travel · Food · Stories';

function pickThumb(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    null
  );
}

function bannerUrl(raw) {
  const base = raw.bannerUrl || raw.banner;
  if (!base) return mock.CHANNEL.banner;
  // bannerExternalUrl is a base path; append a simple size token (avoid comma crop params)
  if (base.includes('googleusercontent.com') && !/[=]w\d+/.test(base)) {
    return `${base}=w2560`;
  }
  return base;
}

function avatarUrl(raw) {
  return (
    raw.avatar ||
    pickThumb(raw.thumbnails) ||
    mock.CHANNEL.avatar
  );
}

function normalizeChannel(raw) {
  const youtubeUrl = raw.customUrl
    ? `https://www.youtube.com/${String(raw.customUrl).startsWith('@') ? raw.customUrl : '@' + raw.customUrl.replace(/^@/, '')}`
    : raw.id
      ? `https://www.youtube.com/channel/${raw.id}`
      : mock.CHANNEL.youtubeUrl;

  const handle = raw.customUrl
    ? String(raw.customUrl).startsWith('@')
      ? raw.customUrl
      : `@${raw.customUrl}`
    : raw.handle || '';

  return {
    id: raw.id,
    name: (raw.title || raw.name || mock.CHANNEL.name).toUpperCase(),
    handle,
    tagline: TAGLINE,
    description: raw.description || '',
    about: raw.description || raw.about || '',
    subscribers:
      raw.subscribers || formatCount(raw.subscriberCount) || mock.CHANNEL.subscribers,
    views: raw.views || formatCount(raw.viewCount) || mock.CHANNEL.views,
    videoCount: String(raw.videoCount ?? mock.CHANNEL.videoCount),
    joined: raw.joined
      ? raw.joined
      : raw.publishedAt
        ? `Joined ${monthYear(raw.publishedAt)}`
        : '',
    youtubeUrl,
    avatar: avatarUrl(raw),
    banner: bannerUrl(raw),
    source: 'youtube',
  };
}

function normalizeVideo(raw, source) {
  return {
    ...raw,
    thumbnail: raw.thumbnail || pickThumb(raw.thumbnails),
    views: raw.views || formatCount(raw.viewCount),
    published: raw.publishedAt ? timeAgo(raw.publishedAt) : raw.published || '',
    tags: raw.tags || [],
    categories: raw.categories || [],
    source,
  };
}

function normalizePlaylist(raw) {
  return {
    ...raw,
    thumbnail: raw.thumbnail || pickThumb(raw.thumbnails),
    videoIds: raw.videoIds || [],
    videoCount: raw.videoCount || (raw.videoIds || []).length,
    updated: raw.updated || (raw.publishedAt ? `Since ${monthYear(raw.publishedAt)}` : ''),
  };
}

function dumpArchive() {
  if (!youtubeArchive?.channel || !Array.isArray(youtubeArchive.videos)) {
    return null;
  }
  return {
    channel: normalizeChannel(youtubeArchive.channel),
    videos: youtubeArchive.videos.map((v) => normalizeVideo(v, 'youtube')),
    playlists: (youtubeArchive.playlists || []).map(normalizePlaylist),
    categories: youtubeArchive.categories || mock.CATEGORIES,
  };
}

function mockArchive() {
  return {
    channel: { ...mock.CHANNEL, source: 'mock' },
    videos: mock.VIDEOS.map((v) => normalizeVideo(v, 'mock')),
    playlists: mock.PLAYLISTS,
    categories: mock.CATEGORIES,
  };
}

export async function loadArchive() {
  if (isFirestoreEnabled) {
    const { db, firestore } = await getDb();
    const { collection, doc, getDoc, getDocs, limit, orderBy, query } = firestore;

    const [channelSnap, videoSnap, playlistSnap] = await Promise.all([
      getDoc(doc(db, 'channel', 'main')),
      getDocs(
        query(collection(db, 'videos'), orderBy('publishedAt', 'desc'), limit(500))
      ),
      getDocs(collection(db, 'playlists')),
    ]);

    if (!channelSnap.exists()) {
      throw new Error('Firestore is empty — run the YouTube sync first.');
    }

    return {
      channel: normalizeChannel(channelSnap.data()),
      videos: videoSnap.docs.map((d) => normalizeVideo(d.data(), 'youtube')),
      playlists: playlistSnap.docs
        .map((d) => normalizePlaylist(d.data()))
        .filter((p) => p.videoCount > 0),
      categories: mock.CATEGORIES,
    };
  }

  return dumpArchive() || mockArchive();
}

export { isFirestoreEnabled, mockArchive, dumpArchive };
