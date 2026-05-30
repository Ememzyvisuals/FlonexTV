import { NextRequest, NextResponse } from "next/server";
import { tmdb, IMG } from "@/lib/tmdb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params;
  const season  = req.nextUrl.searchParams.get("s") ?? "1";
  const numId   = decodeURIComponent(id).replace("tmdb:", "");
  const data    = await tmdb(`/tv/${numId}/season/${season}`);
  if (!data) return NextResponse.json({ episodes: [] }, { status: 404 });
  return NextResponse.json({
    episodes: (data.episodes ?? []).map((ep: any) => ({
      number:   ep.episode_number,
      name:     ep.name,
      overview: ep.overview,
      runtime:  ep.runtime,
      still:    IMG(ep.still_path, "w300"),
      date:     ep.air_date,
      rating:   ep.vote_average,
    })),
  }, { headers: { "Cache-Control": "s-maxage=3600" } });
}
