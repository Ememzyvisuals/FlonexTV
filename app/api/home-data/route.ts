import { NextRequest, NextResponse } from "next/server";
import { tmdb, normalise } from "@/lib/tmdb";
import { getMultiChannelVideos, normaliseYT, HAS_YT } from "@/lib/youtube";

/**
 * ════════════════════════════════════════════════════════════════
 * VERIFIED CHANNEL DIRECTORY — April 2026
 * All handles researched and confirmed active
 * ════════════════════════════════════════════════════════════════
 *
 * NOLLYWOOD (16 channels):
 *  @UchennaMbunaboTV @RuthKadiri247 @BimboAdemoyeTV @UcheMontanaTV
 *  @MercyJohnsonOkojieTV @mauricesamtv @UduakIsongTV @BolajiOgunmolaTV
 *  @SoniaUcheTV @OmoniOboliTV @RoyalArtsTV @EbonyLifeTV
 *  @iROKOtv @RealNollyTV @NollywoodPicturesTV @UcheJomboTV
 *
 * YORUBA (8 channels — expanded):
 *  @ApataTv          — Original Apata TV. Uploads 15+ movies/week.
 *  @apatatvplus      — ApataTV+. 317K IG, very active 2024-2025.
 *  @Yorubahood       — 83M+ views. Arabatv Entertainment.
 *  @YorubaPremium    — YORUBAPREMIUM+. Dedicated Yoruba.
 *  @OdunladeAdekola  — Odunlade Adekola productions.
 *  @OkikiPremiumTV   — Okiki Premium TV. Large AVOD collection.
 *  @AdunEre          — Adun Ere. Rich culture & drama.
 *  @IbakaTV          — IBAKATV. #1 Nollywood Premium Movie Channel.
 *
 * CHRISTIAN (7 channels — expanded):
 *  @DamilolaMikeBamiloye — Mount Zion official YT. Abejoye, Enoch (3M+ views).
 *  @MountZionFilms       — Mount Zion Films branch channel.
 *  @LivingWordChannel    — Living Word. Faith-based Nigerian films.
 *  @PremFilms            — PREM films (Proclaimers of Righteousness).
 *  @FejosbabaTv          — Fejosbaba TV. Yoruba/English Christian films.
 *  @GloriaBamiloye       — Gloria Bamiloye (co-founder Mount Zion).
 *  @HouseholdTV          — Household TV. Christian drama.
 *
 * HOLLYWOOD (3): @FilmRiseMovies @MovieCentral @ParamountVault
 * BOLLYWOOD (3): @Rajshri @shemaroomovies @goldminesbollywood
 * KOREAN  (4):   @kbsworld @SBSWORLD @MBCDrama @KoreanFilmArchive
 */

const MOVIE_OPTS = (n=8) => ({ minDuration: 1200, maxResults: n }); // 20+ min
const FAITH_OPTS = (n=8) => ({ ...MOVIE_OPTS(n), isFaith: true });
const YOR_OPTS   = (n=8) => ({ ...MOVIE_OPTS(n), isYoruba: true });
const SKT_OPTS   = (n=6) => ({ minDuration: 30, maxDuration: 600, maxResults: n, isShort: true });

const CHANNELS = {
  nollywood: [
    { id:"@UchennaMbunaboTV",     opts:MOVIE_OPTS(8) },
    { id:"@RuthKadiri247",        opts:MOVIE_OPTS(8) },
    { id:"@BimboAdemoyeTV",       opts:MOVIE_OPTS(7) },
    { id:"@UcheMontanaTV",        opts:MOVIE_OPTS(7) },
    { id:"@MercyJohnsonOkojieTV", opts:MOVIE_OPTS(6) },
    { id:"@mauricesamtv",         opts:MOVIE_OPTS(6) },
    { id:"@UduakIsongTV",         opts:MOVIE_OPTS(6) },
    { id:"@BolajiOgunmolaTV",     opts:MOVIE_OPTS(5) },
    { id:"@SoniaUcheTV",          opts:MOVIE_OPTS(5) },
    { id:"@OmoniOboliTV",         opts:MOVIE_OPTS(5) },
    { id:"@RoyalArtsTV",          opts:MOVIE_OPTS(5) },
    { id:"@EbonyLifeTV",          opts:MOVIE_OPTS(5) },
    { id:"@iROKOtv",              opts:MOVIE_OPTS(5) },
    { id:"@RealNollyTV",          opts:MOVIE_OPTS(4) },
    { id:"@NollywoodPicturesTV",  opts:MOVIE_OPTS(4) },
    { id:"@UcheJomboTV",          opts:MOVIE_OPTS(4) },
  ],
  yoruba: [
    { id:"@ApataTv",          opts:YOR_OPTS(10) },
    { id:"@apatatvplus",      opts:YOR_OPTS(10) },
    { id:"@Yorubahood",       opts:YOR_OPTS(10) },
    { id:"@YorubaPremium",    opts:YOR_OPTS(8)  },
    { id:"@OdunladeAdekola",  opts:YOR_OPTS(8)  },
    { id:"@OkikiPremiumTV",   opts:YOR_OPTS(8)  },
    { id:"@AdunEre",          opts:YOR_OPTS(6)  },
    { id:"@IbakaTV",          opts:YOR_OPTS(6)  },
  ],
  christian: [
    { id:"@DamilolaMikeBamiloye", opts:FAITH_OPTS(10) },
    { id:"@MountZionFilms",       opts:FAITH_OPTS(8)  },
    { id:"@LivingWordChannel",    opts:FAITH_OPTS(8)  },
    { id:"@PremFilms",            opts:FAITH_OPTS(6)  },
    { id:"@FejosbabaTv",          opts:FAITH_OPTS(6)  },
    { id:"@GloriaBamiloye",       opts:FAITH_OPTS(5)  },
    { id:"@HouseholdTV",          opts:FAITH_OPTS(5)  },
  ],
  hollywood: [
    { id:"@FilmRiseMovies",  opts:MOVIE_OPTS(8) },
    { id:"@MovieCentral",    opts:MOVIE_OPTS(8) },
    { id:"@ParamountVault",  opts:MOVIE_OPTS(6) },
  ],
  bollywood: [
    { id:"@Rajshri",            opts:MOVIE_OPTS(8) },
    { id:"@shemaroomovies",     opts:MOVIE_OPTS(8) },
    { id:"@goldminesbollywood", opts:MOVIE_OPTS(8) },
  ],
  korean: [
    { id:"@kbsworld",          opts:MOVIE_OPTS(8) },
    { id:"@SBSWORLD",          opts:MOVIE_OPTS(8) },
    { id:"@MBCDrama",          opts:MOVIE_OPTS(6) },
    { id:"@KoreanFilmArchive", opts:MOVIE_OPTS(6) },
  ],
  comedy: [
    { id:"@MarkAngelComedy",   opts:SKT_OPTS(6) },
    { id:"@brodashaggi",       opts:SKT_OPTS(6) },
    { id:"@Taaooma",           opts:SKT_OPTS(5) },
    { id:"@MrFunny",           opts:SKT_OPTS(5) },
    { id:"@BrainJotter",       opts:SKT_OPTS(5) },
    { id:"@ZicsalomaOfficial", opts:SKT_OPTS(4) },
    { id:"@LasisiElenu",       opts:SKT_OPTS(4) },
    { id:"@MrMacaroni",        opts:SKT_OPTS(4) },
    { id:"@WoliAgba",          opts:SKT_OPTS(4) },
    { id:"@Josh2Funny",        opts:SKT_OPTS(4) },
    { id:"@CuteAbiola",        opts:SKT_OPTS(3) },
    { id:"@LayiWasabi",        opts:SKT_OPTS(3) },
    { id:"@SydneyTalker",      opts:SKT_OPTS(3) },
    { id:"@Maraji",            opts:SKT_OPTS(3) },
  ],
};

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? "";
  const p    = lang ? { with_original_language: lang } : {};

  const [
    trending, movies, tv, topRated, nowPlaying,
    ytNollywood, ytYoruba, ytChristian,
    ytHollywood, ytBollywood, ytKorean, ytShorts,
  ] = await Promise.all([
    tmdb("/trending/all/week"),
    tmdb("/movie/popular", p),
    tmdb("/tv/popular", p),
    tmdb("/movie/top_rated", p),
    tmdb("/movie/now_playing"),
    HAS_YT() ? getMultiChannelVideos(CHANNELS.nollywood,  20) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.yoruba,     25) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.christian,  25) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.hollywood,  12) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.bollywood,  12) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.korean,     12) : [],
    HAS_YT() ? getMultiChannelVideos(CHANNELS.comedy,     20) : [],
  ]);

  return NextResponse.json({
    trending:        (trending?.results   ?? []).slice(0,20).map(normalise),
    movies:          (movies?.results     ?? []).slice(0,20).map(normalise),
    tv:              (tv?.results         ?? []).slice(0,20).map(normalise),
    topRated:        (topRated?.results   ?? []).slice(0,20).map(normalise),
    nowPlaying:      (nowPlaying?.results ?? []).slice(0,10).map(normalise),
    nollywoodMovies: ytNollywood.map(normaliseYT),
    yorubaMovies:    ytYoruba.map(normaliseYT),
    christianMovies: ytChristian.map(normaliseYT),
    hollywoodMovies: ytHollywood.map(normaliseYT),
    bollywoodMovies: ytBollywood.map(normaliseYT),
    koreanMovies:    ytKorean.map(normaliseYT),
    trendingShorts:  ytShorts.map(normaliseYT),
    hasYouTube:      HAS_YT(),
  }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } });
}
