import { NextRequest, NextResponse } from "next/server";
import { getMultiChannelVideos, normaliseYT, HAS_YT } from "@/lib/youtube";

/**
 * Verified comedy creator channels — 14 confirmed active
 * Duration 30s–10 min (genuine skits only)
 */
const CREATORS = [
  { id:"@MarkAngelComedy",   opts:{ minDuration:30, maxDuration:600, maxResults:8, isShort:true } },
  { id:"@brodashaggi",       opts:{ minDuration:30, maxDuration:600, maxResults:8, isShort:true } },
  { id:"@Taaooma",           opts:{ minDuration:30, maxDuration:600, maxResults:6, isShort:true } },
  { id:"@MrFunny",           opts:{ minDuration:30, maxDuration:600, maxResults:6, isShort:true } },
  { id:"@BrainJotter",       opts:{ minDuration:30, maxDuration:600, maxResults:6, isShort:true } },
  { id:"@ZicsalomaOfficial", opts:{ minDuration:30, maxDuration:600, maxResults:5, isShort:true } },
  { id:"@LasisiElenu",       opts:{ minDuration:30, maxDuration:600, maxResults:5, isShort:true } },
  { id:"@MrMacaroni",        opts:{ minDuration:30, maxDuration:600, maxResults:5, isShort:true } },
  { id:"@WoliAgba",          opts:{ minDuration:30, maxDuration:600, maxResults:5, isShort:true } },
  { id:"@Josh2Funny",        opts:{ minDuration:30, maxDuration:600, maxResults:4, isShort:true } },
  { id:"@CuteAbiola",        opts:{ minDuration:30, maxDuration:600, maxResults:4, isShort:true } },
  { id:"@LayiWasabi",        opts:{ minDuration:30, maxDuration:600, maxResults:4, isShort:true } },
  { id:"@SydneyTalker",      opts:{ minDuration:30, maxDuration:600, maxResults:4, isShort:true } },
  { id:"@Maraji",            opts:{ minDuration:30, maxDuration:600, maxResults:4, isShort:true } },
];

export async function GET(req: NextRequest) {
  if (!HAS_YT()) return NextResponse.json({ items:[], hasYT:false });

  const page   = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const target = 30;

  // Rotate channels per page so each page fetch returns different videos
  const offset  = ((page - 1) * 4) % CREATORS.length;
  const rotated = [...CREATORS.slice(offset), ...CREATORS.slice(0, offset)];
  const withPer = rotated.map(ch => ({ ...ch, opts: { ...ch.opts, maxResults: 6 } }));

  const items = await getMultiChannelVideos(withPer, target);

  return NextResponse.json(
    { items: items.map(normaliseYT), hasYT: true, page },
    { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=7200" } }
  );
}
