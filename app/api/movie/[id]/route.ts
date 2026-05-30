import { NextRequest, NextResponse } from "next/server";
import { tmdb, IMG } from "@/lib/tmdb";
import { getArchiveStream, getArchiveDownloads, matchTmdbToArchive } from "@/lib/archive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = decodeURIComponent(id);

  // Archive item
  if (raw.startsWith("archive:")) {
    const identifier = raw.slice(8);
    const [item, downloads] = await Promise.all([
      getArchiveStream(identifier),
      getArchiveDownloads(identifier),
    ]);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id:          identifier,
      cvId:        `archive:${identifier}`,
      title:       item.title,
      overview:    item.description,
      poster:      item.thumbnail,
      backdrop:    item.thumbnail,
      type:        "movie",
      year:        item.year,
      rating:      0,
      genres:      ["Public Domain"],
      cast:        [],
      crew:        [],
      trailerKey:  null,
      similar:     [],
      streamUrl:   item.streamUrl,
      downloadUrl: item.downloadUrl,
      downloads,
      isPlayable:  true,
      isArchive:   true,
    });
  }

  // TMDB item
  const numId = raw.replace("tmdb:", "");
  let detail: any = null;
  let isTV = false;

  const [mRes, tvRes] = await Promise.allSettled([
    tmdb(`/movie/${numId}`, { append_to_response: "credits,videos,similar" }),
    tmdb(`/tv/${numId}`,    { append_to_response: "credits,videos,similar" }),
  ]);

  if (mRes.status === "fulfilled" && mRes.value?.id)  { detail = mRes.value; }
  else if (tvRes.status === "fulfilled" && tvRes.value?.id) { detail = tvRes.value; isTV = true; }

  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const title = detail.title || detail.name || "";
  const year  = (detail.release_date || detail.first_air_date || "").slice(0, 4);

  // Check if Archive match exists
  const archiveMatch = await matchTmdbToArchive(title, year);

  const cast = (detail.credits?.cast ?? []).slice(0, 20).map((c: any) => ({
    id: c.id, name: c.name, character: c.character, photo: IMG(c.profile_path, "w185"),
  }));
  const crew = (detail.credits?.crew ?? [])
    .filter((c: any) => ["Director","Writer","Creator","Executive Producer"].includes(c.job))
    .slice(0, 6)
    .map((c: any) => ({ id: c.id, name: c.name, job: c.job, photo: IMG(c.profile_path, "w185") }));

  const trailer = (detail.videos?.results ?? [])
    .filter((v: any) => v.type === "Trailer" && v.site === "YouTube")
    .sort((a: any, b: any) => (b.official ? 1 : 0) - (a.official ? 1 : 0))[0];

  const similar = (detail.similar?.results ?? [])
    .filter((x: any) => x.poster_path).slice(0, 18)
    .map((x: any) => ({
      id: x.id, cvId: `tmdb:${x.id}`, title: x.title || x.name,
      poster: IMG(x.poster_path), type: isTV ? "tv" : "movie",
      year: (x.release_date || x.first_air_date || "").slice(0, 4),
      rating: x.vote_average ?? 0, isPlayable: false,
    }));

  const seasons = isTV ? (detail.seasons ?? []).filter((s: any) => s.season_number > 0) : [];

  return NextResponse.json({
    id:              detail.id,
    cvId:            `tmdb:${detail.id}`,
    title,
    tagline:         detail.tagline,
    overview:        detail.overview,
    poster:          IMG(detail.poster_path),
    backdrop:        IMG(detail.backdrop_path, "w1280"),
    type:            isTV ? "tv" : "movie",
    year,
    rating:          detail.vote_average,
    voteCount:       detail.vote_count,
    runtime:         detail.runtime,
    status:          detail.status,
    genres:          (detail.genres ?? []).map((g: any) => g.name),
    country:         detail.origin_country?.[0] || detail.production_countries?.[0]?.iso_3166_1 || "",
    language:        detail.original_language,
    cast, crew,
    trailerKey:      trailer?.key ?? null,
    similar,
    seasons:         seasons.map((s: any) => ({
      number: s.season_number, name: s.name, episodes: s.episode_count, poster: IMG(s.poster_path),
    })),
    numberOfSeasons:  detail.number_of_seasons  ?? 0,
    numberOfEpisodes: detail.number_of_episodes ?? 0,
    isPlayable:       !!archiveMatch,
    archiveMatch:     archiveMatch ? {
      identifier:  archiveMatch.identifier,
      streamUrl:   archiveMatch.streamUrl,
      downloadUrl: archiveMatch.downloadUrl,
      title:       archiveMatch.title,
    } : null,
  }, { headers: { "Cache-Control": "s-maxage=3600" } });
}
