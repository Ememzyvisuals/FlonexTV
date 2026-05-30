import { NextRequest, NextResponse } from "next/server";
import { tmdb, normalise } from "@/lib/tmdb";
import { searchArchive } from "@/lib/archive";
import { searchYouTube, normaliseYT, HAS_YT } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get("q") ?? "";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  if (!q.trim()) return NextResponse.json({ results: [], total: 0 });

  // Fetch TMDB + Archive + YouTube in parallel
  const [tmdbData, archiveItems, ytItems] = await Promise.allSettled([
    tmdb("/search/multi", { query: q, page }),
    searchArchive(q, 6),
    HAS_YT() ? searchYouTube(q + " full movie", 4) : Promise.resolve([]),
  ]);

  // TMDB results
  const tmdbResults = tmdbData.status === "fulfilled"
    ? (tmdbData.value?.results ?? [])
        .filter((x: any) => x.media_type !== "person" && x.poster_path)
        .map((x: any) => ({ ...normalise(x), isPlayable: false }))
    : [];

  // Archive results — always playable (direct MP4)
  const archiveResults = archiveItems.status === "fulfilled"
    ? archiveItems.value.map(item => ({
        id:          item.identifier,
        cvId:        `archive:${item.identifier}`,
        title:       item.title,
        poster:      item.thumbnail,
        backdrop:    item.thumbnail,
        type:        "movie" as const,
        year:        item.year,
        rating:      0,
        overview:    item.description,
        genres:      ["Public Domain"],
        country:     "",
        voteCount:   0,
        isPlayable:  true,
        isArchive:   true,
        streamUrl:   item.streamUrl,
        downloadUrl: item.downloadUrl,
        fileSize:    item.fileSize,
      }))
    : [];

  // YouTube results — embeddable, isPlayable true
  const youtubeResults = ytItems.status === "fulfilled" && ytItems.value.length > 0
    ? ytItems.value.map(normaliseYT)
    : [];

  const results = [...tmdbResults, ...archiveResults, ...youtubeResults];

  return NextResponse.json({
    results,
    total: tmdbData.status === "fulfilled" ? (tmdbData.value?.total_results ?? 0) : 0,
  }, { headers: { "Cache-Control": "s-maxage=300" } });
}
