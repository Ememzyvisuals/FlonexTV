/**
 * lib/i18n.ts — FlonexTV Multi-Language System
 * Languages: English, French, Japanese, Korean, Hindi, Tamil,
 *            Yoruba, Hausa, Igbo
 */

export type LangCode = "en"|"fr"|"ja"|"ko"|"hi"|"ta"|"yo"|"ha"|"ig";

export const SUPPORTED_LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
  { code:"en", label:"English",  nativeLabel:"English"    },
  { code:"fr", label:"French",   nativeLabel:"Français"   },
  { code:"ja", label:"Japanese", nativeLabel:"日本語"       },
  { code:"ko", label:"Korean",   nativeLabel:"한국어"       },
  { code:"hi", label:"Hindi",    nativeLabel:"हिन्दी"       },
  { code:"ta", label:"Tamil",    nativeLabel:"தமிழ்"       },
  { code:"yo", label:"Yoruba",   nativeLabel:"Yorùbá"     },
  { code:"ha", label:"Hausa",    nativeLabel:"Hausa"      },
  { code:"ig", label:"Igbo",     nativeLabel:"Igbo"       },
];

const T = {
  // Navigation
  home:         { en:"Home",        fr:"Accueil",    ja:"ホーム",     ko:"홈",       hi:"होम",        ta:"முகப்பு",  yo:"Ile",       ha:"Gida",       ig:"Ụlọ"        },
  search:       { en:"Search",      fr:"Recherche",  ja:"検索",       ko:"검색",      hi:"खोज",        ta:"தேடல்",    yo:"Wa",        ha:"Bincike",    ig:"Chọọ"       },
  library:      { en:"Library",     fr:"Médiathèque",ja:"ライブラリ",  ko:"라이브러리",  hi:"लाइब्रेरी",   ta:"நூலகம்",   yo:"Ile-ikawe",ha:"Laburare",   ig:"Nchekwa"    },
  shorts:       { en:"Shorts",      fr:"Courts",     ja:"ショート",    ko:"쇼츠",      hi:"शॉर्ट्स",     ta:"குறும்படம்",yo:"Kukuru",   ha:"Gajeru",     ig:"Obere"      },
  courses:      { en:"Courses",     fr:"Cours",      ja:"コース",      ko:"강좌",      hi:"कोर्स",       ta:"பாடங்கள்",  yo:"Eko",       ha:"Darussa",    ig:"Ihe Mmụta"  },
  profile:      { en:"Profile",     fr:"Profil",     ja:"プロフィール", ko:"프로필",     hi:"प्रोफ़ाइल",    ta:"சுயவிவரம்", yo:"Alaye",     ha:"Bayani",     ig:"Profaịlụ"   },

  // Actions
  play:         { en:"Play",        fr:"Lire",       ja:"再生",       ko:"재생",      hi:"चलाएं",       ta:"இயக்கு",   yo:"Ṣe",        ha:"Kunna",      ig:"Gbaa"       },
  playNow:      { en:"Play Now",    fr:"Lire",       ja:"今すぐ再生",   ko:"지금 재생",  hi:"अभी चलाएं",   ta:"இப்போது",   yo:"Ṣe Bayi",   ha:"Kunna",      ig:"Gbaa Ugbu"  },
  watchNow:     { en:"Watch Now",   fr:"Voir",       ja:"今すぐ視聴",   ko:"지금 보기",  hi:"अभी देखें",   ta:"இப்போது பார்",yo:"Wo Bayi", ha:"Kalli",      ig:"Lee Ugbu"   },
  save:         { en:"Save",        fr:"Enregistrer",ja:"保存",       ko:"저장",      hi:"सेव करें",    ta:"சேமி",     yo:"Fipamọ",    ha:"Ajiye",      ig:"Chekwaa"    },
  saved:        { en:"Saved",       fr:"Enregistré", ja:"保存済み",    ko:"저장됨",     hi:"सेव हुआ",     ta:"சேமிக்கப்பட்டது",yo:"Ti fipamo",ha:"An ajiye",   ig:"Echekwara"  },
  download:     { en:"Download",    fr:"Télécharger",ja:"ダウンロード",  ko:"다운로드",   hi:"डाउनलोड",     ta:"பதிவிறக்கு", yo:"Gba gbọ",   ha:"Sauke",      ig:"Budata"     },
  share:        { en:"Share",       fr:"Partager",   ja:"共有",       ko:"공유",      hi:"शेयर करें",   ta:"பகிர்",    yo:"Pin",       ha:"Raba",       ig:"Kekọrịta"   },
  seeAll:       { en:"See all",     fr:"Tout voir",  ja:"すべて見る",   ko:"모두 보기",  hi:"सब देखें",    ta:"அனைத்தும்", yo:"Wo gbogbo",ha:"Duba duka",  ig:"Hụ niile"   },
  moreInfo:     { en:"More Info",   fr:"Plus d'infos",ja:"詳細",      ko:"더보기",     hi:"अधिक जानें",  ta:"மேலும்",    yo:"Alaye si",  ha:"Ƙari",       ig:"Ozi ndị ọzọ"},
  watchlist:    { en:"Watchlist",   fr:"Liste",      ja:"ウォッチリスト",ko:"찜 목록",   hi:"देखने की सूची",ta:"பார்வை பட்டியல்",yo:"Atokọ",  ha:"Jerin",      ig:"Ndepụta"    },
  inList:       { en:"In List",     fr:"Dans la liste",ja:"リスト追加済",ko:"목록에 있음",hi:"सूची में है",  ta:"பட்டியலில்",yo:"Ninu atokọ",ha:"A cikin jerin",ig:"Na ndepụta" },
  continueWatching:{ en:"Continue Watching",fr:"Continuer",ja:"続きを見る",ko:"이어보기",hi:"जारी रखें",ta:"தொடர்ந்து பார்",yo:"Tẹsiwaju",ha:"Ci gaba",ig:"Aga n'ihu"  },
  topPicks:     { en:"Top Picks",   fr:"Sélection",  ja:"おすすめ",    ko:"추천",      hi:"टॉप पिक्स",   ta:"சிறந்தவை",  yo:"Awọn yiyan",ha:"Mafi kyau",   ig:"Nhọrọ"      },
  trending:     { en:"Trending Now",fr:"Tendances",  ja:"急上昇",      ko:"인기",      hi:"ट्रेंडिंग",    ta:"பிரபலமான",  yo:"Olokiki",   ha:"Sananne",    ig:"Ndị ukwu"   },
  nowPlaying:   { en:"Now Playing", fr:"En ce moment",ja:"上映中",    ko:"현재 상영",  hi:"अभी चल रहा",  ta:"இப்போது",   yo:"Nisiyi",    ha:"Yanzu",      ig:"Ugbu a"     },
  popular:      { en:"Popular",     fr:"Populaire",  ja:"人気",       ko:"인기 있는",  hi:"लोकप्रिय",    ta:"பிரபலமான",  yo:"Gbajugbaja", ha:"Shahararren",ig:"A chọrọ n'oge"  },
  topRated:     { en:"Top Rated All Time",fr:"Mieux notés",ja:"高評価",ko:"최고 평점", hi:"टॉप रेटेड",   ta:"சிறந்த மதிப்பீடு",yo:"Ṣe akiyesi",ha:"Mafi girma",ig:"Kachasị mma" },

  // Auth
  signIn:       { en:"Sign In",     fr:"Connexion",  ja:"ログイン",    ko:"로그인",     hi:"साइन इन",    ta:"உள்நுழை",  yo:"Wọle",      ha:"Shiga",      ig:"Banye"      },
  signUp:       { en:"Sign Up",     fr:"S'inscrire", ja:"登録",       ko:"회원가입",   hi:"साइन अप",    ta:"பதிவு செய்",yo:"Forukọsilẹ", ha:"Yi rijista",  ig:"Debanye aha"},
  signOut:      { en:"Sign out",    fr:"Déconnexion",ja:"ログアウト",   ko:"로그아웃",   hi:"साइन आउट",   ta:"வெளியேறு", yo:"Jade",       ha:"Fita",       ig:"Pụọ"        },
  createAccount:{ en:"Create Account",fr:"Créer un compte",ja:"アカウント作成",ko:"계정 만들기",hi:"खाता बनाएं",ta:"கணக்கு உருவாக்கு",yo:"Ṣe Akon",ha:"Ƙirƙiri lissafi",ig:"Mepụta akaụntị"},
  welcomeBack:  { en:"Welcome Back",fr:"Bon retour",  ja:"おかえりなさい",ko:"돌아오신 것을 환영합니다",hi:"वापस स्वागत है",ta:"மீண்டும் வரவேற்கிறோம்",yo:"E kaabo",ha:"Barka da dawowa",ig:"Nnọọ ọzọ"},
  fullName:     { en:"Full Name",   fr:"Nom complet",ja:"氏名",       ko:"이름",      hi:"पूरा नाम",    ta:"முழு பெயர்",yo:"Orukọ",     ha:"Sunan cikakke",ig:"Aha zuru oke"},
  email:        { en:"Email",       fr:"E-mail",     ja:"メール",      ko:"이메일",     hi:"ईमेल",        ta:"மின்னஞ்சல்",yo:"Imeeli",    ha:"Imel",       ig:"Email"      },
  password:     { en:"Password",    fr:"Mot de passe",ja:"パスワード",  ko:"비밀번호",   hi:"पासवर्ड",     ta:"கடவுச்சொல்",yo:"Ọrọigbaniwọle",ha:"Kalmar siri",ig:"Paswọọdụ"   },

  // Courses
  startCourse:  { en:"Start Course",fr:"Commencer",  ja:"コース開始",  ko:"코스 시작", hi:"कोर्स शुरू करें",ta:"பாடம் தொடங்கு",yo:"Bẹrẹ",    ha:"Fara",       ig:"Malite"     },
  continueCourse:{en:"Continue",    fr:"Continuer",  ja:"続ける",      ko:"계속하기",  hi:"जारी रखें",   ta:"தொடர்",    yo:"Tẹsiwaju",  ha:"Ci gaba",    ig:"Aga n'ihu"  },
  completed:    { en:"Completed",   fr:"Terminé",    ja:"完了",       ko:"완료됨",    hi:"पूर्ण",        ta:"முடிந்தது",  yo:"Pari",      ha:"An kammala", ig:"Emechara"   },
  certificate:  { en:"Certificate", fr:"Certificat", ja:"修了証",      ko:"수료증",    hi:"प्रमाण पत्र",  ta:"சான்றிதழ்",  yo:"Iwe-ẹri",   ha:"Takaddar shaida",ig:"Asambodo"},
  getCertificate:{en:"Get Certificate",fr:"Obtenir Certificat",ja:"修了証を取得",ko:"수료증 받기",hi:"प्रमाण पत्र पाएं",ta:"சான்றிதழ் பெறு",yo:"Gba Iwe-ẹri",ha:"Samu takardar",ig:"Nweta asambodo"},
  progress:     { en:"Progress",    fr:"Progression",ja:"進捗",       ko:"진행 상황", hi:"प्रगति",       ta:"முன்னேற்றம்",yo:"Ilọsiwaju", ha:"Ci gaba",    ig:"Ọganihu"    },
  modules:      { en:"Modules",     fr:"Modules",    ja:"モジュール",   ko:"모듈",     hi:"मॉड्यूल",      ta:"தொகுதிகள்",  yo:"Awọn ẹkọ",  ha:"Sassa",      ig:"Ngalaba"    },
  free:         { en:"Free",        fr:"Gratuit",    ja:"無料",       ko:"무료",     hi:"मुफ़्त",        ta:"இலவசம்",   yo:"Ọfẹ",       ha:"Kyauta",     ig:"N'efu"      },
  signInToStart:{ en:"Sign in to start this course",fr:"Connectez-vous pour commencer",ja:"コースを始めるにはログインが必要です",ko:"코스를 시작하려면 로그인하세요",hi:"कोर्स शुरू करने के लिए साइन इन करें",ta:"பாடத்தை தொடங்க உள்நுழையவும்",yo:"Wọle lati bẹrẹ ẹkọ",ha:"Shiga don fara",ig:"Banye iji malite"},

  // Content sections
  christianMovies:{ en:"Christian Movies",fr:"Films chrétiens",ja:"クリスチャン映画",ko:"기독교 영화",hi:"ईसाई फिल्में",ta:"கிறிஸ்தவ திரைப்படங்கள்",yo:"Awọn fiimu Kristiẹni",ha:"Fina-finan Kirista",ig:"Ihe nkiri Ndị Kraịst"},
  yorubaMovies: { en:"Yoruba Movies",fr:"Films Yoruba",ja:"ヨルバ映画", ko:"요루바 영화",hi:"योरूबा फिल्में",ta:"யோரூபா திரைப்படங்கள்",yo:"Awọn fiimu Yoruba",ha:"Fina-finan Hausa",ig:"Ihe nkiri Yoruba"},
  trendingShorts:{en:"Trending Shorts",fr:"Shorts tendance",ja:"急上昇ショート",ko:"인기 쇼츠",hi:"ट्रेंडिंग शॉर्ट्स",ta:"பிரபலமான குறும்படங்கள்",yo:"Awọn ẹya kukuru ti o gbajumọ",ha:"Gajeren bidiyo masu shahara",ig:"Obere ihe nkiri ndị ukwu"},

  // Messages
  noStream:     { en:"Not available yet — expanding our library",fr:"Pas encore disponible",ja:"まだ利用できません",ko:"아직 없음",hi:"अभी उपलब्ध नहीं",ta:"இன்னும் இல்லை",yo:"Ko si sibẹsibẹ",ha:"Ba a samu ba tukuna",ig:"Adịghị n'oge a"},
  comingSoon:   { en:"Coming Soon",  fr:"Bientôt",    ja:"近日公開",    ko:"출시 예정",  hi:"जल्द आएगा",  ta:"விரைவில்",   yo:"N'ọjọ iwaju",ha:"Ba da jimawa ba",ig:"N'oge na-abịa"},
  noYouTubeKey: { en:"Add YOUTUBE_API_KEY in Vercel to unlock YouTube sections",fr:"Ajoutez YOUTUBE_API_KEY",ja:"YOUTUBE_API_KEYを追加",ko:"YOUTUBE_API_KEY 추가",hi:"YOUTUBE_API_KEY जोड़ें",ta:"YOUTUBE_API_KEY சேர்க்கவும்",yo:"Fi YOUTUBE_API_KEY kun",ha:"Ƙara YOUTUBE_API_KEY",ig:"Tinye YOUTUBE_API_KEY"},

  // Settings
  settings:     { en:"Settings",    fr:"Paramètres", ja:"設定",       ko:"설정",      hi:"सेटिंग्स",    ta:"அமைப்புகள்",yo:"Eto",       ha:"Saituna",    ig:"Ntọala"     },
  language:     { en:"Language",    fr:"Langue",     ja:"言語",       ko:"언어",      hi:"भाषा",        ta:"மொழி",      yo:"Ede",       ha:"Harshe",     ig:"Asụsụ"      },
  notifications:{ en:"Notifications",fr:"Notifications",ja:"通知",   ko:"알림",      hi:"सूचनाएं",     ta:"அறிவிப்புகள்",yo:"Ifitonileti",ha:"Sanarwa",    ig:"Ọkwa"       },
  hdStreaming:   { en:"HD Streaming",fr:"Streaming HD",ja:"HDストリーミング",ko:"HD 스트리밍",hi:"HD स्ट्रीमिंग",ta:"HD ஸ்ட்ரீமிங்",yo:"HD Ifọran",  ha:"Kallon HD",  ig:"HD Mgbasa"  },
  autoplay:     { en:"Autoplay Next",fr:"Lecture automatique",ja:"次を自動再生",ko:"자동 재생",hi:"ऑटोप्ले",     ta:"தானாக இயக்கு",yo:"Isere aifọwọyi",ha:"Kunna ta atomatik",ig:"Ọkwa na-arụ ọrụ"},

  // Profile
  myProfile:    { en:"Profile",     fr:"Profil",     ja:"プロフィール",ko:"프로필",     hi:"प्रोफ़ाइल",    ta:"சுயவிவரம்",  yo:"Alaye Mi",  ha:"Bayanin Ni", ig:"Profaịlụ m" },
  connect:      { en:"Connect",     fr:"Connexions", ja:"つながり",    ko:"연결",      hi:"कनेक्ट",      ta:"இணைப்பு",  yo:"Asopọ",     ha:"Haɗawa",     ig:"Njikọ"      },
  myCourses:    { en:"My Courses",  fr:"Mes Cours",  ja:"マイコース",  ko:"내 강좌",   hi:"मेरे कोर्स",  ta:"என் பாடங்கள்",yo:"Ẹkọ Mi",   ha:"Darussan na",ig:"Ihe mmụta m"},
  allLanguages: { en:"All Languages",fr:"Toutes les langues",ja:"全言語",ko:"모든 언어",hi:"सभी भाषाएं",ta:"அனைத்து மொழிகள்",yo:"Gbogbo ede",ha:"Duk yarukan",ig:"Asụsụ niile"},
} as const;

type TranslationKey = keyof typeof T;

/** Translate a key to the current language, falling back to English */
export function t(key: TranslationKey, lang: string = "en"): string {
  const entry = T[key] as Record<string, string>;
  if (!entry) return key;
  return entry[lang as LangCode] ?? entry["en"] ?? key;
}

/** Get all supported language options */
export function getLangs() { return SUPPORTED_LANGUAGES; }

/** Map our lang codes to TMDB language params */
export function toTmdbLang(code: string): string {
  const map: Record<string, string> = {
    en:"en-US", fr:"fr-FR", ja:"ja-JP", ko:"ko-KR",
    hi:"hi-IN", ta:"ta-IN", yo:"en-US", ha:"en-US", ig:"en-US",
  };
  return map[code] ?? "en-US";
}

export default { t, getLangs, toTmdbLang, SUPPORTED_LANGUAGES };
