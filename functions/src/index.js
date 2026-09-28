const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { syncChannelArchive } = require('./sync');

admin.initializeApp();

const youtubeApiKey = defineSecret('YOUTUBE_API_KEY');
const syncToken = defineSecret('SYNC_TOKEN');
const youtubeChannelId = defineString('YOUTUBE_CHANNEL_ID');

function runSync() {
  process.env.YOUTUBE_API_KEY = youtubeApiKey.value();
  return syncChannelArchive({ channelId: youtubeChannelId.value() });
}

/**
 * Scheduled sync — every 6 hours.
 * Quota-aware: list calls are cheap (1 unit); avoid search.list in cron.
 */
exports.syncYouTubeArchive = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'Asia/Kolkata',
    secrets: [youtubeApiKey],
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const result = await runSync();
    console.log('YouTube sync complete', result);
  }
);

/**
 * Manual trigger for first sync / debugging.
 * Call with header `x-sync-token: <SYNC_TOKEN secret>`.
 */
exports.syncYouTubeNow = onRequest(
  {
    secrets: [youtubeApiKey, syncToken],
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async (req, res) => {
    if (req.get('x-sync-token') !== syncToken.value()) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    try {
      const result = await runSync();
      res.json({ ok: true, result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: String(err.message || err) });
    }
  }
);
