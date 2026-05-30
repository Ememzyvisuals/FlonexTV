/**
 * lib/youtube.ts — YouTube Data API v3
 * Channel-based fetching ONLY — no keyword search.
 * Architecture: resolveChannelId → getChannelUploads → filter by duration/title
 */

const YT_KEY = process.env.YOUTUBE_API_KEY ?? "";
const YT_API = "https://www.googleapis.com/youtube/v3";

export const HAS_YT = () => YT_KEY.length > 8;

export interface YouTubeItem {
  videoId:   string; title: string; channel: string;
  thumbnail: string; published: string; duration: number;
  embedUrl:  string; watchUrl: string; isPlayable: true;
  source: "youtube"; type: "movie"; isYouTube: true;
  isShort?: boolean; isFaith?: boolean; isYoruba?: boolean;
}

export type FetchOpts = {
  minDuration?: number; maxDuration?: number; maxResults?: number;
  isShort?: boolean; isFaith?: boolean; isYoruba?: boolean;
};

// Title quality gate — reject non-content videos
const REJECT = ["subscribe","reaction","reacts","live stream","livestream","live show",
  "behind the scene","making of","bloopers","announcement","#shorts","short #",
  "trailer","teaser","preview","unboxing","review","challenge","highlight",
  "compilation","best of","try not to laugh","subscribe now"];
function isClean(title: string): boolean {
  const l = title.toLowerCase();
  return !REJECT.some(k => l.includes(k));
}

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1]||"0")*3600) + (parseInt(m[2]||"0")*60) + parseInt(m[3]||"0");
}

// In-memory channel ID cache — resolves handles once per process lifetime
const CACHE: Record<string,string> = {};

export async function resolveChannelId(h: string): Promise<string|null> {
  if (/^UC[\w-]{22}$/.test(h)) return h;
  if (CACHE[h]) return CACHE[h];
  if (!HAS_YT()) return null;
  try {
    const res = await fetch(
      `${YT_API}/channels?part=id&forHandle=${encodeURIComponent(h.replace(/^@/,""))}&key=${YT_KEY}`,
      { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const id = data.items?.[0]?.id ?? null;
    if (id) CACHE[h] = id;
    return id;
  } catch { return null; }
}

export async function getChannelVideos(
  handle: string, opts: FetchOpts = {}
): Promise<YouTubeItem[]> {
  if (!HAS_YT()) return [];
  const { minDuration=0, maxDuration=Infinity, maxResults=10,
          isShort=false, isFaith=false, isYoruba=false } = opts;

  const channelId = await resolveChannelId(handle);
  if (!channelId) return [];

  const uploadsId = "UU" + channelId.slice(2);
  try {
    // Fetch latest 30 from uploads playlist
    const plRes = await fetch(
      `${YT_API}/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=30&key=${YT_KEY}`,
      { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
    );
    if (!plRes.ok) return [];
    const plData = await plRes.json();
    const ids = (plData.items ?? [])
      .map((i: any) => i.snippet?.resourceId?.videoId).filter(Boolean).join(",");
    if (!ids) return [];

    // Fetch video details for duration + embeddability
    const vRes = await fetch(
      `${YT_API}/videos?part=contentDetails,status,snippet&id=${ids}&key=${YT_KEY}`,
      { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } }
    );
    if (!vRes.ok) return [];
    const vData = await vRes.json();
    const results: YouTubeItem[] = [];

    for (const v of (vData.items ?? [])) {
      if (results.length >= maxResults) break;
      if (v.status?.embeddable === false) continue;
      if (!["public","unlisted"].includes(v.status?.privacyStatus??"")) continue;
      const title = v.snippet?.title ?? "";
      const dur   = parseDuration(v.contentDetails?.duration ?? "");
      if (dur < minDuration || dur > maxDuration) continue;
      if (!isClean(title)) continue;
      results.push({
        videoId:   v.id,
        title,
        channel:   v.snippet?.channelTitle ?? "",
        thumbnail: v.snippet?.thumbnails?.high?.url
                ?? `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
        published: (v.snippet?.publishedAt ?? "").slice(0, 4),
        duration:  dur,
        embedUrl:  `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&fs=1`,
        watchUrl:  `https://www.youtube.com/watch?v=${v.id}`,
        isPlayable: true, source:"youtube", type:"movie",
        isYouTube: true, isShort, isFaith, isYoruba,
      });
    }
    return results;
  } catch (e) {
    console.error(`[YT] getChannelVideos(${handle}):`, e);
    return [];
  }
}

export async function getMultiChannelVideos(
  channels: Array<{id: string; opts?: FetchOpts}>,
  totalMax = 20
): Promise<YouTubeItem[]> {
  if (!HAS_YT()) return [];
  const batches = await Promise.allSettled(
    channels.map(({id, opts}) => getChannelVideos(id, opts))
  );
  const seen = new Set<string>();
  const items: YouTubeItem[] = [];
  for (const b of batches) {
    if (b.status !== "fulfilled") continue;
    for (const item of b.value) {
      if (!seen.has(item.videoId)) { seen.add(item.videoId); items.push(item); }
    }
  }
  return items.sort(() => Math.random() - 0.5).slice(0, totalMax);
}

export function normaliseYT(item: YouTubeItem) {
  return {
    id: `yt_${item.videoId}`, cvId: `youtube:${item.videoId}`,
    title: item.title, poster: item.thumbnail, backdrop: item.thumbnail,
    type: "movie" as const, year: item.published, rating: 0,
    overview: `YouTube · ${item.channel}`, genres: ["YouTube"],
    country: "", voteCount: 0, isPlayable: true as const,
    isYouTube: true, embedUrl: item.embedUrl, watchUrl: item.watchUrl,
    channel: item.channel, isShort: item.isShort, isFaith: item.isFaith,
    isYoruba: item.isYoruba, source: "youtube" as const,
  };
}

// Kept for backward compat — search now returns empty
export async function searchYouTube(_q: string, _n=12, _opts={}): Promise<YouTubeItem[]> {
  return [];
}

export async function getYouTubeVideo(videoId: string): Promise<YouTubeItem|null> {
  if (!HAS_YT() || !videoId) return null;
  try {
    const r = await fetch(
      `${YT_API}/videos?part=snippet,status,contentDetails&id=${videoId}&key=${YT_KEY}`,
      { signal: AbortSignal.timeout(6000), next: { revalidate: 7200 } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    const v = data.items?.[0];
    if (!v || v.status?.embeddable === false) return null;
    return {
      videoId, title: v.snippet?.title??"", channel: v.snippet?.channelTitle??"",
      thumbnail: v.snippet?.thumbnails?.high?.url??`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      published: (v.snippet?.publishedAt??"").slice(0,4),
      duration: parseDuration(v.contentDetails?.duration??""),
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      isPlayable: true, source: "youtube", type: "movie", isYouTube: true,
    };
  } catch { return null; }
}
