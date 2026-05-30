import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb";
import { getArchiveStream, matchTmdbToArchive, getArchiveDownloads } from "@/lib/archive";
import { getYouTubeVideo } from "@/lib/youtube";

/**
 * GET /api/watch/[id]
 *
 * Sources (in priority order):
 *  youtube:{videoId} → YouTube iframe embed (legal, embeddable)
 *  archive:{id}      → Internet Archive direct MP4 (public domain)
 *  tmdb:{id}         → Try Archive match → fallback message
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = decodeURIComponent(id);

  // ── YouTube embeddable video ─────────────────────────────────────────
  if (raw.startsWith("youtube:")) {
    const videoId = raw.slice(8);
    const video   = await getYouTubeVideo(videoId);

    if (!video) {
      return NextResponse.json({
        success: false,
        message: "This YouTube video is not embeddable or was not found.",
      });
    }

    return NextResponse.json({
      success:    true,
      embedUrl:   video.embedUrl,
      watchUrl:   video.watchUrl,
      title:      video.title,
      channel:    video.channel,
      thumbnail:  video.thumbnail,
      source:     "youtube",
      isYouTube:  true,
    }, { headers: { "Cache-Control": "s-maxage=7200" } });
  }

  // ── Direct Archive.org item ──────────────────────────────────────────
  if (raw.startsWith("archive:")) {
    const identifier = raw.slice(8);
    const item = await getArchiveStream(identifier);

    if (!item || !item.isPlayable) {
      return NextResponse.json({
        success: false,
        message: "No playable file found in this Archive item.",
      });
    }

    const downloads = await getArchiveDownloads(identifier);

    return NextResponse.json({
      success:     true,
      streamUrl:   item.streamUrl,
      downloadUrl: item.downloadUrl,
      fileSize:    item.fileSize,
      source:      "archive.org",
      title:       item.title,
      year:        item.year,
      thumbnail:   item.thumbnail,
      downloads,   // all available quality options
      isArchive:   true,
    }, { headers: { "Cache-Control": "s-maxage=3600" } });
  }

  // ── TMDB item — try to find Archive.org match ────────────────────────
  const numId = raw.replace("tmdb:", "");

  // Get movie title + year from TMDB
  let title = "";
  let year  = "";

  const [movieRes, tvRes] = await Promise.allSettled([
    tmdb(`/movie/${numId}`),
    tmdb(`/tv/${numId}`),
  ]);

  if (movieRes.status === "fulfilled" && movieRes.value?.id) {
    title = movieRes.value.title ?? "";
    year  = (movieRes.value.release_date ?? "").slice(0, 4);
  } else if (tvRes.status === "fulfilled" && tvRes.value?.id) {
    title = tvRes.value.name ?? "";
    year  = (tvRes.value.first_air_date ?? "").slice(0, 4);
  }

  if (!title) {
    return NextResponse.json({
      success: false,
      message: "Could not find this title in our database.",
    });
  }

  // Try to match to Archive.org public domain version
  const archiveMatch = await matchTmdbToArchive(title, year);

  if (!archiveMatch) {
    return NextResponse.json({
      success:  false,
      message:  `"${title}" is not available yet — we're expanding our library with public domain films.`,
      title,
      year,
    });
  }

  const downloads = await getArchiveDownloads(archiveMatch.identifier);

  return NextResponse.json({
    success:     true,
    streamUrl:   archiveMatch.streamUrl,
    downloadUrl: archiveMatch.downloadUrl,
    fileSize:    archiveMatch.fileSize,
    source:      "archive.org",
    title:       archiveMatch.title,
    year:        archiveMatch.year,
    thumbnail:   archiveMatch.thumbnail,
    archiveId:   archiveMatch.identifier,
    downloads,
    isArchive:   true,
  }, { headers: { "Cache-Control": "s-maxage=3600" } });
}
