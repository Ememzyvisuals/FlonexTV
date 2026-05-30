/**
 * lib/archive.ts — Internet Archive (archive.org) Utility
 *
 * All content from Archive.org is legally in the public domain.
 * No scraping, no iframe embeds — direct MP4 URLs served via
 * archive.org's own CDN.
 *
 * API reference:
 *   Search:   https://archive.org/advancedsearch.php
 *   Metadata: https://archive.org/metadata/{identifier}
 *   Files:    https://archive.org/download/{identifier}/{filename}
 */

const IA_SEARCH   = "https://archive.org/advancedsearch.php";
const IA_METADATA = "https://archive.org/metadata";
const IA_DOWNLOAD = "https://archive.org/download";
const IA_THUMB    = "https://archive.org/services/img";

export interface ArchiveItem {
  identifier:   string;
  title:        string;
  year:         string;
  description:  string;
  thumbnail:    string;
  streamUrl:    string;       // direct MP4 URL
  downloadUrl:  string;       // same — public domain = always downloadable
  fileSize:     string;
  isPlayable:   boolean;
}

export interface ArchiveFile {
  name:   string;
  format: string;
  size?:  string;
  source?: string;
  length?: string;
}

/** Pick the best playable video file from an Archive item's file list */
function pickBestFile(files: ArchiveFile[]): ArchiveFile | null {
  const VIDEO_FORMATS = [
    "h.264",    // MPEG-4 H.264 — best compatibility
    "mpeg4",
    "mp4",
    "512kb mpeg4",
    "cinepack",
    "ogvideo",
    "divx",
  ];

  const VIDEO_EXTS = [".mp4", ".m4v", ".ogv", ".mpeg", ".mpg", ".avi"];

  // Filter to video files
  const videos = files.filter(f => {
    const name = f.name.toLowerCase();
    const fmt  = (f.format || "").toLowerCase();
    return VIDEO_EXTS.some(ext => name.endsWith(ext)) ||
           VIDEO_FORMATS.some(fmt2 => fmt.includes(fmt2));
  });

  if (!videos.length) return null;

  // Prefer derived (re-encoded for web) over originals
  const derived = videos.filter(f => f.source === "derivative");
  const pool    = derived.length ? derived : videos;

  // Sort: prefer H.264/MP4, then by size (larger = better quality)
  return pool.sort((a, b) => {
    const aIsMp4 = a.name.toLowerCase().endsWith(".mp4") ? 1 : 0;
    const bIsMp4 = b.name.toLowerCase().endsWith(".mp4") ? 1 : 0;
    if (aIsMp4 !== bIsMp4) return bIsMp4 - aIsMp4;
    return Number(b.size ?? 0) - Number(a.size ?? 0);
  })[0];
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1_048_576)     return `${(bytes / 1_024).toFixed(0)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

function descToString(d: string | string[] | undefined): string {
  if (!d) return "";
  return Array.isArray(d) ? d.join(" ").slice(0, 600) : d.slice(0, 600);
}

/**
 * Search the Internet Archive for public domain movies.
 *
 * @param query  — search term (movie title or general query)
 * @param rows   — number of results to fetch (max 20)
 */
export async function searchArchive(query: string, rows = 10): Promise<ArchiveItem[]> {
  try {
    const params = new URLSearchParams({
      q:      `(${encodeURIComponent(query)}) AND mediatype:movies`,
      fl:     "identifier,title,year,description,avg_rating",
      sort:   "downloads desc",
      output: "json",
      rows:   String(rows),
      start:  "0",
    });

    const res = await fetch(`${IA_SEARCH}?${params}`, {
      signal: AbortSignal.timeout(8000),
      next:   { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json() as {
      response: { docs: any[]; numFound: number };
    };

    const docs = data.response?.docs ?? [];

    // Fetch metadata in parallel to check for playable files
    const items = await Promise.allSettled(
      docs.map(doc => getArchiveStream(doc.identifier))
    );

    return items
      .map((r, i) => {
        if (r.status !== "fulfilled" || !r.value) return null;
        const doc = docs[i];
        return {
          ...r.value,
          title:       doc.title       || r.value.title,
          year:        String(doc.year ?? r.value.year),
          description: descToString(doc.description) || r.value.description,
        };
      })
      .filter((item): item is ArchiveItem => item !== null && item.isPlayable);
  } catch {
    return [];
  }
}

/**
 * Get stream URL for a specific Archive identifier.
 * Returns null if no playable file is found.
 */
export async function getArchiveStream(identifier: string): Promise<ArchiveItem | null> {
  try {
    const res = await fetch(`${IA_METADATA}/${identifier}`, {
      signal: AbortSignal.timeout(8000),
      next:   { revalidate: 7200 },
    });
    if (!res.ok) return null;

    const data  = await res.json() as { metadata: any; files: ArchiveFile[] };
    const meta  = data.metadata ?? {};
    const files = data.files   ?? [];
    const best  = pickBestFile(files);

    if (!best) return null;

    const streamUrl = `${IA_DOWNLOAD}/${identifier}/${encodeURIComponent(best.name)}`;

    return {
      identifier,
      title:       meta.title       || identifier,
      year:        String(meta.year  ?? ""),
      description: descToString(meta.description),
      thumbnail:   `${IA_THUMB}/${identifier}`,
      streamUrl,
      downloadUrl: streamUrl,
      fileSize:    formatBytes(Number(best.size ?? 0)),
      isPlayable:  true,
    };
  } catch {
    return null;
  }
}

/**
 * Try to match a TMDB title to an Archive.org item.
 * Used when user clicks "Play" on a TMDB movie.
 *
 * Matching strategy:
 *  1. Exact title match (case-insensitive)
 *  2. Partial match — Archive title contains TMDB title
 *  3. TMDB title contains Archive title (short title match)
 *
 * Returns null if no suitable match found.
 */
export async function matchTmdbToArchive(
  title: string,
  year?: string
): Promise<ArchiveItem | null> {
  if (!title) return null;

  // Normalise: lowercase, remove punctuation
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

  const needle = normalise(title);

  try {
    // Search with year hint for better precision
    const query = year ? `${title} ${year}` : title;
    const results = await searchArchive(query, 8);

    if (!results.length) return null;

    // Look for exact match first
    const exact = results.find(
      item => normalise(item.title) === needle
    );
    if (exact) return exact;

    // Year-aware match: title match + year within 2 years
    if (year) {
      const yearNum = parseInt(year, 10);
      const yearMatch = results.find(item => {
        const titleMatch = normalise(item.title).includes(needle) ||
                           needle.includes(normalise(item.title));
        const itemYear  = parseInt(item.year, 10);
        return titleMatch && !isNaN(itemYear) && Math.abs(itemYear - yearNum) <= 2;
      });
      if (yearMatch) return yearMatch;
    }

    // Partial match — title contained in either direction
    const partial = results.find(item => {
      const archiveNorm = normalise(item.title);
      return archiveNorm.includes(needle) || needle.includes(archiveNorm);
    });

    return partial ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all download qualities for an Archive item.
 * Public domain = always freely downloadable.
 */
export async function getArchiveDownloads(
  identifier: string
): Promise<Array<{ name: string; url: string; size: string; format: string }>> {
  try {
    const res = await fetch(`${IA_METADATA}/${identifier}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];

    const data  = await res.json() as { files: ArchiveFile[] };
    const files = data.files ?? [];

    return files
      .filter(f => f.name.toLowerCase().match(/\.(mp4|ogv|mpeg|avi|m4v)$/) &&
                   f.source === "derivative")
      .slice(0, 5)
      .map(f => ({
        name:   f.name,
        url:    `${IA_DOWNLOAD}/${identifier}/${encodeURIComponent(f.name)}`,
        size:   formatBytes(Number(f.size ?? 0)),
        format: f.name.split(".").pop()?.toUpperCase() ?? "MP4",
      }));
  } catch {
    return [];
  }
}
