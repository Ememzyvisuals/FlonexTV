import { NextRequest, NextResponse } from "next/server";
import { getMultiChannelVideos, normaliseYT, HAS_YT } from "@/lib/youtube";

// Same channel map as home-data — single source of truth for infinite loading
const MOVIE = (n:number) => ({ minDuration: 1200, maxResults: n });
const FAITH = (n:number) => ({ ...MOVIE(n), isFaith: true });
const YOR   = (n:number) => ({ ...MOVIE(n), isYoruba: true });
const SKT   = (n:number) => ({ minDuration: 30, maxDuration: 600, maxResults: n, isShort: true });

const CHANNEL_MAP: Record<string, Array<{id:string; opts?:any}>> = {
  nollywood: [
    {id:"@UchennaMbunaboTV"},{id:"@RuthKadiri247"},{id:"@BimboAdemoyeTV"},
    {id:"@UcheMontanaTV"},{id:"@MercyJohnsonOkojieTV"},{id:"@mauricesamtv"},
    {id:"@UduakIsongTV"},{id:"@BolajiOgunmolaTV"},{id:"@SoniaUcheTV"},
    {id:"@OmoniOboliTV"},{id:"@RoyalArtsTV"},{id:"@EbonyLifeTV"},
    {id:"@iROKOtv"},{id:"@RealNollyTV"},{id:"@NollywoodPicturesTV"},{id:"@UcheJomboTV"},
  ],
  yoruba: [
    {id:"@ApataTv",opts:YOR(12)},{id:"@apatatvplus",opts:YOR(12)},
    {id:"@Yorubahood",opts:YOR(12)},{id:"@YorubaPremium",opts:YOR(10)},
    {id:"@OdunladeAdekola",opts:YOR(10)},{id:"@OkikiPremiumTV",opts:YOR(10)},
    {id:"@AdunEre",opts:YOR(8)},{id:"@IbakaTV",opts:YOR(8)},
  ],
  christian: [
    {id:"@DamilolaMikeBamiloye",opts:FAITH(12)},{id:"@MountZionFilms",opts:FAITH(10)},
    {id:"@LivingWordChannel",opts:FAITH(10)},{id:"@PremFilms",opts:FAITH(8)},
    {id:"@FejosbabaTv",opts:FAITH(8)},{id:"@GloriaBamiloye",opts:FAITH(6)},
    {id:"@HouseholdTV",opts:FAITH(6)},
  ],
  hollywood: [
    {id:"@FilmRiseMovies",opts:MOVIE(10)},{id:"@MovieCentral",opts:MOVIE(10)},
    {id:"@ParamountVault",opts:MOVIE(8)},
  ],
  bollywood: [
    {id:"@Rajshri",opts:MOVIE(10)},{id:"@shemaroomovies",opts:MOVIE(10)},
    {id:"@goldminesbollywood",opts:MOVIE(10)},
  ],
  korean: [
    {id:"@kbsworld",opts:MOVIE(10)},{id:"@SBSWORLD",opts:MOVIE(10)},
    {id:"@MBCDrama",opts:MOVIE(8)},{id:"@KoreanFilmArchive",opts:MOVIE(8)},
  ],
  comedy: [
    {id:"@MarkAngelComedy",opts:SKT(8)},{id:"@brodashaggi",opts:SKT(8)},
    {id:"@Taaooma",opts:SKT(6)},{id:"@MrFunny",opts:SKT(6)},
    {id:"@BrainJotter",opts:SKT(6)},{id:"@ZicsalomaOfficial",opts:SKT(5)},
    {id:"@LasisiElenu",opts:SKT(5)},{id:"@MrMacaroni",opts:SKT(5)},
    {id:"@WoliAgba",opts:SKT(5)},{id:"@Josh2Funny",opts:SKT(4)},
    {id:"@CuteAbiola",opts:SKT(4)},{id:"@LayiWasabi",opts:SKT(4)},
    {id:"@SydneyTalker",opts:SKT(4)},{id:"@Maraji",opts:SKT(4)},
  ],
};

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "nollywood";
  const page     = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const max      = Math.min(40, Number(req.nextUrl.searchParams.get("max") ?? "20"));

  if (!HAS_YT()) return NextResponse.json({ items:[], hasYT:false });

  const list = CHANNEL_MAP[category] ?? CHANNEL_MAP.nollywood;
  const perCh = Math.ceil(max / list.length) + 3;

  // Rotate start index per page for variety without re-fetching same videos
  const offset  = ((page - 1) * 3) % list.length;
  const rotated = [...list.slice(offset), ...list.slice(0, offset)];

  const withOpts = rotated.map(ch => ({
    id:   ch.id,
    opts: ch.opts
      ? { ...ch.opts, maxResults: perCh }
      : (category === "comedy"
          ? SKT(perCh)
          : MOVIE(perCh)),
  }));

  const items = await getMultiChannelVideos(withOpts, max);
  return NextResponse.json(
    { items: items.map(normaliseYT), hasYT: true, category, page },
    { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } }
  );
}
