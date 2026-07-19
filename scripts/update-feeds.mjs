import { mkdir, writeFile } from 'node:fs/promises';

const DATA_DIR = new URL('../data/', import.meta.url);

const env = {
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  googlePlaceId: process.env.GOOGLE_PLACE_ID,
  instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  instagramUserId: process.env.INSTAGRAM_USER_ID,
  tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || process.env.GOOGLE_PLACES_API_KEY,
  youtubeChannelHandle: process.env.YOUTUBE_CHANNEL_HANDLE || 'succulentdriftwoods'
};

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function dateLabel(timestamp) {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(timestamp));
}

async function writeFeed(name, items) {
  await mkdir(DATA_DIR, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    items
  };
  await writeFile(new URL(`${name}.json`, DATA_DIR), `${JSON.stringify(payload, null, 2)}\n`);
}

async function updateGoogleReviews() {
  if (!env.googlePlacesApiKey || !env.googlePlaceId) {
    console.log('Skipping Google reviews: GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID missing.');
    return;
  }

  const params = new URLSearchParams({
    place_id: env.googlePlaceId,
    fields: 'name,rating,user_ratings_total,reviews,url',
    key: env.googlePlacesApiKey
  });
  const data = await fetchJson(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const reviews = data.result?.reviews || [];
  await writeFeed('google-reviews', reviews.map((review) => ({
    author: review.author_name,
    rating: review.rating,
    text: review.text,
    date: review.time ? new Date(review.time * 1000).toISOString() : '',
    dateLabel: review.relative_time_description,
    url: review.author_url || data.result?.url || ''
  })));
}

async function updateInstagram() {
  if (!env.instagramAccessToken || !env.instagramUserId) {
    console.log('Skipping Instagram: INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID missing.');
    return;
  }

  const params = new URLSearchParams({
    fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
    access_token: env.instagramAccessToken,
    limit: '6'
  });
  const data = await fetchJson(`https://graph.instagram.com/${env.instagramUserId}/media?${params}`);
  await writeFeed('instagram', (data.data || []).map((post) => ({
    platform: 'Instagram',
    title: post.media_type || 'Instagram post',
    text: post.caption || '',
    image: post.thumbnail_url || post.media_url || '',
    date: post.timestamp || '',
    dateLabel: dateLabel(post.timestamp),
    url: post.permalink
  })));
}

async function updateTikTok() {
  if (!env.tiktokAccessToken) {
    console.log('Skipping TikTok: TIKTOK_ACCESS_TOKEN missing.');
    return;
  }

  const data = await fetchJson('https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.tiktokAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ max_count: 6 })
  });
  await writeFeed('tiktok', (data.data?.videos || []).map((video) => ({
    platform: 'TikTok',
    title: video.title || 'TikTok video',
    text: video.title || '',
    image: video.cover_image_url || '',
    date: video.create_time ? new Date(video.create_time * 1000).toISOString() : '',
    dateLabel: video.create_time ? dateLabel(video.create_time * 1000) : '',
    url: video.share_url
  })));
}

async function updateYouTube() {
  if (!env.youtubeApiKey || !env.youtubeChannelHandle) {
    console.log('Skipping YouTube: YOUTUBE_API_KEY or YOUTUBE_CHANNEL_HANDLE missing.');
    return;
  }

  const channelParams = new URLSearchParams({
    part: 'id,snippet',
    forHandle: env.youtubeChannelHandle.replace(/^@/, ''),
    key: env.youtubeApiKey
  });
  const channelData = await fetchJson(`https://www.googleapis.com/youtube/v3/channels?${channelParams}`);
  const channelId = channelData.items?.[0]?.id;
  if (!channelId) {
    console.log(`Skipping YouTube: no channel found for ${env.youtubeChannelHandle}.`);
    return;
  }

  const videoParams = new URLSearchParams({
    part: 'snippet',
    channelId,
    maxResults: '6',
    order: 'date',
    type: 'video',
    key: env.youtubeApiKey
  });
  const data = await fetchJson(`https://www.googleapis.com/youtube/v3/search?${videoParams}`);
  await writeFeed('youtube', (data.items || []).map((video) => ({
    platform: 'YouTube',
    title: video.snippet?.title || 'YouTube video',
    text: video.snippet?.description || '',
    image: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || '',
    date: video.snippet?.publishedAt || '',
    dateLabel: dateLabel(video.snippet?.publishedAt),
    url: video.id?.videoId ? `https://www.youtube.com/watch?v=${video.id.videoId}` : `https://www.youtube.com/@${env.youtubeChannelHandle.replace(/^@/, '')}`
  })));
}

await updateGoogleReviews();
await updateInstagram();
await updateTikTok();
await updateYouTube();
