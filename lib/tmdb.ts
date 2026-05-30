const KEY  = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";
export const IMG = (p: string | null | undefined, s = "w500") =>
  p ? `https://image.tmdb.org/t/p/${s}${p}` : null;
export const HAS_TMDB = () => KEY.length > 4;

const GENRE_MAP: Record<number, string> = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",
  27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Science Fiction",
  53:"Thriller",10752:"War",37:"Western",10759:"Action & Adventure",10765:"Sci-Fi & Fantasy",
};
export const genreName = (id: number) => GENRE_MAP[id] ?? "";

export async function tmdb(path: string, params: Record<string, string> = {}) {
  if (!HAS_TMDB()) return null;
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

export function normalise(x: any) {
  const isTV = x.media_type === "tv" || (!x.title && x.name);
  return {
    id:        x.id as number,
    cvId:      `tmdb:${x.id}`,
    title:     (x.title || x.name || "") as string,
    poster:    IMG(x.poster_path),
    backdrop:  IMG(x.backdrop_path, "w1280"),
    type:      (isTV ? "tv" : "movie") as "tv" | "movie",
    year:      ((x.release_date || x.first_air_date || "").slice(0, 4)) as string,
    rating:    (x.vote_average ?? 0) as number,
    overview:  (x.overview ?? "") as string,
    genres:    ((x.genre_ids ?? []) as number[]).map(genreName).filter(Boolean),
    country:   ((x.origin_country && x.origin_country[0]) ?? "") as string,
    voteCount: (x.vote_count ?? 0) as number,
    isPlayable: false, // populated by watch API check
  };
}
