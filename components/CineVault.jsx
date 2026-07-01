"use client";
/**
 * CineVault v5 — by EMEMZYVISUALS
 * Font: Nunito (Google Fonts) — bold, playful, professional
 *       Applied to 100% of elements: text, numbers, symbols, buttons, labels
 * Stream: Internet Archive public domain MP4 (legal, zero-cost)
 * Next.js: 15.1.9 (CVE-2025-66478 patched)
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Storage ───────────────────────────────────────────────── */
const S = {
  get:  k => { try { return JSON.parse(localStorage.getItem(k)||"null"); } catch { return null; } },
  set:  (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} },
  push: (k,item,max=50) => { const a=S.get(k)||[]; const n=[item,...a.filter(x=>x.id!==item.id)].slice(0,max); S.set(k,n); return n; },
};

/* ─── In-memory cache (survives page nav, clears on full refresh) */
const PAGE_CACHE = {
  _s: {},
  get(k) { const e=this._s[k]; return e&&Date.now()<e.exp?e.d:null; },
  set(k,d,ms=900000) { this._s[k]={d,exp:Date.now()+ms}; },
  del(k) { delete this._s[k]; },
};

/* ─── Constants ─────────────────────────────────────────────── */
const LANGS=[
  {code:"",  label:"All Languages", native:"All"},
  {code:"en",label:"English",       native:"English"},
  {code:"fr",label:"French",        native:"Français"},
  {code:"hi",label:"Hindi",         native:"हिन्दी"},
  {code:"ko",label:"Korean",        native:"한국어"},
  {code:"ja",label:"Japanese",      native:"日本語"},
  {code:"ta",label:"Tamil",         native:"தமிழ்"},
  {code:"yo",label:"Yoruba",        native:"Yorùbá"},
  {code:"ha",label:"Hausa",         native:"Hausa"},
  {code:"ig",label:"Igbo",          native:"Igbo"},
  {code:"es",label:"Spanish",       native:"Español"},
  {code:"pt",label:"Portuguese",    native:"Português"},
  {code:"de",label:"German",        native:"Deutsch"},
  {code:"zh",label:"Chinese",       native:"中文"},
];

// ── i18n helper (inline — no external import needed) ──
const TRANSLATIONS = {
  home:      {en:"Home",    fr:"Accueil",  ja:"ホーム",   ko:"홈",    hi:"होम",    yo:"Ile",    ha:"Gida",  ig:"Ụlọ"},
  search:    {en:"Search",  fr:"Recherche",ja:"検索",     ko:"검색",   hi:"खोज",    yo:"Wa",     ha:"Bincike",ig:"Chọọ"},
  courses:   {en:"Courses", fr:"Cours",    ja:"コース",   ko:"강좌",   hi:"कोर्स",   yo:"Eko",    ha:"Darussa",ig:"Mmụta"},
  shorts:    {en:"Shorts",  fr:"Courts",   ja:"ショート", ko:"쇼츠",   hi:"शॉर्ट्स",  yo:"Kukuru", ha:"Gajeru", ig:"Obere"},
  library:   {en:"Library", fr:"Vidéothèque",ja:"ライブラリ",ko:"라이브러리",hi:"लाइब्रेरी",yo:"Ile-ikawe",ha:"Laburare",ig:"Nchekwa"},
  profile:   {en:"Profile", fr:"Profil",   ja:"プロフィール",ko:"프로필", hi:"प्रोफ़ाइल", yo:"Alaye",  ha:"Bayani", ig:"Profaịlụ"},
  courses:   {en:"Courses", fr:"Cours",    ja:"コース",   ko:"강좌",   hi:"कोर्स",   yo:"Eko",    ha:"Darussa",ig:"Mmụta"},
  watchlist: {en:"Watchlist",fr:"Liste",   ja:"リスト",   ko:"찜목록", hi:"सूची",    yo:"Atokọ",  ha:"Jerin",  ig:"Ndepụta"},
  watched:   {en:"Watched", fr:"Vus",      ja:"視聴済み", ko:"시청함",  hi:"देखा",    yo:"Ti wo",  ha:"An kalla",ig:"Leere"},
  searched:  {en:"Searches",fr:"Recherches",ja:"検索数",  ko:"검색수",  hi:"खोजें",   yo:"Awọn wa",ha:"Binciken",ig:"Nchọọ"},
};
function t(key, lang) {
  const row = TRANSLATIONS[key];
  if (!row) return key;
  return row[lang] || row.en || key;
}

const HOT = [
  "Nosferatu","Night of the Living Dead","Metropolis","The General","Sherlock Holmes",
  "Daredevil","Peaky Blinders","The Godfather","Inception","Interstellar",
  "Carry-On","War Machine","Scream 7","Anora","Conclave",
];

const HOME_CATS = [
  {key:"trending",label:"Trending"},{key:"movies",label:"Movies"},
  {key:"series",label:"Series"},{key:"nollywood",label:"Nollywood"},
  {key:"bollywood",label:"Bollywood"},{key:"kdrama",label:"K-Drama"},
  {key:"anime",label:"Anime"},{key:"french",label:"French"},
];

/* ─── FLONEXTV LOGO SVG ─────────────────────────────────────── */
function FlonexLogo({size=28, showTagline=false}) {
  /* Clean professional mark: red circle + white play arrow + wordmark */
  const ico = Math.round(size * 1.1);
  return (
    <div style={{display:"flex",flexDirection:"column",
      alignItems:"flex-start",gap:showTagline?3:0}}>
      <div style={{display:"flex",alignItems:"center",gap:Math.round(size*0.3)}}>
        <svg width={ico} height={ico} viewBox="0 0 36 36" fill="none" style={{flexShrink:0}}>
          <circle cx="18" cy="18" r="17" fill="#E50914"/>
          <polygon points="14,11 14,25 27,18" fill="#fff"/>
        </svg>
        <span style={{fontWeight:900,fontSize:size,
          letterSpacing:"-.04em",lineHeight:1,color:"#E5E5E5"}}>
          Flonex<span style={{color:"#E50914"}}>TV</span>
        </span>
      </div>
      {showTagline && (
        <p style={{fontSize:Math.round(size*0.34),fontWeight:700,
          color:"rgba(255,255,255,.35)",letterSpacing:".05em",
          textTransform:"uppercase",paddingLeft:Math.round(ico*1.2)+Math.round(size*0.3)}}>
          Stream · Learn · Enjoy
        </p>
      )}
    </div>
  );
}

/* ─── SVG Icon Library ──────────────────────────────────────── */
function Icon({name,size=20,color="currentColor",style:s={},className:c=""}) {
  const paths = {
    home:     "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5zM9 21V12h6v9",
    search:   "M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.35-4.35",
    library:  "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
    profile:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    pause:    "M6 4h4v16H6zM14 4h4v16h-4z",
    back:     "M15 18l-6-6 6-6",
    close:    "M18 6L6 18M6 6l12 12",
    plus:     "M12 5v14M5 12h14",
    check:    "M20 6L9 17l-5-5",
    info:     "M12 16v-4M12 8h.01M12 22a10 10 0 100-20 10 10 0 000 20z",
    download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
    share:    "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
    bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6",
    chevR:    "M9 18l6-6-6-6",
    globe:    "M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
    fire:     "M12 2s-5 5-5 10a5 5 0 0010 0c0-5-5-10-5-10zm0 13a2 2 0 01-2-2c0-2 2-4 2-4s2 2 2 4a2 2 0 01-2 2z",
    clock:    "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
    trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
    alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
    full:     "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
    refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
    mic:      "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
    logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
    external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
    legal:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    heart:    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  };
  // Special renders
  if (name==="play")    return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><polygon points="5,3 19,12 5,21"/></svg>;
  if (name==="star")    return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>;
  if (name==="spinner") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={c} style={{animation:"cvSpin .7s linear infinite",...s}}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.18)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round"/></svg>;
  if (name==="github")  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>;
  if (name==="x_s")     return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  if (name==="tiktok")  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.18 8.18 0 004.77 1.52V7.02a4.85 4.85 0 01-1-.33z"/></svg>;
  if (name==="ai")      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={c} style={s}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.4 2.4-7.4L2 9.4h7.6z"/></svg>;
  const d = paths[name];
  if (!d) return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} style={s}><path d={d}/></svg>;
}

/* ─── Global CSS — Nunito applied to ALL elements ────────────── */
function Styles() {
  return (
    <style>{`
      /* ═══ Keyframes ════════════════════════════════════════════ */
      @keyframes cvSpin  { to { transform: rotate(360deg); } }
      @keyframes cvUp    { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes cvFade  { from { opacity:0; } to { opacity:1; } }
      @keyframes cvShim  { from { background-position:-600px 0; } to { background-position:600px 0; } }
      @keyframes cvPulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      /* ═══ FONT — Nunito on EVERYTHING ══════════════════════════
         This block forces Nunito on every possible element.
         Numbers, symbols, emoji text, button labels, nav text,
         input placeholders, select options — all use Nunito.
      ════════════════════════════════════════════════════════════ */
      *, *::before, *::after,
      html, body,
      button, input, select, textarea,
      h1, h2, h3, h4, h5, h6,
      p, span, div, a, label,
      li, ul, ol, td, th,
      code, pre, kbd, samp,
      nav, header, footer, main, aside,
      section, article, figure, figcaption,
      option, optgroup, datalist,
      summary, details, dialog {
        font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* ═══ Base ══════════════════════════════════════════════════ */
      html, body {
        background: #0F0F0F;
        color: #E5E5E5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        overflow: hidden;
        height: 100%;
        font-size: 15px;
        font-weight: 500;
        line-height: 1.55;
      }

      ::-webkit-scrollbar { display: none; }
      * { scrollbar-width: none; }
      button { background: none; border: none; cursor: pointer; color: inherit; }
      a { color: inherit; text-decoration: none; }
      img { display: block; user-select: none; }
      input::placeholder { font-family: 'Nunito', sans-serif !important; font-weight: 500; }
      select option { font-family: 'Nunito', sans-serif !important; }

      /* ═══ Design Tokens ═════════════════════════════════════════ */
      :root {
        --bg:    #0F0F0F;
        --bg1:   #141414;
        --bg2:   #1C1C1C;
        --bg3:   #252525;
        --bg4:   #2E2E2E;
        --text:  #E5E5E5;
        --t2:    rgba(229,229,229,.65);
        --t3:    #6B7280;
        --red:   #E50914;
        --green: #16a34a;
        --line:  rgba(255,255,255,.08);
        --nav:   62px;
        --side:  230px;
      }

      /* ═══ Utilities ═════════════════════════════════════════════ */
      .tap  { cursor:pointer; transition:opacity .15s,transform .15s; -webkit-tap-highlight-color:transparent; }
      .tap:active  { opacity:.55; transform:scale(.97); }
      .anim { animation: cvUp .38s cubic-bezier(.22,1,.36,1) both; }
      .fade { animation: cvFade .3s ease both; }
      .sk   {
        background: linear-gradient(90deg,#1c1c1c 25%,#252525 50%,#1c1c1c 75%);
        background-size: 600px 100%;
        animation: cvShim 1.4s infinite;
        border-radius: 8px;
      }

      /* ═══ Scroll rows ════════════════════════════════════════════ */
      .hrow {
        display: flex; gap: 10px;
        overflow-x: auto; overflow-y: visible;
        padding: 4px 16px;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
      }
      .hrow > * { scroll-snap-align: start; flex-shrink: 0; }

      /* ═══ Grids ══════════════════════════════════════════════════ */
      .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:0 14px; }
      .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:0 14px; }
      @media(min-width:600px)  { .g3 { grid-template-columns:repeat(4,1fr); gap:10px; padding:0 20px; } }
      @media(min-width:900px)  { .g3 { grid-template-columns:repeat(5,1fr); } .g4 { grid-template-columns:repeat(6,1fr); } }
      @media(min-width:1200px) { .g3 { grid-template-columns:repeat(7,1fr); } }

      /* ═══ Bottom nav ═════════════════════════════════════════════ */
      .bnav {
        position:fixed; bottom:0; left:50%; transform:translateX(-50%);
        width:100%; max-width:960px; height:var(--nav);
        background:rgba(10,10,10,.97); border-top:1px solid var(--line);
        display:flex; align-items:center; justify-content:space-around;
        z-index:500; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
      }
      .bni {
        display:flex; flex-direction:column; align-items:center; gap:3px;
        padding:6px 14px; flex:1; background:none; border:none; cursor:pointer;
        -webkit-tap-highlight-color:transparent; transition:opacity .15s;
      }
      .bni:active { opacity:.6; }
      .bni span { font-size:10px; font-weight:700; letter-spacing:.03em; }

      /* ═══ Sidebar ════════════════════════════════════════════════ */
      .sidebar {
        width:var(--side); background:var(--bg1); border-right:1px solid var(--line);
        display:flex; flex-direction:column; padding:8px 0; height:100%;
        position:sticky; top:0; flex-shrink:0; overflow-y:auto;
      }
      .sbi {
        display:flex; align-items:center; gap:12px; padding:12px 20px;
        background:none; border:none; cursor:pointer; color:var(--t2);
        font-size:14px; font-weight:700; width:100%; text-align:left;
        transition:all .14s; border-left:3px solid transparent;
      }
      .sbi:hover { background:var(--bg2); color:var(--text); }
      .sbi.on    { color:var(--red); border-left-color:var(--red); background:rgba(229,9,20,.07); font-weight:800; }

      /* ═══ Responsive ═════════════════════════════════════════════ */
      @media(min-width:768px) { .mobile-only  { display:none!important; } .sidebar { display:flex!important; } }
      @media(max-width:767px) { .desktop-only { display:none!important; } .sidebar { display:none!important; } }

      /* ═══ Input ══════════════════════════════════════════════════ */
      .field {
        width:100%; background:var(--bg2); border:1.5px solid var(--line);
        border-radius:10px; padding:11px 14px; color:var(--text);
        font-size:15px; font-weight:500; outline:none; transition:border-color .2s;
      }
      .field:focus { border-color:var(--red); }
      .field::placeholder { color:var(--t3); font-weight:500; }

      /* ═══ Toggle ══════════════════════════════════════════════════ */
      .tog { width:44px; height:26px; border-radius:13px; position:relative; cursor:pointer; border:none; transition:background .22s; flex-shrink:0; }
      .tog-dot { width:20px; height:20px; border-radius:50%; background:#fff; position:absolute; top:3px; transition:left .22s cubic-bezier(.22,1,.36,1); box-shadow:0 1px 4px rgba(0,0,0,.5); }

      /* ═══ Pill buttons ════════════════════════════════════════════ */
      .pbtn {
        display:inline-flex; align-items:center; gap:7px;
        padding:10px 22px; border-radius:24px; border:none; cursor:pointer;
        font-size:14px; font-weight:800; letter-spacing:.02em;
        transition:opacity .14s, transform .12s; white-space:nowrap;
      }
      .pbtn:active   { transform:scale(.95); }
      .pbtn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
      .pbtn.r  { background:var(--red);                  color:#fff; }
      .pbtn.dk { background:rgba(255,255,255,.15); color:#fff; border:1px solid rgba(255,255,255,.2); backdrop-filter:blur(8px); }
      .pbtn.gr { background:var(--bg3); color:var(--text); border:1px solid var(--line); }
      .pbtn.g  { background:var(--green); color:#fff; }

      /* ═══ Section header ══════════════════════════════════════════ */
      .shead   { display:flex; align-items:center; justify-content:space-between; padding:0 16px; margin-bottom:12px; }
      .shead-t { font-size:19px; font-weight:900; color:var(--text); letter-spacing:-.01em; }
      .shead-a { display:flex; align-items:center; gap:3px; font-size:13px; font-weight:700; color:var(--t2); background:none; border:none; cursor:pointer; }
      .shead-a:hover { color:var(--text); }

      /* ═══ Category chip ═══════════════════════════════════════════ */
      .ctab {
        font-size:13px; font-weight:700; padding:6px 14px;
        border-radius:20px; border:1px solid var(--line);
        background:transparent; color:var(--t2); white-space:nowrap;
        cursor:pointer; flex-shrink:0; transition:all .16s;
        -webkit-tap-highlight-color:transparent;
      }
      .ctab.on { background:var(--red); border-color:var(--red); color:#fff; font-weight:800; }

      /* ═══ Search pill ═════════════════════════════════════════════ */
      .spill {
        font-size:13px; font-weight:600; padding:7px 14px;
        border-radius:20px; border:1px solid var(--line);
        background:var(--bg2); color:var(--t2); white-space:nowrap;
        cursor:pointer; flex-shrink:0; transition:all .15s;
        -webkit-tap-highlight-color:transparent;
      }
      .spill:hover  { border-color:var(--red); color:var(--text); }
      .spill:active { opacity:.6; }

      /* ═══ Tab underline ═══════════════════════════════════════════ */
      .stab {
        font-size:14px; font-weight:700; padding:10px 4px;
        background:none; border:none; cursor:pointer; color:var(--t3);
        border-bottom:2px solid transparent; margin-bottom:-1px;
        transition:all .15s; flex-shrink:0;
      }
      .stab.on { color:var(--text); border-bottom-color:var(--text); font-weight:800; }

      /* ═══ Badge ═══════════════════════════════════════════════════ */
      .badge { font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; letter-spacing:.03em; }

      /* ═══ Card hover ══════════════════════════════════════════════ */
      .card { cursor:pointer; transition:transform .22s cubic-bezier(.22,1,.36,1); }
      .card:hover  { transform:scale(1.04) translateY(-3px); }
      .card:active { transform:scale(.96); }

      /* ═══ AI panel ════════════════════════════════════════════════ */
      .ai-panel { background:rgba(229,9,20,.06); border:1px solid rgba(229,9,20,.2); border-radius:14px; padding:16px; }

      /* ═══ ShowAll grid ══════════════════════════════════════════ */
      .showAll-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; padding:12px; }
      @media(min-width:480px)  { .showAll-grid { grid-template-columns:repeat(3,1fr); gap:12px; } }
      @media(min-width:700px)  { .showAll-grid { grid-template-columns:repeat(4,1fr); } }
      @media(min-width:900px)  { .showAll-grid { grid-template-columns:repeat(5,1fr); } }
      @media(min-width:1200px) { .showAll-grid { grid-template-columns:repeat(6,1fr); } }

      /* ═══ Courses grid — 2-col mobile, 3-col tablet, 4-col desktop ══ */
      .courses-grid {
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:12px;
        padding:0 12px 16px;
      }
      @media(min-width:600px)  { .courses-grid { grid-template-columns:repeat(3,1fr); gap:14px; padding:0 16px 16px; } }
      @media(min-width:900px)  { .courses-grid { grid-template-columns:repeat(4,1fr); } }
      @media(min-width:1200px) { .courses-grid { grid-template-columns:repeat(5,1fr); } }

      /* ═══ Print: certificate fullpage ═══════════════════════════════ */
      @media print {
        body > *:not(#flonextv-certificate) { display:none !important; }
        #flonextv-certificate { width:100% !important; max-width:100% !important; box-shadow:none !important; border:none !important; }
      }
    `}</style>
  );
}

/* ─── Shared atoms ───────────────────────────────────────────── */
const Spinner = ({pad="24px 0", size=26}) => (
  <div style={{display:"flex",justifyContent:"center",padding:pad}}>
    <Icon name="spinner" size={size} color="var(--red)"/>
  </div>
);

function Star({rating, size=12}) {
  if (!rating || rating === 0) return null;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3,fontWeight:800,fontSize:size,color:"#F5C518"}}>
      <Icon name="star" size={size} color="#F5C518"/>
      {Number(rating).toFixed(1)}
    </span>
  );
}

function ImgF({src, alt, style:s={}, radius=0, fallback}) {
  const [err, setErr] = useState(false);
  const fc = fallback || (alt && alt[0]) || "?";
  return (
    <div style={{background:"var(--bg3)",borderRadius:radius,overflow:"hidden",flexShrink:0,...s}}>
      {src && !err
        ? <img src={src} alt={alt||""} onError={() => setErr(true)} loading="lazy"
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
        : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontWeight:900,fontSize:22,color:"var(--bg4)"}}>{fc}</span>
          </div>
      }
    </div>
  );
}

function SkelCards({count=5, w=130, h=195}) {
  return (
    <div className="hrow">
      {Array.from({length:count}, (_,i) => (
        <div key={i} style={{width:w,flexShrink:0}}>
          <div className="sk" style={{width:w,height:h}}/>
          <div className="sk" style={{width:"75%",height:10,marginTop:8}}/>
          <div className="sk" style={{width:"50%",height:9,marginTop:5}}/>
        </div>
      ))}
    </div>
  );
}

function SkelGrid({count=9}) {
  return (
    <div className="g3">
      {Array.from({length:count}, (_,i) => (
        <div key={i}>
          <div className="sk" style={{width:"100%",paddingBottom:"148%",borderRadius:8}}/>
          <div className="sk" style={{width:"75%",height:10,marginTop:6}}/>
        </div>
      ))}
    </div>
  );
}

function SecHead({title, onMore}) {
  return (
    <div className="shead">
      <span className="shead-t">{title}</span>
      {onMore && (
        <button className="shead-a tap" onClick={onMore}>
          See all <Icon name="chevR" size={14} color="currentColor"/>
        </button>
      )}
    </div>
  );
}

/* ─── Playability badge ──────────────────────────────────────── */
function PlayBadge({isPlayable}) {
  return (
    <span className="badge" style={{
      position:"absolute", bottom:6, left:6,
      background: isPlayable ? "rgba(22,163,74,.9)" : "rgba(80,80,80,.75)",
      color: "#fff",
    }}>
      {isPlayable ? "Watch Now" : "Coming Soon"}
    </span>
  );
}

/* ─── Cards ──────────────────────────────────────────────────── */
function PosterCard({item, onClick, w=130, delay=0}) {
  const h = Math.round(w * 1.48);
  return (
    <div className="card anim" style={{width:w, flexShrink:0, animationDelay:delay+"ms"}}
      onClick={() => onClick && onClick(item)}>
      <div style={{position:"relative", width:w, height:h}}>
        <ImgF src={item.poster} alt={item.title}
          style={{width:w, height:h}} radius={8} fallback={item.title?.[0]}/>
        <span className="badge" style={{
          position:"absolute", top:6, left:6,
          background: item.type==="tv" ? "rgba(16,185,129,.9)" : "rgba(229,9,20,.9)",
          color: "#fff",
        }}>{item.type==="tv" ? "TV" : "Film"}</span>
        {item.rating > 0 && (
          <div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,.78)",borderRadius:5,padding:"2px 6px"}}>
            <Star rating={item.rating} size={10}/>
          </div>
        )}
        <PlayBadge isPlayable={!!item.isPlayable}/>
      </div>
      <p style={{fontWeight:800, fontSize:12, color:"var(--text)", marginTop:7, lineHeight:1.3,
        overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical",
        letterSpacing:"-.01em"}}>
        {item.title}
      </p>
      {item.year && <p style={{fontSize:11, fontWeight:600, color:"var(--t3)", marginTop:2}}>{item.year}</p>}
    </div>
  );
}

function GridCard({item, onClick}) {
  const [err, setErr] = useState(false);
  return (
    <div className="card" onClick={() => onClick && onClick(item)}>
      <div style={{width:"100%",paddingBottom:"148%",position:"relative",background:"var(--bg3)",borderRadius:8,overflow:"hidden"}}>
        {item.poster && !err
          ? <img src={item.poster} alt={item.title||""} onError={() => setErr(true)} loading="lazy"
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontWeight:900,fontSize:22,color:"var(--bg4)"}}>{(item.title||"?")[0]}</span>
            </div>
        }
        <span className="badge" style={{
          position:"absolute", top:5, left:5,
          background: item.type==="tv" ? "rgba(16,185,129,.9)" : "rgba(229,9,20,.9)",
          color:"#fff",
        }}>{item.type==="tv" ? "TV" : "Film"}</span>
        {item.rating > 0 && (
          <div style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,.78)",borderRadius:4,padding:"2px 5px"}}>
            <Star rating={item.rating} size={9}/>
          </div>
        )}
        <PlayBadge isPlayable={!!item.isPlayable}/>
      </div>
      <p style={{fontWeight:800, fontSize:11, color:"var(--text)", marginTop:5,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
        {item.title}
      </p>
      {item.year && <p style={{fontSize:10, fontWeight:600, color:"var(--t3)", marginTop:1}}>{item.year}</p>}
    </div>
  );
}

/* ─── VIDEO PLAYER ───────────────────────────────────────────── */
function VideoPlayer({streamUrl, downloadUrl, downloads=[], title, onBack, onDetail, item}) {
  const videoRef     = useRef(null);
  const hlsRef       = useRef(null);
  const containerRef = useRef(null);
  const [state,    setState]  = useState("loading");
  const [paused,   setPaused] = useState(false);
  const [duration, setDur]    = useState(0);
  const [current,  setCurrent] = useState(0);

  const isHLS = streamUrl && streamUrl.includes(".m3u8");

  function loadDirect(url) {
    const v = videoRef.current; if (!v) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    v.src = url; setState("playing"); v.play().catch(() => {});
  }

  useEffect(() => {
    setState("loading");
    const v = videoRef.current;
    if (!v || !streamUrl) { setState("error"); return; }
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (isHLS && typeof window !== "undefined" && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker:true, fragLoadingTimeOut:20000, manifestLoadingTimeOut:10000 });
      hlsRef.current = hls;
      hls.loadSource(streamUrl); hls.attachMedia(v);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => { setState("playing"); v.play().catch(() => {}); });
      hls.on(window.Hls.Events.ERROR, (_, data) => { if (data.fatal) loadDirect(streamUrl); });
    } else if (v.canPlayType("application/vnd.apple.mpegurl") && isHLS) {
      v.src = streamUrl; setState("playing"); v.play().catch(() => {});
    } else {
      loadDirect(streamUrl);
    }
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [streamUrl]);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const T  = () => { setCurrent(v.currentTime); if (v.duration) setDur(v.duration); };
    const P  = () => { setState("playing"); setPaused(false); };
    const Pa = () => setPaused(true);
    const E  = () => setState("error");
    v.addEventListener("timeupdate", T); v.addEventListener("play", P);
    v.addEventListener("pause", Pa);    v.addEventListener("error", E);
    return () => {
      v.removeEventListener("timeupdate", T); v.removeEventListener("play", P);
      v.removeEventListener("pause", Pa);     v.removeEventListener("error", E);
    };
  }, []);

  function togglePlay() { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); }
  function seek(e) {
    const v = videoRef.current; if (!v || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * duration;
  }
  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }
  function toggleFs() {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  return (
    <div style={{background:"#000",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        background:"rgba(0,0,0,.95)",borderBottom:"1px solid rgba(255,255,255,.08)",
        position:"sticky",top:0,zIndex:50}}>
        <button className="tap" onClick={onBack}
          style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <p style={{flex:1,fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",
          whiteSpace:"nowrap"}}>{title}</p>
        {onDetail && (
          <button className="tap" onClick={() => onDetail?.(item)}
            style={{display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,
              color:"var(--t2)",background:"none",border:"none"}}>
            <Icon name="info" size={14} color="currentColor"/>Info
          </button>
        )}
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noreferrer" download className="tap"
            style={{display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:700,color:"var(--t2)"}}>
            <Icon name="download" size={14} color="currentColor"/>Download
          </a>
        )}
      </div>

      {/* Video */}
      <div ref={containerRef} style={{width:"100%",aspectRatio:"16/9",background:"#000",position:"relative"}}>
        <video ref={videoRef} style={{width:"100%",height:"100%",display:"block"}}
          playsInline controls={false} onClick={togglePlay}/>

        {state === "loading" && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",background:"#000",zIndex:2}}>
            <Icon name="spinner" size={42} color="var(--red)"/>
            <p style={{marginTop:14,fontSize:14,fontWeight:700,color:"rgba(255,255,255,.6)"}}>
              Loading stream…
            </p>
            <p style={{marginTop:6,fontSize:12,fontWeight:600,color:"rgba(255,255,255,.35)",textAlign:"center",maxWidth:240,lineHeight:1.5}}>
              Served from Internet Archive · Public domain
            </p>
          </div>
        )}
        {state === "error" && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:14,background:"#000",zIndex:2}}>
            <Icon name="alert" size={40} color="var(--red)"/>
            <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,.7)"}}>Stream unavailable</p>
            {downloadUrl && (
              <a href={downloadUrl} target="_blank" rel="noreferrer"
                className="pbtn r tap" style={{textDecoration:"none"}}>
                <Icon name="download" size={14} color="#fff"/>Download Instead
              </a>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:10,
          background:"linear-gradient(transparent,rgba(0,0,0,.9))",padding:"28px 14px 10px"}}>
          <div style={{height:4,background:"rgba(255,255,255,.25)",borderRadius:2,
            cursor:"pointer",marginBottom:10}} onClick={seek}>
            <div style={{height:"100%",background:"var(--red)",borderRadius:2,
              width: duration ? `${(current/duration)*100}%` : "0%",
              pointerEvents:"none", transition:"width .1s"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="tap" onClick={togglePlay}
              style={{width:36,height:36,background:"none",border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
              <Icon name={paused ? "play" : "pause"} size={20} color="#fff"/>
            </button>
            <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.7)"}}>
              {fmt(current)} / {fmt(duration)}
            </span>
            <div style={{flex:1}}/>
            <span style={{fontSize:10,fontWeight:800,color:"#22c55e",
              background:"rgba(22,163,74,.2)",padding:"2px 7px",borderRadius:4,
              border:"1px solid rgba(22,163,74,.3)"}}>
              Archive.org
            </span>
            <button className="tap" onClick={toggleFs}
              style={{background:"none",border:"none",color:"rgba(255,255,255,.7)"}}>
              <Icon name="full" size={17} color="currentColor"/>
            </button>
          </div>
        </div>
      </div>

      {/* Download options */}
      {downloads.length > 0 && (
        <div style={{padding:"12px 14px",background:"var(--bg2)",borderBottom:"1px solid var(--line)"}}>
          <p style={{fontWeight:800,fontSize:13,marginBottom:8}}>Download Quality</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {downloads.map((d, i) => (
              <a key={i} href={d.url} target="_blank" rel="noreferrer" download
                className="pbtn gr tap" style={{fontSize:12,padding:"6px 12px",textDecoration:"none"}}>
                <Icon name="download" size={12} color="currentColor"/>
                {d.format}{d.size && " · " + d.size}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Info below player */}
      {item && (
        <div style={{padding:"14px",background:"var(--bg)",flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <Icon name="legal" size={13} color="var(--green)"/>
            <span style={{fontSize:11,fontWeight:800,color:"var(--green)"}}>
              Public Domain · Free to Watch & Download
            </span>
          </div>
          <h2 style={{fontWeight:900,fontSize:18,letterSpacing:"-.02em",marginBottom:6}}>
            {item.title}
          </h2>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",marginBottom:10,fontSize:12,color:"var(--t2)"}}>
            {item.rating > 0 && <Star rating={item.rating} size={12}/>}
            {item.year && <span style={{fontWeight:700}}>{item.year}</span>}
            {(item.genres||[]).slice(0,2).map(g => (
              <span key={g} className="badge"
                style={{background:"var(--bg3)",color:"var(--t2)"}}>{g}</span>
            ))}
          </div>
          {item.overview && (
            <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",lineHeight:1.65,
              overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
              {item.overview}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── HERO ────────────────────────────────────────────────────── */
function Hero({items, onPlay, onDetail, onWatchlist}) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const item = items[idx];

  useEffect(() => {
    if (!items.length) return;
    timerRef.current = setInterval(() => setIdx(i => (i+1) % Math.min(items.length, 6)), 5500);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  if (!item) return <div className="sk" style={{width:"100%",height:480}}/>;
  const inWL = (S.get("cv_wl")||[]).some(x => x.id === item.id);

  return (
    <div style={{position:"relative",width:"100%",height:480,overflow:"hidden"}} className="fade">
      {item.backdrop && (
        <img key={item.id} src={item.backdrop} alt="" loading="eager"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
            animation:"cvFade .7s ease"}}/>
      )}
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(180deg,rgba(15,15,15,.15) 0%,rgba(15,15,15,.65) 45%,rgba(15,15,15,1) 100%)"}}/>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(90deg,rgba(15,15,15,.85) 0%,transparent 60%)"}}/>

      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 28px"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px 10px",marginBottom:10,alignItems:"center"}}>
          <span className="badge" style={{
            background: item.type==="tv" ? "rgba(16,185,129,.9)" : "rgba(229,9,20,.9)",
            color:"#fff",
          }}>{item.type==="tv" ? "SERIES" : "FILM"}</span>
          {item.year && <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)"}}>{item.year}</span>}
          {item.rating > 0 && <Star rating={item.rating} size={13}/>}
          {(item.genres||[]).slice(0,2).map(g => (
            <span key={g} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)"}}>{g}</span>
          ))}
        </div>

        <h1 key={item.title}
          style={{fontWeight:900,fontSize:32,letterSpacing:"-.03em",lineHeight:1.1,
            color:"#fff",marginBottom:10,maxWidth:440,animation:"cvUp .5s ease"}}>
          {item.title}
        </h1>

        {item.overview && (
          <p style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.65)",lineHeight:1.65,
            marginBottom:18,maxWidth:380,overflow:"hidden",display:"-webkit-box",
            WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
            {item.overview}
          </p>
        )}

        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="pbtn r tap" onClick={() => onPlay?.(item)}>
            <Icon name="play" size={14} color="#fff"/>Play Now
          </button>
          <button className="pbtn dk tap" onClick={() => onDetail?.(item)}>
            <Icon name="info" size={14} color="#fff"/>More Info
          </button>
          <button className="pbtn dk tap" onClick={() => onWatchlist?.(item)}>
            <Icon name={inWL ? "check" : "plus"} size={14} color="#fff"/>
            {inWL ? "In List" : "Watchlist"}
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{position:"absolute",top:16,right:16,display:"flex",gap:5}}>
        {items.slice(0,6).map((_,i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{width:i===idx?22:6,height:6,borderRadius:3,
              background:i===idx?"var(--red)":"rgba(255,255,255,.35)",
              border:"none",cursor:"pointer",transition:"all .3s ease"}}/>
        ))}
      </div>
    </div>
  );
}

/* ─── HOME PAGE ───────────────────────────────────────────────── */
function HomePage({onPlay, onDetail, onShowAll, lang, onGoToCourses, onGoToShorts}) {
  const [data,    setData]  = useState(null);
  const [cat,     setCat]   = useState("trending");
  const [loading, setLoad]  = useState(true);
  const [error,   setError] = useState(false);
  const [aiQ,     setAiQ]   = useState("");
  const [aiRes,   setAiRes] = useState("");
  const [aiLoad,  setAiLoad]= useState(false);

  const addWL = item => {
    const wl = S.get("cv_wl")||[];
    if (!wl.find(x => x.id === item.id)) S.set("cv_wl", [item, ...wl]);
  };

  function loadData(force=false) {
    const cacheKey = "home_" + (lang||"en");
    // Serve cached data instantly — no spinner on repeat nav
    const cached = PAGE_CACHE.get(cacheKey);
    if (cached && !force) { setData(cached); setLoad(false); return; }
    setLoad(true); setError(false);
    fetch("/api/home-data" + (lang ? "?lang=" + lang : ""))
      .then(r => r.json())
      .then(d => { PAGE_CACHE.set(cacheKey, d, 15 * 60 * 1000); setData(d); setLoad(false); })
      .catch(() => { setError(true); setLoad(false); });
  }

  useEffect(() => { loadData(); }, [lang]);

  function askAI() {
    if (!aiQ.trim()) return;
    setAiLoad(true); setAiRes("");
    fetch("/api/groq", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"recommend", payload:{query:aiQ}}),
    }).then(r => r.json()).then(d => { setAiRes(d.text||""); setAiLoad(false); })
      .catch(() => setAiLoad(false));
  }

  const catTitles = {
    trending:"Trending Now", movies:"Popular Movies", series:"Popular Series",
    nollywood:"Nollywood", bollywood:"Bollywood", kdrama:"K-Drama",
    anime:"Anime", french:"French Cinema",
  };
  const featured    = cat === "series" ? (data?.tv||[]) : (data?.movies||[]);
  const heroItems   = (data?.trending||[]).filter(x => x.backdrop||x.poster).slice(0,6);
  const continueW   = S.get("cv_hist")||[];

  return (
    <div style={{background:"var(--bg)",paddingBottom:28}}>
      {error && <ErrorState message="Unable to load content right now." onRetry={loadData}/>}
      {!error && (<>

      {/* ── FlonexTV Cinematic Brand Hero ──────────────────── */}
      {/* Particles fly in from different directions and assemble */}
      {/* into the FlonexTV wordmark — pure CSS, mobile-safe     */}
      <div style={{
        background:"linear-gradient(170deg,#080000 0%,#140202 60%,#0F0F0F 100%)",
        padding:"26px 20px 20px",
        textAlign:"center",
        borderBottom:"1px solid rgba(229,9,20,.1)",
        marginBottom:4,
        overflow:"hidden",
        position:"relative",
      }}>
        {/* Background ambient glow */}
        <div style={{position:"absolute",inset:0,
          background:"radial-gradient(ellipse 60% 80% at 50% 60%, rgba(229,9,20,.06) 0%, transparent 70%)",
          pointerEvents:"none"}}/>

        {/* Particle fragments — float in and merge */}
        {/* Each is a small film/play/content element */}
        {[
          {shape:"rect",  w:18,h:13,r:3,  bg:"rgba(229,9,20,.35)",   anim:"flxP1", delay:"0ms",   top:"15%", left:"8%"},
          {shape:"circle",w:10,h:10,r:5,  bg:"rgba(255,255,255,.15)",anim:"flxP2", delay:"80ms",  top:"20%", left:"82%"},
          {shape:"rect",  w:24,h:6,r:2,   bg:"rgba(229,9,20,.25)",   anim:"flxP3", delay:"50ms",  top:"72%", left:"12%"},
          {shape:"tri",   w:14,h:14,      bg:"#E50914",              anim:"flxP4", delay:"120ms", top:"65%", left:"78%"},
          {shape:"rect",  w:8,h:8,r:2,    bg:"rgba(255,255,255,.12)",anim:"flxP5", delay:"20ms",  top:"10%", left:"48%"},
        ].map((p,i)=>(
          <div key={i} style={{
            position:"absolute",
            top:p.top, left:p.left,
            width:p.w, height:p.h,
            borderRadius:p.r||0,
            background:p.shape==="tri" ? "transparent" : p.bg,
            animation:`${p.anim} .9s cubic-bezier(.22,1,.36,1) both`,
            animationDelay:p.delay,
            pointerEvents:"none",
          }}>
            {p.shape==="tri" && (
              <svg width={p.w} height={p.h} viewBox="0 0 14 14">
                <polygon points="0,14 7,0 14,14" fill={p.bg}/>
              </svg>
            )}
          </div>
        ))}

        {/* Assembled wordmark — slides up after particles arrive */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:9,
          marginBottom:10, position:"relative",
          animation:"cvUp .5s cubic-bezier(.22,1,.36,1) .55s both",
        }}>
          {/* Logo mark */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{flexShrink:0}}>
            <circle cx="18" cy="18" r="17" fill="#E50914"/>
            <polygon points="14,11 14,25 26,18" fill="#fff"/>
          </svg>
          {/* Wordmark */}
          <span style={{
            fontWeight:900, fontSize:34, letterSpacing:"-.04em",
            lineHeight:1, color:"#E5E5E5",
          }}>
            Flonex<span style={{color:"#E50914"}}>TV</span>
          </span>
        </div>

        {/* Tagline — fades in last */}
        <p style={{
          fontWeight:800, fontSize:12,
          color:"rgba(255,255,255,.32)",
          letterSpacing:".22em", textTransform:"uppercase",
          animation:"flxTagline 1s ease .95s both",
        }}>
          Stream&nbsp;·&nbsp;Learn&nbsp;·&nbsp;Enjoy
        </p>
      </div>

      {/* ── TMDB Carousel Hero ───────────────────────────────── */}
      <div id="velora-content">
      {loading
        ? <div className="sk" style={{width:"100%",height:480}}/>
        : <Hero items={heroItems} onPlay={onPlay} onDetail={onDetail} onWatchlist={addWL}/>
      }
      </div>

      {/* Continue Watching */}
      {continueW.length > 0 && (
        <div style={{marginTop:24,marginBottom:24}}>
          <div className="shead">
            <span className="shead-t" style={{display:"flex",alignItems:"center",gap:8}}>
              <Icon name="clock" size={17} color="var(--red)"/>Continue Watching
            </span>
          </div>
          <div className="hrow">
            {continueW.slice(0,10).map((item,i) => (
              <div key={item.id+"cw"+i} className="card"
                style={{width:200,flexShrink:0}} onClick={() => onPlay(item)}>
                <div style={{position:"relative"}}>
                  <ImgF src={item.backdrop||item.poster} alt={item.title}
                    style={{width:200,height:112}} radius={8}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                    justifyContent:"center",borderRadius:8,background:"rgba(0,0,0,.35)"}}>
                    <div style={{width:42,height:42,borderRadius:"50%",
                      background:"rgba(229,9,20,.9)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon name="play" size={15} color="#fff"/>
                    </div>
                  </div>
                </div>
                <p style={{fontWeight:800,fontSize:12,marginTop:6,lineHeight:1.3,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Because You Watched — personalised row ─────────── */}
      {(() => {
        const hist = S.get("cv_hist") || [];
        if (hist.length < 2) return null;
        // Get genres from recent watch history
        const watched = hist.slice(0, 5);
        const genre   = watched.flatMap(m => m.genres||[]).find(g => g) || "";
        const recs    = (data?.trending||[])
          .filter(m => !hist.find(h => h.id === m.id) && (m.genres||[]).includes(genre))
          .slice(0, 10);
        if (!recs.length || !genre) return null;
        return (
          <div style={{marginBottom:26}}>
            <div className="shead">
              <span className="shead-t">Because you watched</span>
              <span style={{fontSize:11,fontWeight:700,color:"var(--red)",marginLeft:8}}>{genre}</span>
            </div>
            <div className="hrow">
              {recs.map((m,i)=>(
                <div key={m.id} className="card anim" style={{width:120,flexShrink:0}}
                  onClick={()=>onDetail(m)}>
                  <div style={{position:"relative"}}>
                    <ImgF src={m.poster} alt={m.title} style={{width:120,height:170}} radius={8}/>
                    <div style={{position:"absolute",inset:0,borderRadius:8,
                      background:"linear-gradient(180deg,transparent 50%,rgba(0,0,0,.85))"}}/>
                    <p style={{position:"absolute",bottom:6,left:6,right:6,
                      fontWeight:800,fontSize:10,lineHeight:1.3,color:"#fff",
                      overflow:"hidden",display:"-webkit-box",
                      WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                      {m.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── New This Week — badge on fresh TMDB content ──────── */}
      {data?.nowPlaying?.length > 0 && (
        <div style={{marginBottom:26}}>
          <div className="shead">
            <span className="shead-t" style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",
                background:"var(--red)",animation:"cvPulse 1.2s infinite"}}/>
              New This Week
            </span>
            <button className="shead-a tap" onClick={()=>onShowAll("New This Week", data.nowPlaying)}>
              See all
            </button>
          </div>
          <div className="hrow">
            {data.nowPlaying.slice(0,10).map((m,i)=>(
              <div key={m.id} className="card anim" style={{width:120,flexShrink:0,
                animationDelay:i*20+"ms"}} onClick={()=>onDetail(m)}>
                <div style={{position:"relative"}}>
                  <ImgF src={m.poster} alt={m.title} style={{width:120,height:170}} radius={8}/>
                  <span style={{position:"absolute",top:5,left:5,
                    background:"#E50914",color:"#fff",fontSize:8,fontWeight:900,
                    padding:"2px 6px",borderRadius:4,letterSpacing:".04em"}}>NEW</span>
                  <div style={{position:"absolute",inset:0,borderRadius:8,
                    background:"linear-gradient(180deg,transparent 50%,rgba(0,0,0,.85))"}}/>
                  <p style={{position:"absolute",bottom:6,left:6,right:6,
                    fontWeight:800,fontSize:10,lineHeight:1.3,color:"#fff",
                    overflow:"hidden",display:"-webkit-box",
                    WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                    {m.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Course Learning Path — quick progress widget ──────── */}
      {(() => {
        const allProgress = Object.entries(S.get("fx_courses_done")||{}).length > 0
          || Object.keys(Object.fromEntries(
              Object.entries(typeof S.get === "function" ? {} : {}).filter(([k]) => k.startsWith("fx_prog_"))
             )).length > 0;
        const inProgress = [];
        ["course-web-dev","course-python","course-business","course-faith",
         "course-marketing","course-health","course-frontend","course-backend",
         "course-git","course-freelance","course-branding","course-video-edit",
         "course-content"].forEach(id => {
          const p = S.get("fx_prog_"+id);
          if (p && p.percent_complete > 0 && p.percent_complete < 100) {
            inProgress.push({id, pct: p.percent_complete});
          }
        });
        if (!inProgress.length) return null;
        return (
          <div style={{margin:"0 16px 20px",background:"rgba(59,130,246,.07)",
            border:"1px solid rgba(59,130,246,.15)",borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontWeight:900,fontSize:13,marginBottom:10}}>
              Continue Your Learning Path
            </p>
            {inProgress.slice(0,2).map(({id,pct})=>(
              <div key={id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:"var(--t2)",
                    textTransform:"capitalize"}}>
                    {id.replace("course-","").replace(/-/g," ")}
                  </span>
                  <span style={{fontSize:11,fontWeight:800,color:"#3b82f6"}}>{pct}%</span>
                </div>
                <div style={{height:4,borderRadius:2,background:"var(--bg3)"}}>
                  <div style={{height:4,borderRadius:2,background:"#3b82f6",
                    width:pct+"%",transition:"width .3s"}}/>
                </div>
              </div>
            ))}
            <button className="pbtn gr tap"
              style={{marginTop:10,fontSize:12,padding:"7px 14px"}}
              onClick={onGoToCourses}>
              Resume Course
            </button>
          </div>
        );
      })()}

      {/* Category tabs */}
      <div style={{padding:"0 0 18px",borderBottom:"1px solid var(--line)",marginBottom:20}}>
        <div className="hrow" style={{gap:8,padding:"4px 16px"}}>
          {HOME_CATS.map(c => (
            <button key={c.key} className={"ctab"+(cat===c.key?" on":"")}
              onClick={() => setCat(c.key)}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Trending row */}
      {cat === "trending" && (
        <div style={{marginBottom:26}}>
          <SecHead title="Top Picks"
            onMore={() => data && onShowAll("Top Picks", data.trending||[])}/>
          {loading ? <SkelCards count={6}/> : (
            <div className="hrow">
              {(data?.trending||[]).map((m,i) => (
                <PosterCard key={m.id} item={m} onClick={onDetail} delay={i*18}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Now Playing */}
      {cat === "movies" && data?.nowPlaying?.length > 0 && (
        <div style={{marginBottom:26}}>
          <SecHead title="Now Playing"
            onMore={() => onShowAll("Now Playing", data.nowPlaying||[])}/>
          <div className="hrow">
            {data.nowPlaying.map((m,i) => (
              <PosterCard key={m.id} item={m} onClick={onDetail} delay={i*18}/>
            ))}
          </div>
        </div>
      )}

      {/* Main section */}
      <div style={{marginBottom:26}}>
        <SecHead title={catTitles[cat]||"Popular"}
          onMore={() => featured && onShowAll(catTitles[cat]||"Popular", featured)}/>
        {loading ? <SkelGrid count={9}/> : (
          <div className="g3">
            {(featured||[]).slice(0,12).map(m => (
              <GridCard key={m.id} item={m} onClick={onDetail}/>
            ))}
          </div>
        )}
      </div>

      {/* Top Rated */}
      {(cat === "trending" || cat === "movies") && (
        <div style={{marginBottom:26}}>
          <SecHead title="Top Rated All Time"
            onMore={() => data && onShowAll("Top Rated All Time", data.topRated||[])}/>
          {loading ? <SkelCards count={6}/> : (
            <div className="hrow">
              {(data?.topRated||[]).map((m,i) => (
                <PosterCard key={m.id} item={m} onClick={onDetail} delay={i*18}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Series */}
      {cat !== "series" && (data?.tv||[]).length > 0 && (
        <div style={{marginBottom:26}}>
          <SecHead title="Popular Series"
            onMore={() => onShowAll("Popular Series", data?.tv||[])}/>
          <div className="g3">
            {(data?.tv||[]).slice(0,9).map(m => (
              <GridCard key={m.id} item={m} onClick={onDetail}/>
            ))}
          </div>
        </div>
      )}

      {/* ── International Content Rows (YouTube) ──────────────── */}
      {[
        {key:"nollywoodMovies",  title:"Nollywood Picks"},
        {key:"christianMovies",  title:"Faith & Inspiration"},
        {key:"bollywoodMovies",  title:"Bollywood Hits"},
        {key:"koreanMovies",     title:"Korean Cinema"},
        {key:"hollywoodMovies",  title:"Hollywood Selections"},
        {key:"yorubaMovies",     title:"Yoruba Films"},
        {key:"trendingShorts",   title:"Comedy Shorts", w:200},
      ].map(({key, title, w}) =>
        (data?.[key]||[]).length > 0 ? (
          <div key={key} style={{marginBottom:26}}>
            <SecHead title={title}
              onMore={() => onShowAll(title, data[key]||[])}/>
            <div className="hrow">
              {(data[key]||[]).map((m,i) => (
                <YouTubeCard key={m.id||m.cvId} item={m} w={w||160} onClick={onPlay} delay={i*18}/>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* ── YouTube key missing tip ──────────────────────────── */}
      {!data?.hasYouTube && !loading && (
        <div style={{margin:"0 16px 26px",padding:"14px 16px",
          background:"var(--bg2)",border:"1px solid var(--line)",borderRadius:10}}>
          <p style={{fontSize:12,fontWeight:700,color:"var(--t3)",lineHeight:1.7}}>
            Add <strong style={{color:"var(--text)"}}>YOUTUBE_API_KEY</strong> in Vercel
            Environment Variables to unlock Nollywood, Bollywood, Korean, Hollywood, and
            Comedy Shorts content sections.
          </p>
        </div>
      )}

      {/* AI Panel */}
      <div style={{margin:"0 16px 26px"}}>
        <div className="ai-panel">
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:34,height:34,borderRadius:9,
              background:"rgba(229,9,20,.2)",display:"flex",
              alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="ai" size={16} color="var(--red)"/>
            </div>
            <div>
              <p style={{fontWeight:900,fontSize:14,letterSpacing:"-.01em"}}>CineVault AI</p>
              <p style={{fontSize:11,fontWeight:600,color:"var(--t3)"}}>Powered by Groq · llama-3.3-70b</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input className="field" value={aiQ}
              onChange={e => setAiQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && askAI()}
              placeholder='"scary but funny", "like Inception", "family movie"'
              style={{flex:1,padding:"9px 12px",fontSize:13}}/>
            <button className="pbtn r" onClick={askAI} disabled={aiLoad}
              style={{padding:"9px 14px",flexShrink:0}}>
              {aiLoad ? <Icon name="spinner" size={15} color="#fff"/> : "Ask AI"}
            </button>
          </div>
          {aiRes && (
            <div style={{marginTop:12,background:"rgba(0,0,0,.5)",borderRadius:10,
              padding:"10px 14px",border:"1px solid var(--line)"}}>
              <p style={{fontSize:13,fontWeight:600,color:"var(--t2)",
                lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiRes}</p>
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </>)}
    </div>
  );
}

/* ─── DETAIL PAGE ─────────────────────────────────────────────── */
function DetailPage({item, onPlay, onBack, onDetail}) {
  const [detail,     setDetail]   = useState(null);
  const [showTrailer,setShowTrailer] = useState(false);
  const [loading, setLoad]    = useState(true);
  const [tab,     setTab]     = useState("about");
  const [season,  setSeason]  = useState(1);
  const [episodes,setEps]     = useState(null);
  const [epLoad,  setEpLoad]  = useState(false);
  const [inWL,    setInWL]    = useState(false);
  const [aiSyn,   setAiSyn]   = useState("");
  const [aiTrivia,setTrivia]  = useState("");
  const [aiTab,   setAiTab]   = useState("synopsis");
  const [trivLoad,setTrivLoad]= useState(false);

  useEffect(() => { setInWL((S.get("cv_wl")||[]).some(x => x.id === item.id)); }, [item.id]);

  useEffect(() => {
    setLoad(true); setDetail(null); setAiSyn(""); setTrivia(""); setTab("about");
    const id = item.cvId || ("tmdb:" + item.id);
    fetch("/api/movie/" + encodeURIComponent(id))
      .then(r => r.json()).then(d => { setDetail(d); setLoad(false); })
      .catch(() => setLoad(false));
  }, [item.id, item.cvId]);

  useEffect(() => {
    if (!detail?.overview) return;
    fetch("/api/groq", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"synopsis", payload:{
        title:detail.title, year:detail.year,
        genres:(detail.genres||[]).join(", "), overview:detail.overview,
      }}),
    }).then(r => r.json()).then(d => { if (d.text && !d.text.startsWith("⚠")) setAiSyn(d.text); })
      .catch(() => {});
  }, [detail?.id]);

  useEffect(() => {
    if (!detail || detail.type !== "tv") return;
    setEpLoad(true);
    const id = item.cvId || ("tmdb:" + item.id);
    fetch("/api/tv/" + encodeURIComponent(id) + "?s=" + season)
      .then(r => r.json()).then(d => { setEps(d.episodes||[]); setEpLoad(false); })
      .catch(() => setEpLoad(false));
  }, [detail?.id, season]);

  function fetchTrivia() {
    if (aiTrivia || !detail) return;
    setTrivLoad(true);
    fetch("/api/groq", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"trivia", payload:{title:detail.title, year:detail.year}}),
    }).then(r => r.json()).then(d => { setTrivia(d.text||""); setTrivLoad(false); })
      .catch(() => setTrivLoad(false));
  }

  function toggleWL() {
    const wl = S.get("cv_wl")||[];
    if (inWL) { S.set("cv_wl", wl.filter(x => x.id !== item.id)); setInWL(false); }
    else       { S.set("cv_wl", [item,...wl]); setInWL(true); }
  }

  const d         = detail;
  const bg        = d?.backdrop  || item.backdrop || item.poster;
  const poster    = d?.poster    || item.poster;
  const isPlayable= d ? d.isPlayable : item.isPlayable;

  return (
    <div style={{background:"var(--bg)",minHeight:"100%",paddingBottom:32}}>
      {/* Backdrop */}
      <div style={{position:"relative",width:"100%",height:280}}>
        {bg && <img src={bg} alt="" loading="eager"
          style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,rgba(15,15,15,.3) 0%,rgba(15,15,15,1) 100%)"}}/>
        <button className="tap" onClick={onBack}
          style={{position:"absolute",top:16,left:16,width:38,height:38,borderRadius:"50%",
            background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",backdropFilter:"blur(8px)"}}>
          <Icon name="back" size={18} color="#fff"/>
        </button>
        <button className="tap"
          onClick={() => navigator.share?.({title:item.title, url:window.location.href})}
          style={{position:"absolute",top:16,right:16,width:38,height:38,borderRadius:"50%",
            background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",
            color:"#fff",backdropFilter:"blur(8px)"}}>
          <Icon name="share" size={16} color="#fff"/>
        </button>
      </div>

      {/* Info card */}
      <div style={{padding:"0 16px",marginTop:-60,position:"relative",zIndex:2}}>
        <div style={{display:"flex",gap:14}}>
          <ImgF src={poster} alt={item.title}
            style={{width:100,height:148,flexShrink:0}} radius={8} fallback={item.title?.[0]}/>
          <div style={{flex:1,paddingTop:64}}>
            <h1 style={{fontWeight:900,fontSize:20,letterSpacing:"-.02em",
              lineHeight:1.2,marginBottom:6}}>
              {d ? d.title : item.title}
            </h1>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",
              marginBottom:10,fontSize:12,color:"var(--t2)"}}>
              {d && <Star rating={d.rating} size={12}/>}
              {(d||item).year && <span style={{fontWeight:700}}>{(d||item).year}</span>}
              {d?.runtime && <span style={{fontWeight:700}}>{d.runtime} min</span>}
              {d?.country && <span style={{fontWeight:700}}>{d.country}</span>}
              {(d?.genres||[]).slice(0,2).map(g => (
                <span key={g} className="badge" style={{background:"var(--bg3)",color:"var(--t2)"}}>{g}</span>
              ))}
            </div>
            {/* Availability */}
            <div style={{marginBottom:10}}>
              <span className="badge" style={{
                background: isPlayable ? "rgba(22,163,74,.15)" : "rgba(100,100,100,.15)",
                color:      isPlayable ? "#22c55e" : "var(--t3)",
                border:     `1px solid ${isPlayable ? "rgba(22,163,74,.3)" : "var(--line)"}`,
              }}>
                {isPlayable ? "Watch Now Available" : "Coming Soon"}
              </span>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className={`pbtn tap ${isPlayable?"r":"gr"}`}
                onClick={() => onPlay?.(d||item)}>
                <Icon name="play" size={13} color={isPlayable?"#fff":"currentColor"}/>
                {isPlayable ? "Play Now" : "Remind Me"}
              </button>
              <button className="pbtn gr tap" onClick={toggleWL}>
                <Icon name={inWL?"check":"plus"} size={13} color="currentColor"/>
                {inWL ? "Saved" : "Save"}
              </button>
              {d?.trailerKey && (
                <button className="pbtn gr tap"
                  onClick={()=>setShowTrailer(t=>!t)}>
                  <Icon name="play" size={13} color="currentColor"/>
                  {showTrailer?"Hide Trailer":"Trailer"}
                </button>
              )}
              {d?.downloadUrl && (
                <a href={d.downloadUrl} target="_blank" rel="noreferrer" download
                  className="pbtn g tap" style={{textDecoration:"none"}}>
                  <Icon name="download" size={13} color="#fff"/>Download
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline Trailer Player ───────────────────────────────── */}
      {showTrailer && d?.trailerKey && (
        <div style={{padding:"0 16px 16px"}}>
          <div style={{width:"100%",borderRadius:10,overflow:"hidden",
            background:"#000",aspectRatio:"16/9"}}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${d.trailerKey}?autoplay=1&rel=0&modestbranding=1&fs=1`}
              style={{width:"100%",height:"100%",border:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen={true}
              title={`${d?.title||""} — Official Trailer`}
            />
          </div>
        </div>
      )}

      {/* ── Where to Watch Full Movie ───────────────────────────── */}
      {!isPlayable && d && (
        <div style={{margin:"0 16px 16px",background:"rgba(255,255,255,.04)",
          border:"1px solid rgba(255,255,255,.09)",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontWeight:800,fontSize:13,marginBottom:10,color:"var(--t2)"}}>
            Where to Watch Full Movie
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {
                name:"Netflix",
                url:"https://netflix.com",
                logo:<svg width="52" height="14" viewBox="0 0 111 30" fill="none">
                  <path d="M0 0h12l11.5 24.7V0h11.5v30H23L11.5 5.3V30H0zm48 0h11.5v30H48zm25 0l11.4 30H72L60.7 0H73zM84 0h11.5l-8 20.7L95.5 30H84L72.5 0H84z" fill="#E50914"/>
                </svg>,
              },
              {
                name:"Amazon Prime Video",
                url:"https://primevideo.com",
                logo:<svg width="60" height="18" viewBox="0 0 120 34" fill="none">
                  <text x="0" y="22" fill="#00A8E1" fontSize="16" fontWeight="900" fontFamily="Arial,sans-serif">prime</text>
                  <text x="60" y="22" fill="white" fontSize="11" fontWeight="600" fontFamily="Arial,sans-serif">video</text>
                  <path d="M0 28 Q60 36 120 28" stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>,
              },
              {
                name:"Disney+",
                url:"https://disneyplus.com",
                logo:<svg width="52" height="18" viewBox="0 0 90 30" fill="none">
                  <text x="0" y="22" fill="white" fontSize="20" fontWeight="900" fontFamily="serif" fontStyle="italic">Disney</text>
                  <text x="72" y="15" fill="#0063E5" fontSize="14" fontWeight="900" fontFamily="Arial,sans-serif">+</text>
                </svg>,
              },
              {
                name:"Apple TV+",
                url:"https://tv.apple.com",
                logo:<svg width="52" height="16" viewBox="0 0 100 30" fill="none">
                  <path d="M22 5c-3.5 0-6 2-7 4.5C14 7 11.5 5 8 5 3 5 0 9 0 13.5c0 7 8 13.5 14.5 17 .3.1.7.1 1 0C22 27 30 20.5 30 13.5 30 9 27 5 22 5z" fill="white"/>
                  <text x="34" y="21" fill="white" fontSize="14" fontWeight="700" fontFamily="-apple-system,sans-serif">TV+</text>
                </svg>,
              },
              {
                name:"Max (HBO)",
                url:"https://max.com",
                logo:<svg width="44" height="16" viewBox="0 0 80 30" fill="none">
                  <text x="0" y="22" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial,sans-serif">Max</text>
                </svg>,
              },
            ].map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                style={{display:"flex",alignItems:"center",gap:12,textDecoration:"none",
                  padding:"10px 14px",borderRadius:8,
                  background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
                  transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}>
                <div style={{flexShrink:0,display:"flex",alignItems:"center",
                  minWidth:60,height:18,overflow:"hidden"}}>
                  {s.logo}
                </div>
                <svg style={{marginLeft:"auto",flexShrink:0}} width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                    stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            ))}
          </div>
          <p style={{fontSize:11,fontWeight:600,color:"var(--t3)",marginTop:10,lineHeight:1.5}}>
            Availability varies by region and subscription. These are suggested search links only.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:24,padding:"18px 16px 0",
        borderBottom:"1px solid var(--line)",marginBottom:18}}>
        {[
          {id:"about",   label:"About"},
          {id:"cast",    label:"Cast"},
          {id: detail?.type==="tv" ? "episodes" : "similar",
           label: detail?.type==="tv" ? "Episodes" : "Similar"},
          {id:"ai",      label:"AI"},
        ].map(t => (
          <button key={t.id} className={"stab"+(tab===t.id?" on":"")}
            onClick={() => { setTab(t.id); if (t.id==="ai") fetchTrivia(); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* About */}
      {tab === "about" && (
        <div style={{padding:"0 16px"}}>
          {loading ? (
            <><div className="sk" style={{width:"100%",height:80,marginBottom:14}}/></>
          ) : d ? (
            <>
              {d.tagline && (
                <p style={{fontStyle:"italic",fontWeight:600,color:"var(--t3)",
                  marginBottom:10,fontSize:14}}>"{d.tagline}"</p>
              )}
              {!isPlayable && (
                <div style={{background:"rgba(100,100,100,.08)",border:"1px solid var(--line)",
                  borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",lineHeight:1.65}}>
                    "<strong style={{color:"var(--t2)"}}>{d.title}</strong>" is not yet in our public domain library.
                    Only films explicitly in the public domain can be streamed for free.
                    Use the Trailer button to preview, or search for classic films like Nosferatu, Metropolis, or Night of the Living Dead.
                  </p>
                </div>
              )}
              <p style={{fontSize:14,fontWeight:600,color:"var(--t2)",lineHeight:1.75,marginBottom:18}}>
                {d.overview}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 0"}}>
                {[
                  ["Status",   d.status],
                  ["Runtime",  d.runtime ? d.runtime + " min" : null],
                  ["Language", d.language ? d.language.toUpperCase() : null],
                  ["Seasons",  d.numberOfSeasons ? d.numberOfSeasons + " seasons" : null],
                  ["Episodes", d.numberOfEpisodes ? d.numberOfEpisodes + " ep." : null],
                  ["Votes",    d.voteCount ? d.voteCount.toLocaleString() + " votes" : null],
                ].filter(r => r[1]).map(row => (
                  <div key={row[0]}>
                    <p style={{fontSize:11,fontWeight:700,color:"var(--t3)",
                      textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>
                      {row[0]}
                    </p>
                    <p style={{fontWeight:800,fontSize:13,color:"var(--text)"}}>{row[1]}</p>
                  </div>
                ))}
              </div>
              {d.crew?.length > 0 && (
                <div style={{marginTop:18}}>
                  <p style={{fontWeight:800,fontSize:15,marginBottom:10}}>Crew</p>
                  {d.crew.map(c => (
                    <div key={c.id} style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                      <ImgF src={c.photo} alt={c.name}
                        style={{width:36,height:36}} radius={18} fallback={c.name?.[0]}/>
                      <div>
                        <p style={{fontSize:13,fontWeight:800}}>{c.name}</p>
                        <p style={{fontSize:11,fontWeight:600,color:"var(--t3)"}}>{c.job}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Cast */}
      {tab === "cast" && (
        loading ? <SkelGrid count={8}/> :
        d?.cast?.length > 0 ? (
          <div className="g4">
            {d.cast.map(c => (
              <div key={c.id} style={{textAlign:"center"}}>
                <ImgF src={c.photo} alt={c.name}
                  style={{width:"100%",paddingBottom:"130%",borderRadius:8,position:"relative"}}
                  fallback={c.name?.[0]}/>
                <p style={{fontSize:11,fontWeight:800,color:"var(--text)",marginTop:5,
                  lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.name}
                </p>
                <p style={{fontSize:10,fontWeight:600,color:"var(--t3)",marginTop:1,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.character}
                </p>
              </div>
            ))}
          </div>
        ) : <p style={{padding:"24px 16px",fontWeight:700,color:"var(--t3)"}}>Cast info not available.</p>
      )}

      {/* Episodes */}
      {tab === "episodes" && d?.type === "tv" && (
        <div>
          <div style={{padding:"0 14px",marginBottom:14}}>
            <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
              {Array.from({length:d.numberOfSeasons||1}, (_,i) => {
                const s = i+1;
                return (
                  <button key={s} className={"ctab"+(season===s?" on":"")}
                    onClick={() => setSeason(s)}>Season {s}</button>
                );
              })}
            </div>
          </div>
          {epLoad ? <Spinner/> : (episodes||[]).map(ep => (
            <div key={ep.number} className="tap"
              style={{display:"flex",gap:12,padding:"10px 14px",
                borderBottom:"1px solid var(--line)",cursor:"pointer"}}
              onClick={() => onPlay?.({...(d||item), season, episode:ep.number})}>
              <ImgF src={ep.still} alt={ep.name}
                style={{width:120,height:68,flexShrink:0}} radius={6} fallback={ep.name?.[0]}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:800,fontSize:13,marginBottom:3}}>
                  {ep.number}. {ep.name}
                </p>
                {ep.overview && (
                  <p style={{fontSize:12,fontWeight:600,color:"var(--t3)",lineHeight:1.5,
                    overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                    {ep.overview}
                  </p>
                )}
                <div style={{display:"flex",gap:8,marginTop:4,fontSize:11}}>
                  {ep.runtime && <span style={{fontWeight:700,color:"var(--t3)"}}>{ep.runtime} min</span>}
                  {ep.rating > 0 && <Star rating={ep.rating} size={11}/>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Similar */}
      {tab === "similar" && (
        loading ? <SkelGrid count={6}/> :
        d?.similar?.length > 0
          ? <div className="g3">{d.similar.map(m => <GridCard key={m.id} item={m} onClick={onDetail}/>)}</div>
          : <p style={{padding:"24px 16px",fontWeight:700,color:"var(--t3)"}}>No similar titles found.</p>
      )}

      {/* AI */}
      {tab === "ai" && (
        <div style={{padding:"0 16px"}}>
          <div style={{display:"flex",gap:12,marginBottom:16}}>
            {["synopsis","trivia"].map(t => (
              <button key={t} className={"stab"+(aiTab===t?" on":"")}
                style={{fontSize:13}} onClick={() => setAiTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          {aiTab === "synopsis" && (
            aiSyn
              ? <div style={{background:"rgba(229,9,20,.06)",border:"1px solid rgba(229,9,20,.18)",
                  borderRadius:12,padding:"14px 16px"}}>
                  <p style={{fontSize:11,fontWeight:900,color:"var(--red)",
                    letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>
                    AI Synopsis
                  </p>
                  <p style={{fontSize:14,fontWeight:600,color:"var(--t2)",lineHeight:1.75}}>{aiSyn}</p>
                </div>
              : <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 0",color:"var(--t3)"}}>
                  <Icon name="spinner" size={16} color="var(--red)"/>
                  <p style={{fontSize:13,fontWeight:700}}>Generating AI synopsis…</p>
                </div>
          )}
          {aiTab === "trivia" && (
            trivLoad ? <Spinner/> :
            aiTrivia
              ? <div style={{background:"rgba(229,9,20,.06)",border:"1px solid rgba(229,9,20,.18)",
                  borderRadius:12,padding:"14px 16px"}}>
                  <p style={{fontSize:11,fontWeight:900,color:"var(--red)",
                    letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>
                    Fun Facts
                  </p>
                  <p style={{fontSize:14,fontWeight:600,color:"var(--t2)",
                    lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiTrivia}</p>
                </div>
              : <button className="pbtn r tap" onClick={fetchTrivia}>
                  <Icon name="ai" size={14} color="#fff"/>Generate Trivia
                </button>
          )}
          <AISimilar title={(d||item).title}/>
        </div>
      )}
    </div>
  );
}

function AISimilar({title}) {
  const [res, setRes] = useState("");
  useEffect(() => {
    if (!title) return;
    fetch("/api/groq", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"similar", payload:{title}}),
    }).then(r => r.json()).then(d => setRes(d.text||"")).catch(() => {});
  }, [title]);
  if (!res) return null;
  return (
    <div style={{marginTop:20,background:"rgba(229,9,20,.04)",
      border:"1px solid rgba(229,9,20,.15)",borderRadius:12,padding:"14px 16px"}}>
      <p style={{fontSize:11,fontWeight:900,color:"var(--red)",
        letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>
        You Might Also Like
      </p>
      <p style={{fontSize:13,fontWeight:600,color:"var(--t2)",
        lineHeight:1.8,whiteSpace:"pre-wrap"}}>{res}</p>
    </div>
  );
}

/* ─── SEARCH PAGE ─────────────────────────────────────────────── */
function SearchPage({onPlay, onDetail}) {
  const [q,      setQ]      = useState("");
  const [results,setRes]    = useState([]);
  const [loading,setLoad]   = useState(false);
  const [tab,    setTab]    = useState("all");
  const [recent, setRecent] = useState(() => S.get("cv_recent")||[]);
  const [aiQ,    setAiQ]    = useState("");
  const [aiRes,  setAiRes]  = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  function saveRecent(t) {
    if (!t.trim()) return;
    const u = [t, ...recent.filter(r => r !== t)].slice(0,8);
    setRecent(u); S.set("cv_recent", u);
  }

  useEffect(() => {
    if (!q.trim()) { setRes([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoad(true);
      fetch("/api/search?q=" + encodeURIComponent(q))
        .then(r => r.json()).then(d => { setRes(d.results||[]); setLoad(false); })
        .catch(() => setLoad(false));
    }, 360);
  }, [q]);

  function askAI() {
    if (!aiQ.trim()) return;
    setAiLoad(true); setAiRes("");
    fetch("/api/groq", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({type:"recommend", payload:{query:aiQ}}),
    }).then(r => r.json()).then(d => { setAiRes(d.text||""); setAiLoad(false); })
      .catch(() => setAiLoad(false));
  }

  const BROWSE = [
    {l:"Action",c:"#E50914",b:"#1A0000"},{l:"Comedy",c:"#10B981",b:"#001A10"},
    {l:"Drama",c:"#3B82F6",b:"#00081A"},{l:"Thriller",c:"#8B5CF6",b:"#0C0018"},
    {l:"Sci-Fi",c:"#06B6D4",b:"#001218"},{l:"Horror",c:"#EF4444",b:"#1A0000"},
    {l:"Romance",c:"#EC4899",b:"#18001A"},{l:"Animation",c:"#F97316",b:"#180C00"},
    {l:"Crime",c:"#94A3B8",b:"#0A0A0A"},{l:"Documentary",c:"#A3E635",b:"#0A1400"},
    {l:"K-Drama",c:"#F472B6",b:"#180010"},{l:"Public Domain",c:"#22c55e",b:"#001A08"},
  ];

  const filtered = results.filter(x =>
    tab === "tv" ? x.type === "tv" : tab === "movie" ? x.type === "movie" : true
  );

  return (
    <div style={{background:"var(--bg)",minHeight:"100%"}}>
      {/* Search bar */}
      <div style={{padding:"12px 14px",position:"sticky",top:0,
        background:"rgba(15,15,15,.97)",zIndex:50,backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--bg2)",
          borderRadius:12,height:48,padding:"0 14px",
          border:"1.5px solid var(--line)",transition:"border-color .2s"}}>
          <Icon name="search" size={16} color="var(--t3)"/>
          <input ref={inputRef} value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") saveRecent(q); }}
            placeholder="Search movies, public domain films…"
            style={{flex:1,background:"none",border:"none",outline:"none",
              fontSize:16,fontWeight:600,color:"var(--text)",caretColor:"var(--red)"}}/>
          {q
            ? <button onClick={() => { setQ(""); setRes([]); }}
                style={{background:"none",border:"none",cursor:"pointer",
                  color:"var(--t3)",fontSize:20,lineHeight:1,fontWeight:700}}>×</button>
            : <Icon name="mic" size={16} color="var(--t3)"/>
          }
        </div>
      </div>

      {/* Results */}
      {q && (
        <div>
          <div style={{display:"flex",gap:18,padding:"10px 14px 0",
            borderBottom:"1px solid var(--line)",marginBottom:14}}>
            {[{id:"all",l:"All"},{id:"movie",l:"Movies"},{id:"tv",l:"Series"}].map(t => (
              <button key={t.id} className={"stab"+(tab===t.id?" on":"")}
                onClick={() => setTab(t.id)}>{t.l}</button>
            ))}
          </div>
          {loading ? <Spinner/> :
            filtered.length > 0 ? (
              <div>
                <p style={{padding:"0 14px",fontSize:12,fontWeight:700,
                  color:"var(--t3)",marginBottom:12}}>
                  {filtered.length} results for "{q}"
                </p>
                <div className="g3" style={{paddingBottom:16}}>
                  {filtered.map(item => (
                    <GridCard key={item.id||item.cvId} item={item}
                      onClick={m => { saveRecent(m.title); onDetail(m); }}/>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{padding:"32px 14px",textAlign:"center"}}>
                <Icon name="search" size={40} color="var(--bg4)" style={{margin:"0 auto 12px"}}/>
                <p style={{fontWeight:900,fontSize:16,color:"var(--t2)",marginBottom:5}}>
                  No results found
                </p>
                <p style={{fontSize:13,fontWeight:600,color:"var(--t3)"}}>
                  Try a different search term
                </p>
              </div>
            )
          }
        </div>
      )}

      {/* Empty state */}
      {!q && (
        <div>
          {recent.length > 0 && (
            <div style={{padding:"14px 14px 18px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <p style={{fontWeight:900,fontSize:16}}>Recent</p>
                <button className="tap"
                  onClick={() => { setRecent([]); S.set("cv_recent",[]); }}
                  style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,
                    color:"var(--t2)",background:"none",border:"none",cursor:"pointer"}}>
                  <Icon name="trash" size={12} color="currentColor"/>Clear
                </button>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {recent.map(r => (
                  <button key={r} className="spill"
                    onClick={() => { setQ(r); if (inputRef.current) inputRef.current.value=r; }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{padding:"0 14px 18px"}}>
            <p style={{fontWeight:900,fontSize:16,marginBottom:10,
              display:"flex",alignItems:"center",gap:8}}>
              <Icon name="fire" size={16} color="var(--red)"/>Everyone is searching
            </p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {HOT.map(s => (
                <button key={s} className="spill"
                  onClick={() => { setQ(s); if (inputRef.current) inputRef.current.value=s; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{padding:"0 14px 18px"}}>
            <p style={{fontWeight:900,fontSize:16,marginBottom:12}}>Browse by Genre</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {BROWSE.map(b => (
                <div key={b.l} className="tap"
                  style={{height:56,borderRadius:10,background:b.b,
                    border:"1px solid "+b.c+"30",display:"flex",alignItems:"center",
                    paddingLeft:14,overflow:"hidden",position:"relative",cursor:"pointer"}}
                  onClick={() => { setQ(b.l); if (inputRef.current) inputRef.current.value=b.l; }}>
                  <div style={{position:"absolute",right:-10,top:-10,width:66,height:66,
                    borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
                  <span style={{fontWeight:900,fontSize:16,color:b.c,
                    position:"relative",zIndex:1}}>{b.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{margin:"0 14px 20px"}}>
            <div className="ai-panel">
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <Icon name="ai" size={16} color="var(--red)"/>
                <p style={{fontWeight:900,fontSize:14}}>Ask AI</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input className="field" value={aiQ}
                  onChange={e => setAiQ(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && askAI()}
                  placeholder='"Something scary but not too intense"'
                  style={{flex:1,padding:"9px 12px",fontSize:13}}/>
                <button className="pbtn r" onClick={askAI} disabled={aiLoad}
                  style={{padding:"9px 14px",flexShrink:0}}>
                  {aiLoad ? <Icon name="spinner" size={15} color="#fff"/> : "Ask"}
                </button>
              </div>
              {aiRes && (
                <div style={{marginTop:10,background:"rgba(0,0,0,.4)",borderRadius:10,
                  padding:"10px 14px",border:"1px solid var(--line)"}}>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--t2)",
                    lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiRes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LIBRARY PAGE ────────────────────────────────────────────── */
function LibraryPage({onPlay, onDetail}) {
  const [tab,  setTab]  = useState("watchlist");
  const [list, setList] = useState([]);

  useEffect(() => {
    const key = tab === "watchlist" ? "cv_wl" : "cv_hist";
    setList(S.get(key)||[]);
  }, [tab]);

  function remove(id) {
    const u = (S.get("cv_wl")||[]).filter(x => x.id !== id);
    S.set("cv_wl", u);
    if (tab === "watchlist") setList(u);
  }

  return (
    <div style={{background:"var(--bg)",minHeight:"100%"}}>
      <div style={{padding:"14px 16px 0"}}>
        <h1 style={{fontWeight:900,fontSize:22,letterSpacing:"-.02em",marginBottom:12}}>
          My Library
        </h1>

        {/* Watchlist nudge — shows unwatched saved items */}
        {(() => {
          const wl   = S.get("cv_wl")  || [];
          const hist = S.get("cv_hist") || [];
          const unseen = wl.filter(w => !hist.find(h => h.id===w.id));
          if (!unseen.length || tab !== "watchlist") return null;
          return (
            <div style={{marginBottom:14,background:"rgba(229,9,20,.06)",
              border:"1px solid rgba(229,9,20,.15)",borderRadius:10,
              padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <Icon name="eye" size={16} color="var(--red)"/>
              <p style={{fontSize:12,fontWeight:700,flex:1}}>
                <span style={{color:"var(--red)"}}>{unseen.length}</span> unwatched —
                pick one now
              </p>
            </div>
          );
        })()}

        <div style={{display:"flex",background:"var(--bg2)",borderRadius:12,padding:4,marginBottom:18}}>
          {[["watchlist","Watchlist","library"],["history","History","clock"]].map(([id,label,icon]) => {
            const on = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",
                  fontSize:13,fontWeight:on?800:600,
                  background:on?"var(--bg3)":"transparent",
                  color:on?"var(--text)":"var(--t3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  gap:6,transition:"all .15s"}}>
                <Icon name={icon} size={13} color="currentColor"/>
                {label}{list.length>0&&on?" ("+list.length+")":""}
              </button>
            );
          })}
        </div>
        {tab==="history" && list.length>0 && (
          <div style={{marginBottom:14}}>
            <button className="pbtn gr tap"
              onClick={() => { S.set("cv_hist",[]); setList([]); }}
              style={{fontSize:12}}>
              <Icon name="trash" size={13} color="currentColor"/>Clear History
            </button>
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <div style={{textAlign:"center",paddingTop:64}}>
          <Icon name={tab==="watchlist"?"library":"clock"} size={44} color="var(--bg4)"
            style={{margin:"0 auto 14px"}}/>
          <p style={{fontWeight:900,fontSize:16,color:"var(--t2)",marginBottom:6}}>
            {tab==="watchlist" ? "Watchlist is empty" : "No history yet"}
          </p>
          <p style={{fontSize:13,fontWeight:600,color:"var(--t3)"}}>
            {tab==="watchlist" ? "Save titles to watch later" : "Movies you watch appear here"}
          </p>
        </div>
      ) : (
        <div className="g3" style={{paddingBottom:16}}>
          {list.map(item => (
            <div key={item.id} style={{position:"relative"}}>
              <GridCard item={item} onClick={onDetail}/>
              {tab==="watchlist" && (
                <button onClick={() => remove(item.id)}
                  style={{position:"absolute",top:5,right:5,width:22,height:22,
                    borderRadius:"50%",background:"rgba(0,0,0,.75)",border:"none",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#fff",zIndex:5}}>
                  <Icon name="close" size={10} color="#fff"/>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SHOW ALL PAGE ───────────────────────────────────────────── */
function ShowAllPage({title, items: seedItems, category, onBack, onPlay, onDetail}) {
  const [items,    setItems]    = useState(seedItems||[]);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [hasMore,  setHasMore]  = useState(true);
  const loaderRef = useRef(null);

  // Map title → category key for API calls
  const CAT_MAP = {
    "Nollywood Picks":       "nollywood",
    "Hollywood Selections":  "hollywood",
    "Bollywood Hits":        "bollywood",
    "Korean Cinema":         "korean",
    "Faith & Inspiration":   "christian",
    "Yoruba Films":          "yoruba",
    "Comedy Shorts":         "comedy",
  };
  const cat = category || CAT_MAP[title] || null;

  async function loadMore() {
    if (loading || !hasMore || !cat) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/youtube?category=${cat}&page=${nextPage}&max=20`);
      const data = await res.json();
      const newItems = data.items || [];
      if (newItems.length === 0) { setHasMore(false); }
      else {
        // Dedupe by id
        setItems(prev => {
          const seen = new Set(prev.map(x => x.id||x.cvId));
          return [...prev, ...newItems.filter(x => !seen.has(x.id||x.cvId))];
        });
        setPage(nextPage);
      }
    } catch { setHasMore(false); }
    setLoading(false);
  }

  // Intersection Observer for automatic infinite load
  useEffect(() => {
    if (!loaderRef.current || !cat) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "200px" });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [loading, hasMore, page, cat]);

  const isYT = cat === "comedy" || (items[0] && items[0].isYouTube);

  return (
    <div style={{background:"var(--bg)",minHeight:"100%"}}>
      {/* Sticky header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
        position:"sticky",top:0,background:"rgba(15,15,15,.97)",zIndex:50,
        borderBottom:"1px solid var(--line)"}}>
        <button className="tap" onClick={onBack}
          style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <span style={{fontWeight:900,fontSize:18}}>{title}</span>
        <span style={{fontSize:12,fontWeight:600,color:"var(--t3)",marginLeft:4}}>
          {items.length}+ videos
        </span>
      </div>

      {/* Grid — same card style as home page */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(2,1fr)",
        gap:10, padding:"12px",
      }}
      className="showAll-grid">
        {items.map((m,i) => {
          const isYTCard = m.isYouTube || m.source === "youtube";
          if (isYTCard) return (
            <YouTubeCard key={m.id||m.cvId||i} item={m}
              w="100%" onClick={onPlay||onDetail} delay={0}/>
          );
          return (
            <GridCard key={m.id||i} item={m} onClick={onDetail||onPlay}/>
          );
        })}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={loaderRef} style={{height:1}}/>

      {loading && (
        <div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}>
          <Icon name="spinner" size={28} color="var(--red)"/>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p style={{textAlign:"center",fontSize:12,fontWeight:600,
          color:"var(--t3)",padding:"20px 0"}}>
          All content loaded
        </p>
      )}

      {!cat && items.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 24px",color:"var(--t3)"}}>
          <p style={{fontWeight:700,fontSize:14}}>No content available</p>
        </div>
      )}
    </div>
  );
}

/* ─── PROFILE PAGE ────────────────────────────────────────────── */
function ProfilePage({lang, setLang, user: userProp, onLogin, onLogout}) {
  // Accept user from parent (shared state) or fall back to localStorage
  const [localUser, setLocalUser] = useState(() => S.get("cv_user"));
  const user = userProp ?? localUser;

  const [form,    setForm]    = useState({name:"",email:"",password:""});
  const [mode,    setMode]    = useState("signup");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [notif,   setNotif]   = useState(() => S.get("cv_notif") !== false);
  const [hd,      setHD]      = useState(() => S.get("cv_hd")    !== false);
  const [auto,    setAuto]    = useState(() => S.get("cv_ap")    !== false);

  function Toggle({on, toggle}) {
    return (
      <button className="tog tap" onClick={toggle}
        style={{background:on?"var(--red)":"var(--bg3)"}}>
        <div className="tog-dot" style={{left:on?21:3}}/>
      </button>
    );
  }

  async function submit() {
    setErr(""); setSuccess(""); setLoading(true);
    if (!form.email.includes("@")) { setErr("Enter a valid email address."); setLoading(false); return; }
    if (form.password.length < 6)  { setErr("Password must be at least 6 characters."); setLoading(false); return; }
    if (mode==="signup" && !form.name.trim()) { setErr("Enter your name."); setLoading(false); return; }

    if (mode === "signup") {
      // Call registration API (sends welcome email)
      try {
        const res = await fetch("/api/auth/register", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({email:form.email, password:form.password, name:form.name}),
        });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Registration failed."); setLoading(false); return; }
        setSuccess("Account created! Check your email for a welcome message.");
      } catch { setSuccess("Account created!"); }
    }

    // Save user locally (works with or without Supabase Auth)
    const u = {
      email:  form.email,
      name:   mode==="signup" ? form.name : form.email.split("@")[0],
      id:     "local_" + Date.now(),
      joined: Date.now(),
    };
    S.set("cv_user", u);
    setLocalUser(u);
    if (onLogin) onLogin(u);
    setLoading(false);
  }

  function handleLogout() {
    S.set("cv_user", null);
    setLocalUser(null);
    if (onLogout) onLogout();
  }

  const wl   = (S.get("cv_wl")||[]).length;
  const hist = (S.get("cv_hist")||[]).length;
  const coursesCompleted = Object.keys(S.get("fx_courses_done")||{}).length;

  return (
    <div style={{background:"var(--bg)",minHeight:"100%",paddingBottom:40}}>
      <p style={{fontWeight:900,fontSize:22,padding:"14px 16px 16px",letterSpacing:"-.02em"}}>
        Profile
      </p>

      {!user ? (
        <div style={{padding:"0 16px"}}>
          <div style={{background:"var(--bg1)",borderRadius:14,padding:"22px 18px"}}>
            <p style={{fontWeight:900,fontSize:18,letterSpacing:"-.01em",marginBottom:4}}>
              {mode==="signup" ? "Create Account" : "Welcome Back"}
            </p>
            <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",marginBottom:18,lineHeight:1.65}}>
              {mode==="signup"
                ? "Create an account to save your watchlist across devices."
                : "Sign in to access your account."}
            </p>
            {mode==="signup" && (
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:800,color:"var(--t3)",letterSpacing:".08em",
                  textTransform:"uppercase",display:"block",marginBottom:5}}>Full Name</label>
                <input className="field" placeholder="Your name" value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}/>
              </div>
            )}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:800,color:"var(--t3)",letterSpacing:".08em",
                textTransform:"uppercase",display:"block",marginBottom:5}}>Email</label>
              <input className="field" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email:e.target.value})}/>
            </div>
            <div style={{marginBottom:err?10:18}}>
              <label style={{fontSize:11,fontWeight:800,color:"var(--t3)",letterSpacing:".08em",
                textTransform:"uppercase",display:"block",marginBottom:5}}>Password</label>
              <input className="field" type="password" placeholder="6+ characters" value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}/>
            </div>
            {err && <p style={{fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:12}}>{err}</p>}
            {success && (
              <div style={{background:"rgba(22,163,74,.1)",border:"1px solid rgba(22,163,74,.25)",
                borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <p style={{fontSize:13,fontWeight:700,color:"#22c55e"}}>{success}</p>
              </div>
            )}
            <button className="pbtn r" style={{width:"100%",justifyContent:"center",
              padding:"12px 0",marginBottom:12}} onClick={submit} disabled={loading}>
              {loading ? <><Icon name="spinner" size={15} color="#fff"/> Processing…</> :
               mode==="signup" ? "Create Account" : "Sign In"}
            </button>
            <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",textAlign:"center"}}>
              {mode==="signup" ? "Already have an account? " : "New here? "}
              <button onClick={() => { setMode(mode==="signup"?"login":"signup"); setErr(""); }}
                style={{background:"none",border:"none",color:"var(--red)",
                  fontWeight:800,fontSize:13,cursor:"pointer"}}>
                {mode==="signup" ? "Sign In" : "Sign Up"}
              </button>
            </p>
            <p style={{fontSize:11,fontWeight:600,color:"var(--t3)",textAlign:"center",
              marginTop:10,lineHeight:1.65}}>
              ⚡ FlonexTV works without an account.
              Sign in to track course progress & earn certificates.
            </p>
          </div>
        </div>
      ) : (
        <div style={{padding:"0 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18,
            background:"var(--bg1)",borderRadius:14,padding:"14px 16px"}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:"var(--red)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,fontSize:22,color:"#fff",flexShrink:0}}>
              {(user.name||"?")[0].toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <p style={{fontWeight:900,fontSize:16,marginBottom:2}}>{user.name}</p>
              <p style={{fontSize:12,fontWeight:600,color:"var(--t3)"}}>{user.email}</p>
            </div>
            <button className="tap"
              onClick={handleLogout}
              style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,
                color:"#EF4444",background:"none",border:"none",cursor:"pointer"}}>
              <Icon name="logout" size={13} color="currentColor"/>Sign out
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
            {[
              [wl, t("watchlist",lang)],
              [hist, t("watched",lang)],
              [coursesCompleted, t("courses",lang)],
              [(S.get("cv_recent")||[]).length, t("searched",lang)],
            ].map(r => (
              <div key={r[1]} style={{background:"var(--bg1)",borderRadius:12,padding:"14px 12px"}}>
                <p style={{fontWeight:900,fontSize:24,color:"var(--red)",letterSpacing:"-.02em"}}>
                  {r[0]}
                </p>
                <p style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginTop:3}}>{r[1]}</p>
              </div>
            ))}
          </div>

          {/* Recent activity quick-view */}
          {hist > 0 && (
            <div style={{background:"var(--bg2)",borderRadius:12,padding:"12px 14px",marginBottom:14,
              border:"1px solid var(--line)"}}>
              <p style={{fontWeight:800,fontSize:13,marginBottom:8}}>Recently Watched</p>
              <div style={{display:"flex",gap:8,overflowX:"auto"}}>
                {(S.get("cv_hist")||[]).slice(0,6).map((item,i) => (
                  <div key={i} style={{flexShrink:0,width:64}}>
                    <div style={{width:64,height:90,borderRadius:6,overflow:"hidden",background:"var(--bg3)"}}>
                      {item.poster && <img src={item.poster} alt={item.title||""} loading="lazy"
                        style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                    </div>
                    <p style={{fontSize:9,fontWeight:700,color:"var(--t3)",marginTop:3,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div style={{padding:"20px 16px 0"}}>
        <p style={{fontSize:11,fontWeight:900,color:"var(--t3)",letterSpacing:".1em",
          textTransform:"uppercase",marginBottom:14}}>Settings</p>

        {/* Language */}
        <div style={{padding:"13px 0",borderBottom:"1px solid var(--line)",
          display:"flex",alignItems:"center",gap:14}}>
          <Icon name="globe" size={18} color="var(--t3)"/>
          <div style={{flex:1}}>
            <p style={{fontWeight:800,fontSize:14,marginBottom:2}}>Language</p>
            <p style={{fontSize:12,fontWeight:600,color:"var(--t3)"}}>Filter content by language</p>
          </div>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{background:"var(--bg2)",border:"1px solid var(--line)",borderRadius:10,
              padding:"8px 12px",color:"var(--text)",fontSize:13,fontWeight:700,
              cursor:"pointer",outline:"none"}}>
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* Toggles */}
        {[
          {key:"notif", label:"Push Notifications", sub:"Alerts for new releases", on:notif,
           toggle:() => { const v=!notif; setNotif(v); S.set("cv_notif",v); }, icon:"bell"},
          {key:"hd",    label:"HD Streaming",        sub:"Use highest quality available", on:hd,
           toggle:() => { const v=!hd; setHD(v); S.set("cv_hd",v); }, icon:"eye"},
          {key:"auto",  label:"Autoplay Next",        sub:"Auto-play next episode", on:auto,
           toggle:() => { const v=!auto; setAuto(v); S.set("cv_ap",v); }, icon:"play"},
        ].map(row => (
          <div key={row.key} style={{padding:"13px 0",borderBottom:"1px solid var(--line)",
            display:"flex",alignItems:"center",gap:14}}>
            <Icon name={row.icon} size={18} color="var(--t3)"/>
            <div style={{flex:1}}>
              <p style={{fontWeight:800,fontSize:14,marginBottom:2}}>{row.label}</p>
              <p style={{fontSize:12,fontWeight:600,color:"var(--t3)"}}>{row.sub}</p>
            </div>
            <Toggle on={row.on} toggle={row.toggle}/>
          </div>
        ))}

        <p style={{fontSize:11,fontWeight:900,color:"var(--t3)",letterSpacing:".1em",
          textTransform:"uppercase",marginTop:22,marginBottom:14}}>Connect</p>
        {[
          {label:"GitHub Repository",  href:"https://github.com/Ememzyvisuals/FlonexTV", icon:"github"},
          {label:"X / Twitter",        href:"https://x.com/Ememzyvisuals",                icon:"x_s"},
          {label:"TikTok",             href:"https://www.tiktok.com/@Ememzyvisuals",       icon:"tiktok"},
          {label:"Kaggle",             href:"https://www.kaggle.com/Ememzyvisuals",        icon:"external"},
        ].map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer"
            className="tap"
            style={{padding:"13px 0",display:"flex",alignItems:"center",gap:14,
              borderBottom:"1px solid var(--line)"}}>
            <Icon name={link.icon} size={18} color="var(--t3)"/>
            <p style={{fontWeight:800,fontSize:14,flex:1}}>{link.label}</p>
            <Icon name="external" size={13} color="var(--t3)"/>
          </a>
        ))}
      </div>

      <p style={{fontSize:11,fontWeight:700,color:"var(--t3)",textAlign:"center",
        marginTop:24,paddingBottom:8}}>
        FlonexTV v5.0 · © 2026 EMEMZYVISUALS
      </p>
    </div>
  );
}

/* ─── YOUTUBE EMBED PLAYER ───────────────────────────────────── */
function YouTubePlayer({embedUrl, title, channel, thumbnail, onBack, item, onDetail}) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  function toggleFs() {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => {
        // Force landscape on mobile
        try { screen.orientation?.lock?.("landscape").catch(() => {}); } catch {}
      }).catch(() => {});
    } else {
      document.exitFullscreen?.();
      try { screen.orientation?.unlock?.(); } catch {}
    }
  }

  return (
    <div style={{background:"#000",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        background:"rgba(0,0,0,.95)",borderBottom:"1px solid rgba(255,255,255,.08)",
        position:"sticky",top:0,zIndex:50}}>
        <button className="tap" onClick={onBack}
          style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:800,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",
            whiteSpace:"nowrap"}}>{title}</p>
          {channel && <p style={{fontSize:11,fontWeight:600,color:"var(--t3)",marginTop:1}}>{channel}</p>}
        </div>
        {onDetail && item && (
          <button className="tap" onClick={() => onDetail?.(item)}
            style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,
              color:"var(--t2)",background:"none",border:"none"}}>
            <Icon name="info" size={14} color="currentColor"/>Info
          </button>
        )}
        <button className="tap" onClick={toggleFs}
          style={{width:34,height:34,background:"var(--bg2)",border:"1px solid var(--line)",
            borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t2)"}}>
          <Icon name="full" size={14} color="currentColor"/>
        </button>
      </div>

      {/* Iframe player */}
      <div ref={containerRef} style={{width:"100%",aspectRatio:"16/9",background:"#000",position:"relative"}}>
        {!loaded && (
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",background:"#000",zIndex:2}}>
            {thumbnail && (
              <img src={thumbnail} alt={title} loading="eager"
                style={{position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",opacity:.4}}/>
            )}
            <div style={{position:"relative",zIndex:3,textAlign:"center"}}>
              <Icon name="spinner" size={40} color="var(--red)"/>
              <p style={{marginTop:12,fontSize:13,fontWeight:700,color:"rgba(255,255,255,.8)"}}>
                Loading YouTube…
              </p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          style={{width:"100%",height:"100%",border:"none",
            opacity: loaded ? 1 : 0, transition:"opacity .3s"}}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen={true}
          onLoad={() => setLoaded(true)}
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* Info */}
      <div style={{padding:"14px",background:"var(--bg)",flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
          </svg>
          <span style={{fontSize:11,fontWeight:800,color:"#FF0000"}}>YouTube</span>
          {channel && <span style={{fontSize:11,fontWeight:600,color:"var(--t3)"}}>· {channel}</span>}
        </div>
        <h2 style={{fontWeight:900,fontSize:17,letterSpacing:"-.02em",marginBottom:6,lineHeight:1.3}}>
          {title}
        </h2>
        {item?.overview && (
          <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",lineHeight:1.65,
            overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
            {item.overview}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── YOUTUBE CARD ───────────────────────────────────────────── */
function YouTubeCard({item, onClick, w=160, delay=0}) {
  const isFluid = w === "100%" || typeof w === "string";
  const cardW   = isFluid ? "100%" : w;
  const thumbH  = isFluid ? undefined : Math.round(w * 0.56);
  const aspectStyle = isFluid ? {aspectRatio:"16/9"} : {height:thumbH};
  const badgeColor = item.isFaith  ? "#7c3aed"
                   : item.isYoruba ? "#b45309"
                   : item.isShort  ? "#0891b2"
                   : "#FF0000";
  const badgeLabel = item.isFaith  ? "Faith"
                   : item.isYoruba ? "Yoruba"
                   : item.isShort  ? "Short"
                   : "YouTube";
  return (
    <div className="card anim" style={{width:cardW,flexShrink:isFluid?1:0,animationDelay:delay+"ms"}}
      onClick={() => onClick?.(item)}>
      <div style={{position:"relative",width:"100%",...aspectStyle,borderRadius:8,overflow:"hidden",background:"var(--bg3)"}}>
        <img src={item.poster} alt={item.title||""} loading="lazy"
          style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
        {/* Play overlay */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
          justifyContent:"center",background:"rgba(0,0,0,.3)"}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,0,0,.9)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="play" size={13} color="#fff"/>
          </div>
        </div>
        {/* Category badge */}
        <span className="badge" style={{position:"absolute",top:5,left:5,
          background:badgeColor,color:"#fff"}}>{badgeLabel}</span>
        {/* Watch Now badge */}
        <span className="badge" style={{position:"absolute",bottom:5,left:5,
          background:"rgba(22,163,74,.9)",color:"#fff"}}>Watch Now</span>
      </div>
      <p style={{fontWeight:800,fontSize:11,color:"var(--text)",marginTop:6,
        lineHeight:1.35,overflow:"hidden",display:"-webkit-box",
        WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
        {item.title}
      </p>
      {item.channel && (
        <p style={{fontSize:10,fontWeight:600,color:"var(--t3)",marginTop:2,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {item.channel}
        </p>
      )}
    </div>
  );
}

/* ─── SHORTS PAGE ────────────────────────────────────────────── */
function ShortsPage({onBack}) {
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [idx,      setIdx]     = useState(0);
  const [paused,   setPaused]  = useState(false);
  const [hint,     setHint]    = useState(true);
  const [fetching, setFetching]= useState(false);

  const fetchPage   = useRef(2);
  const sessionSeen = useRef(new Set());
  // gesture refs
  const ty0      = useRef(0);
  const tx0      = useRef(0);
  const tt0      = useRef(0);
  const dragging = useRef(false);

  /* ── Load initial batch ── */
  useEffect(() => {
    const cached = PAGE_CACHE.get("shorts");
    if (cached && cached.length >= 10) { setItems(cached); setLoading(false); return; }
    fetch("/api/shorts").then(r=>r.json()).then(d=>{
      const arr = (d.items||[]).filter(x=>!sessionSeen.current.has(x.cvId));
      arr.forEach(x=>sessionSeen.current.add(x.cvId));
      PAGE_CACHE.set("shorts",arr,30*60*1000);
      setItems(arr); setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  /* ── Fetch more near end ── */
  useEffect(()=>{
    if(fetching||loading||!items.length) return;
    if(idx < items.length-5) return;
    setFetching(true);
    fetch(`/api/shorts?page=${fetchPage.current}`)
      .then(r=>r.json()).then(d=>{
        const fresh=(d.items||[]).filter(x=>!sessionSeen.current.has(x.cvId));
        fresh.forEach(x=>sessionSeen.current.add(x.cvId));
        if(fresh.length){
          setItems(prev=>{const m=[...prev,...fresh];PAGE_CACHE.set("shorts",m,30*60*1000);return m;});
          fetchPage.current++;
        }
      }).catch(()=>{}).finally(()=>setFetching(false));
  },[idx,items.length,fetching,loading]);

  /* ── Hint ── */
  useEffect(()=>{if(!hint)return;const t=setTimeout(()=>setHint(false),3500);return()=>clearTimeout(t);},[hint]);

  const total = items.length;
  function goNext(){ if(!total)return; setIdx(i=>(i+1)%total); setPaused(false); }
  function goPrev(){ if(!total)return; setIdx(i=>(i-1+total)%total); setPaused(false); }

  /* ── Auto-advance: YouTube postMessage state=0 = ended ── */
  useEffect(()=>{
    function onMsg(e){
      try{
        const d=typeof e.data==="string"?JSON.parse(e.data):e.data;
        if(d?.event==="onStateChange"&&d?.info===0) goNext();
      }catch{}
    }
    window.addEventListener("message",onMsg);
    return()=>window.removeEventListener("message",onMsg);
  },[total]);

  /* ── Keyboard ── */
  useEffect(()=>{
    const h=e=>{
      if(e.key==="ArrowDown"){e.preventDefault();goNext();}
      if(e.key==="ArrowUp")  {e.preventDefault();goPrev();}
      if(e.key===" ")        {e.preventDefault();tap();}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[total,paused]);

  /* ── Pause/play ── */
  function tap(){
    const f=document.getElementById("flx-short-active");
    const cmd=paused?"playVideo":"pauseVideo";
    try{f?.contentWindow?.postMessage(JSON.stringify({event:"command",func:cmd,args:""}), "*");}catch{}
    setPaused(p=>!p);
  }

  /* ── Gestures ── */
  function gStart(e){ty0.current=e.touches[0].clientY;tx0.current=e.touches[0].clientX;tt0.current=Date.now();dragging.current=false;}
  function gMove(e){
    const dy=Math.abs(e.touches[0].clientY-ty0.current),dx=Math.abs(e.touches[0].clientX-tx0.current);
    if(dy>8||dx>8)dragging.current=true;
    if(dy>dx)e.preventDefault();
  }
  function gEnd(e){
    const dy=ty0.current-e.changedTouches[0].clientY;
    const dx=Math.abs(tx0.current-e.changedTouches[0].clientX);
    const dt=Date.now()-tt0.current;
    const vel=Math.abs(dy)/Math.max(dt,1);
    if(dx>Math.abs(dy)*1.2)return;
    if(!dragging.current&&dt<250&&Math.abs(dy)<12){tap();return;}
    if(Math.abs(dy)>60||vel>0.3){dy>0?goNext():goPrev();}
  }

  /* ── URL builders ── */
  const base=(emb)=>(emb||"").replace("www.youtube.com","www.youtube-nocookie.com").replace("youtube.com","youtube-nocookie.com");
  const activeUrl =(item)=>base(item.embedUrl).replace(/autoplay=\d/,"autoplay=1")+"&enablejsapi=1&playsinline=1&rel=0&iv_load_policy=3";
  const preloadUrl=(item)=>base(item.embedUrl).replace(/autoplay=\d/,"autoplay=0")+"&enablejsapi=0&mute=1&playsinline=1";

  const current  = items[idx] || null;
  const nextItem = total>1 ? items[(idx+1)%total] : null;

  return (
    <div style={{background:"#000",height:"100%",display:"flex",flexDirection:"column",
      overflow:"hidden",position:"relative",userSelect:"none",WebkitUserSelect:"none"}}>

      {/* Top bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:50,
        display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        background:"linear-gradient(rgba(0,0,0,.7),transparent)"}}>
        <span style={{fontWeight:900,fontSize:18,color:"#fff"}}>Shorts</span>
        <div style={{flex:1}}/>
        <button className="tap" onClick={goPrev}
          style={{width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,.45)",
            border:"1px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={13} color="#fff"/>
        </button>
        <button className="tap" onClick={goNext}
          style={{width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,.45)",
            border:"1px solid rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="chevR" size={13} color="#fff"/>
        </button>
      </div>

      {/* Video area */}
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>

        {loading&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14}}>
            <Icon name="spinner" size={36} color="var(--red)"/>
            <p style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)"}}>Loading Shorts…</p>
          </div>
        )}

        {!loading&&!items.length&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            height:"100%",gap:14,padding:"0 24px",textAlign:"center"}}>
            <Icon name="alert" size={36} color="var(--t3)"/>
            <p style={{fontWeight:800,fontSize:15,color:"var(--t2)"}}>No Shorts Available</p>
            <p style={{fontSize:12,fontWeight:600,color:"var(--t3)",lineHeight:1.6}}>
              Add YOUTUBE_API_KEY in Vercel environment variables.
            </p>
          </div>
        )}

        {!loading&&current&&(
          <>
            {/* Active iframe — key changes on every nav → guaranteed fresh autoplay */}
            <iframe
              key={current.cvId}
              id="flx-short-active"
              src={activeUrl(current)}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none",zIndex:2,pointerEvents:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen={true}
              title={current.title||"Short"}
              referrerPolicy="strict-origin-when-cross-origin"
            />

            {/* Silent preload — next video buffers quietly */}
            {nextItem&&nextItem.cvId!==current.cvId&&(
              <iframe
                key={"pre_"+nextItem.cvId}
                src={preloadUrl(nextItem)}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none",visibility:"hidden",zIndex:1,pointerEvents:"none"}}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen={true}
                title=""
                referrerPolicy="strict-origin-when-cross-origin"
                aria-hidden="true"
              />
            )}

            {/* Gesture overlay — ABOVE iframes, captures all touch */}
            <div style={{position:"absolute",inset:0,zIndex:30,background:"transparent",
              WebkitTapHighlightColor:"transparent",cursor:"pointer"}}
              onTouchStart={gStart} onTouchMove={gMove} onTouchEnd={gEnd} onClick={tap}
            />

            {/* Pause icon */}
            {paused&&(
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                justifyContent:"center",zIndex:40,pointerEvents:"none"}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(0,0,0,.55)",
                  backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon name="pause" size={26} color="#fff"/>
                </div>
              </div>
            )}

            {/* Swipe hint */}
            {hint&&items.length>1&&(
              <div style={{position:"absolute",bottom:80,left:0,right:0,display:"flex",
                flexDirection:"column",alignItems:"center",gap:5,zIndex:40,pointerEvents:"none"}}>
                <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                  <rect x="4" y="0" width="16" height="24" rx="8" stroke="rgba(255,255,255,.55)" strokeWidth="1.5"/>
                  <circle cx="12" cy="7" r="2.5" fill="rgba(255,255,255,.75)">
                    <animate attributeName="cy" values="7;17;7" dur="1.1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.6)",letterSpacing:".1em"}}>SWIPE UP / DOWN</span>
              </div>
            )}

            {/* Title overlay */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,
              background:"linear-gradient(transparent,rgba(0,0,0,.85))",
              padding:"40px 16px 20px",pointerEvents:"none"}}>
              {current.title&&<p style={{fontWeight:800,fontSize:14,color:"#fff",marginBottom:3,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{current.title}</p>}
              {current.channel&&<p style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.55)"}}>{current.channel}</p>}
            </div>

            {/* Dot indicators */}
            <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
              display:"flex",flexDirection:"column",gap:3,zIndex:35}}>
              {Array.from({length:Math.min(items.length,12)}).map((_,i)=>(
                <div key={i} onClick={e=>{e.stopPropagation();setIdx(i);setPaused(false);}}
                  style={{width:i===idx?5:3,height:i===idx?18:3,borderRadius:3,cursor:"pointer",
                    background:i===idx?"var(--red)":"rgba(255,255,255,.35)",transition:"all .2s"}}/>
              ))}
            </div>

            {fetching&&(
              <div style={{position:"absolute",bottom:4,left:0,right:0,display:"flex",
                justifyContent:"center",zIndex:40,pointerEvents:"none"}}>
                <Icon name="spinner" size={14} color="rgba(255,255,255,.35)"/>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


function PracticalTask({ course, user, onPass, onClose }) {
  const [phase,      setPhase]      = useState("intro");   // intro|task|submitting|result
  const [task,       setTask]       = useState(null);
  const [submission, setSubmission] = useState("");
  const [review,     setReview]     = useState(null);
  const [err,        setErr]        = useState("");

  async function loadTask() {
    setPhase("loading");
    try {
      const res  = await fetch("/api/courses/task", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"generate", courseTitle:course.title, courseCategory:course.category }),
      });
      const data = await res.json();
      setTask(data.task);
      setPhase("task");
    } catch {
      setErr("Could not load task. Check your connection.");
      setPhase("intro");
    }
  }

  async function submitWork() {
    if (submission.trim().length < 30) {
      setErr("Please write more before submitting — show your understanding!");
      return;
    }
    setErr("");
    setPhase("submitting");
    try {
      const res  = await fetch("/api/courses/task", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          action:"review",
          courseTitle:       course.title,
          courseCategory:    course.category,
          submission:        submission,
        }),
      });
      const data = await res.json();
      if (data.error) { setErr(data.error); setPhase("task"); return; }
      setReview(data.review);
      setPhase("result");
    } catch {
      setErr("Review failed. Please try again.");
      setPhase("task");
    }
  }

  const verdictColor = {
    Excellent:"#22c55e", Good:"#3b82f6",
    "Needs Improvement":"#f59e0b", Incomplete:"#ef4444",
  };

  return (
    <div style={{background:"var(--bg)",minHeight:"100%",display:"flex",flexDirection:"column"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        position:"sticky",top:0,background:"rgba(15,15,15,.97)",
        borderBottom:"1px solid var(--line)",zIndex:50}}>
        <button className="tap" onClick={onClose}
          style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <div style={{flex:1}}>
          <p style={{fontWeight:700,fontSize:11,color:"var(--t3)"}}>Practical Task</p>
          <p style={{fontWeight:900,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {course.title}
          </p>
        </div>
        {phase==="task"&&(
          <span style={{fontSize:10,fontWeight:800,color:"var(--t3)",
            padding:"3px 8px",borderRadius:6,background:"var(--bg3)"}}>
            {Math.max(0,30-Math.round(submission.trim().split(/\s+/).length))} words min
          </span>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>

        {/* ── Intro ── */}
        {phase==="intro"&&(
          <div style={{textAlign:"center",paddingTop:20}}>
            <div style={{width:72,height:72,borderRadius:"50%",
              background:"linear-gradient(135deg,rgba(229,9,20,.15),rgba(229,9,20,.05))",
              border:"1px solid rgba(229,9,20,.25)",
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 20px"}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M7 4H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3M9 4h6M9 4a2 2 0 000 4h6a2 2 0 000-4"
                  stroke="#E50914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{fontWeight:900,fontSize:20,marginBottom:8}}>One More Step</p>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.55)",
              lineHeight:1.7,marginBottom:8,maxWidth:300,margin:"0 auto 16px"}}>
              You passed the exam! Now complete a practical task to prove real-world understanding.
              The AI will review your work and issue your certificate.
            </p>
            <div style={{background:"rgba(229,9,20,.06)",border:"1px solid rgba(229,9,20,.14)",
              borderRadius:12,padding:"12px 16px",textAlign:"left",marginBottom:24}}>
              {[
                "Get a hands-on task matched to your course",
                "Submit your work — code, writing, or plan",
                "AI reviews instantly with detailed feedback",
                "Pass the review → Certificate issued",
              ].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",
                  marginBottom:i<3?8:0}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"var(--red)",
                    flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{color:"#fff",fontSize:10,fontWeight:900}}>{i+1}</span>
                  </div>
                  <p style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.7)"}}>{t}</p>
                </div>
              ))}
            </div>
            {err&&<p style={{color:"var(--red)",fontSize:12,fontWeight:700,marginBottom:12}}>{err}</p>}
            <button className="pbtn r tap"
              style={{width:"100%",justifyContent:"center",padding:"13px 0",fontSize:14}}
              onClick={loadTask}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="1.5"/>
              </svg>
              Get My Task
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {phase==="loading"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",minHeight:200,gap:14}}>
            <Icon name="spinner" size={36} color="var(--red)"/>
            <p style={{fontSize:13,fontWeight:700,color:"var(--t3)"}}>
              Generating your task…
            </p>
          </div>
        )}

        {/* ── Task ── */}
        {phase==="task"&&task&&(
          <div>
            <div style={{background:"rgba(59,130,246,.07)",border:"1px solid rgba(59,130,246,.18)",
              borderRadius:12,padding:"14px 16px",marginBottom:20}}>
              <p style={{fontSize:10,fontWeight:900,color:"rgba(59,130,246,.8)",
                textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>
                Your Task
              </p>
              <p style={{fontWeight:900,fontSize:15,marginBottom:8}}>{task.title}</p>
              <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.65)",lineHeight:1.7}}>
                {task.description}
              </p>
            </div>

            <p style={{fontWeight:800,fontSize:13,marginBottom:8}}>Your Submission</p>
            <textarea
              value={submission}
              onChange={e=>setSubmission(e.target.value)}
              placeholder={task.placeholder}
              style={{
                width:"100%", minHeight:220,
                background:"var(--bg2)", border:"1px solid var(--line)",
                borderRadius:10, padding:"12px 14px",
                color:"var(--text)", fontSize:13, fontWeight:600,
                lineHeight:1.7, resize:"vertical",
                fontFamily:"inherit", boxSizing:"border-box",
                outline:"none",
              }}
              onFocus={e=>e.target.style.borderColor="var(--red)"}
              onBlur={e=>e.target.style.borderColor="var(--line)"}
            />
            <p style={{fontSize:11,fontWeight:600,color:"var(--t3)",marginTop:4,marginBottom:16}}>
              {submission.trim().split(/\s+/).filter(Boolean).length} words written
            </p>

            {err&&(
              <div style={{background:"rgba(229,9,20,.08)",border:"1px solid rgba(229,9,20,.2)",
                borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <p style={{fontSize:12,fontWeight:700,color:"var(--red)"}}>{err}</p>
              </div>
            )}

            <button className="pbtn r tap"
              style={{width:"100%",justifyContent:"center",padding:"13px 0",fontSize:14}}
              onClick={submitWork}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Submit for AI Review
            </button>
          </div>
        )}

        {/* ── Submitting ── */}
        {phase==="submitting"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",minHeight:200,gap:14}}>
            <Icon name="spinner" size={36} color="var(--red)"/>
            <p style={{fontSize:13,fontWeight:700,color:"var(--t3)"}}>
              AI is reviewing your work…
            </p>
          </div>
        )}

        {/* ── Result ── */}
        {phase==="result"&&review&&(
          <div>
            {/* Score circle */}
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{
                width:100, height:100, borderRadius:"50%", margin:"0 auto 14px",
                background:`conic-gradient(${review.passed?"#22c55e":"#ef4444"} ${review.score*3.6}deg, rgba(255,255,255,.08) 0)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                position:"relative",
              }}>
                <div style={{
                  width:80, height:80, borderRadius:"50%",
                  background:"var(--bg)", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  flexDirection:"column",
                }}>
                  <p style={{fontWeight:900,fontSize:24,lineHeight:1}}>{review.score}</p>
                  <p style={{fontSize:10,fontWeight:700,color:"var(--t3)"}}>/ 100</p>
                </div>
              </div>
              <span style={{
                fontWeight:800,fontSize:14,padding:"4px 16px",borderRadius:20,
                background:`${verdictColor[review.verdict]||"var(--red)"}22`,
                color: verdictColor[review.verdict]||"var(--red)",
                border:`1px solid ${verdictColor[review.verdict]||"var(--red)"}44`,
              }}>
                {review.verdict}
              </span>
            </div>

            {/* Overall */}
            <div style={{background:"rgba(255,255,255,.04)",border:"1px solid var(--line)",
              borderRadius:10,padding:"12px 14px",marginBottom:16}}>
              <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)",lineHeight:1.7}}>
                {review.overall}
              </p>
            </div>

            {/* Strengths */}
            {(review.strengths||[]).length>0&&(
              <div style={{marginBottom:16}}>
                <p style={{fontWeight:800,fontSize:12,color:"var(--green)",
                  textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                  ✓ Strengths
                </p>
                {review.strengths.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(34,197,94,.15)",
                      border:"1px solid rgba(34,197,94,.3)",flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                      <Icon name="check" size={9} color="var(--green)"/>
                    </div>
                    <p style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>{s}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Improvements */}
            {(review.improvements||[]).length>0&&(
              <div style={{marginBottom:20}}>
                <p style={{fontWeight:800,fontSize:12,color:"#f59e0b",
                  textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                  ↑ Improvements
                </p>
                {review.improvements.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(245,158,11,.1)",
                      border:"1px solid rgba(245,158,11,.25)",flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                      <span style={{fontSize:8,fontWeight:900,color:"#f59e0b"}}>{i+1}</span>
                    </div>
                    <p style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>{s}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {review.passed ? (
              <button className="pbtn g tap"
                style={{width:"100%",justifyContent:"center",padding:"14px 0",fontSize:15,marginBottom:8}}
                onClick={()=>onPass(review)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 21h8M12 17v4M7 4H4a2 2 0 00-2 2v1a5 5 0 005 5h.5M17 4h3a2 2 0 012 2v1a5 5 0 01-5 5h-.5M6 4h12v6a6 6 0 01-12 0V4z"
                    stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Claim Your Certificate
              </button>
            ) : (
              <div style={{display:"flex",gap:8}}>
                <button className="pbtn r tap"
                  style={{flex:1,justifyContent:"center",padding:"12px 0",fontSize:13}}
                  onClick={()=>{ setSubmission(""); setErr(""); setPhase("task"); }}>
                  Revise & Resubmit
                </button>
                <button className="pbtn gr tap"
                  style={{padding:"12px 14px",fontSize:12}}
                  onClick={onClose}>
                  Close
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── CERTIFICATE PAGE ──────────────────────────────────────── */
/*
 * Full-screen professional certificate with:
 * - Gold bordered design
 * - Trophy SVG
 * - Verification ID
 * - PDF download via browser print
 */
function CertificatePage({ certData, onBack }) {
  const {
    courseTitle = "Course Completed",
    userName:   rawName = "",
    certId:     rawId   = null,
    issuedAt            = new Date().toISOString(),
  } = certData || {};

  // ── Name prompt ── ask user for real name before showing cert
  const [displayName, setDisplayName] = useState(rawName || "");
  const [nameConfirmed, setNameConfirmed] = useState(!!rawName && rawName.trim().length > 2);
  const [nameInput, setNameInput]         = useState(rawName || "");

  // ── Generate stable cert ID ───────────────────────────────
  const certId = rawId || (
    "FTV-" +
    new Date(issuedAt).getFullYear() + "-" +
    Math.random().toString(36).slice(2,8).toUpperCase()
  );

  const dateStr = new Date(issuedAt).toLocaleDateString("en-GB", {
    day:"numeric", month:"long", year:"numeric",
  });

  // ── PNG download via html2canvas loaded from CDN ──────────
  function downloadPNG() {
    const el = document.getElementById("flx-cert-card");
    if (!el) return;
    // If html2canvas is already loaded
    if (window.html2canvas) {
      window.html2canvas(el, { scale:2, useCORS:true, backgroundColor:"#0a0a0a" })
        .then(canvas => {
          const a = document.createElement("a");
          a.href    = canvas.toDataURL("image/png");
          a.download = `FlonexTV-Certificate-${certId}.png`;
          a.click();
        });
      return;
    }
    // Load html2canvas from CDN then run
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => {
      window.html2canvas(el, { scale:2, useCORS:true, backgroundColor:"#0a0a0a" })
        .then(canvas => {
          const a = document.createElement("a");
          a.href    = canvas.toDataURL("image/png");
          a.download = `FlonexTV-Certificate-${certId}.png`;
          a.click();
        });
    };
    document.head.appendChild(script);
  }

  // ── Social share ─────────────────────────────────────────
  const shareText = `🏆 I just earned the "${courseTitle}" certificate on @FlonexTV Academy!\n\nCompleted all modules, passed an AI exam, and submitted a practical task.\nCertificate ID: ${certId}\n\nFree learning platform for Nigeria 🇳🇬\n👉 flonextv.vercel.app\n\n#FlonexTV #FreeEducation #Nigeria #Certified`;

  function shareX()       { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank"); }
  function shareLinkedIn(){ window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://flonextv.vercel.app")}&summary=${encodeURIComponent(shareText)}`, "_blank"); }
  function copyPost()     { navigator.clipboard?.writeText(shareText).catch(()=>{}); }

  // ── Name prompt screen ───────────────────────────────────
  if (!nameConfirmed) {
    return (
      <div style={{background:"var(--bg)",minHeight:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
          position:"sticky",top:0,background:"rgba(15,15,15,.97)",borderBottom:"1px solid var(--line)",zIndex:50}}>
          <button className="tap" onClick={onBack}
            style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="back" size={17} color="#fff"/>
          </button>
          <p style={{fontWeight:900,fontSize:16}}>Your Certificate</p>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:16}}>🎓</div>
          <p style={{fontWeight:900,fontSize:22,marginBottom:8}}>
            One Last Step
          </p>
          <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.5)",
            lineHeight:1.7,marginBottom:28,maxWidth:300}}>
            Enter your real name exactly as you want it to appear on your certificate.
          </p>
          <div style={{width:"100%",maxWidth:340}}>
            <input
              type="text"
              value={nameInput}
              onChange={e=>setNameInput(e.target.value)}
              placeholder="e.g. Emmanuel Ariyo"
              style={{
                width:"100%",background:"var(--bg2)",border:"1px solid var(--line)",
                borderRadius:10,padding:"14px 16px",color:"var(--text)",
                fontSize:16,fontWeight:700,fontFamily:"inherit",
                boxSizing:"border-box",outline:"none",marginBottom:12,
              }}
              onFocus={e=>e.target.style.borderColor="var(--red)"}
              onBlur={e=>e.target.style.borderColor="var(--line)"}
            />
            <button className="pbtn r tap"
              style={{width:"100%",justifyContent:"center",padding:"13px 0",fontSize:15}}
              onClick={()=>{
                if(nameInput.trim().length<2) return;
                setDisplayName(nameInput.trim());
                setNameConfirmed(true);
              }}>
              Generate My Certificate →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Certificate card ─────────────────────────────────────
  // Styled exactly like the Nomba reference:
  // Dark bg, thick yellow top/bottom bars, spaced caps header,
  // large bold gold name, clean minimal layout

  return (
    <div style={{background:"#111",minHeight:"100%",paddingBottom:40}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
        position:"sticky",top:0,background:"rgba(10,10,10,.97)",
        borderBottom:"1px solid #222",zIndex:50}}>
        <button className="tap" onClick={onBack}
          style={{width:36,height:36,borderRadius:"50%",background:"#222",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <div style={{flex:1}}>
          <p style={{fontWeight:900,fontSize:16}}>Your Certificate</p>
          <p style={{fontSize:11,fontWeight:600,color:"#666"}}>{courseTitle}</p>
        </div>
        <button
          style={{background:"#E50914",border:"none",borderRadius:8,
            padding:"8px 14px",color:"#fff",fontWeight:800,fontSize:12,
            cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
          onClick={downloadPNG}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13M7 11l5 5 5-5M3 20h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save PNG
        </button>
      </div>

      {/* Congratulations */}
      <div style={{margin:"14px 14px 0",background:"rgba(34,197,94,.07)",
        border:"1px solid rgba(34,197,94,.18)",borderRadius:10,padding:"12px 14px",
        display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:24}}>🏆</span>
        <div>
          <p style={{fontWeight:900,fontSize:14,marginBottom:1}}>
            Congratulations, {displayName.split(" ")[0]}!
          </p>
          <p style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.45)"}}>
            You completed the course, passed the exam, and submitted a practical task.
          </p>
        </div>
      </div>

      {/* ── THE CERTIFICATE CARD ── */}
      <div style={{padding:"14px"}}>
        <div id="flx-cert-card" style={{
          background:"#0a0a0a",
          borderRadius:8,
          overflow:"hidden",
          border:"1px solid #222",
          fontFamily:"'Nunito',Arial,sans-serif",
        }}>
          {/* Thick yellow top bar */}
          <div style={{height:18,background:"#F5C000"}}/>

          {/* Content area */}
          <div style={{padding:"32px 28px 28px"}}>

            {/* Top row: Logo left | CERTIFICATE OF COMPLETION right */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:40}}>
              {/* Logo */}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#E50914",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <polygon points="5,3 5,21 19,12" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p style={{fontWeight:900,fontSize:18,letterSpacing:"-.02em",margin:0,color:"#fff"}}>
                    Flonex<span style={{color:"#E50914"}}>TV</span>
                  </p>
                </div>
              </div>
              {/* Top right label */}
              <p style={{fontSize:10,fontWeight:700,color:"#888",letterSpacing:".15em",
                textTransform:"uppercase",margin:0,textAlign:"right"}}>
                CERTIFICATE OF COMPLETION
              </p>
            </div>

            {/* Center content */}
            <div style={{textAlign:"center",marginBottom:36}}>
              {/* Category label */}
              <p style={{fontSize:11,fontWeight:800,color:"#888",letterSpacing:".2em",
                textTransform:"uppercase",marginBottom:10}}>
                CERTIFIED FLONEXTV GRADUATE
              </p>
              <p style={{fontSize:12,fontWeight:600,color:"#666",marginBottom:16}}>
                This is to certify that
              </p>
              {/* Name — large gold bold like Nomba */}
              <p style={{
                fontSize:40,fontWeight:900,color:"#F5C000",
                letterSpacing:"-.02em",lineHeight:1.1,margin:"0 0 20px",
                wordBreak:"break-word",
              }}>
                {displayName}
              </p>
              {/* Completion text */}
              <p style={{fontSize:13,fontWeight:600,color:"#888",marginBottom:6}}>
                has successfully completed
              </p>
              <p style={{fontSize:15,fontWeight:900,color:"#fff",lineHeight:1.4}}>
                {courseTitle}
              </p>
              <p style={{fontSize:11,fontWeight:600,color:"#555",marginTop:6}}>
                including all modules, AI-generated exam, and practical task review
              </p>
            </div>

            {/* Divider */}
            <div style={{height:1,background:"#222",marginBottom:20}}/>

            {/* Bottom row: Logo | Cert ID + Date | Partner */}
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:8}}>
              {/* Left: Issuer */}
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#E50914",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 5,21 19,12" fill="white"/>
                    </svg>
                  </div>
                  <p style={{fontWeight:900,fontSize:12,color:"#fff",margin:0}}>
                    Flonex<span style={{color:"#E50914"}}>TV</span>
                  </p>
                </div>
                <p style={{fontSize:9,fontWeight:700,color:"#555",letterSpacing:".12em",
                  textTransform:"uppercase",margin:0}}>ISSUER</p>
              </div>

              {/* Center: Cert ID + date */}
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:10,fontWeight:700,color:"#666",
                  fontFamily:"monospace",letterSpacing:".06em",marginBottom:3}}>
                  {certId}
                </p>
                <p style={{fontSize:11,fontWeight:600,color:"#555",margin:0}}>
                  Issued {dateStr}
                </p>
              </div>

              {/* Right: Emmanuel Ariyo as Director */}
              <div style={{textAlign:"right"}}>
                <p style={{fontWeight:900,fontSize:12,color:"#fff",margin:"0 0 4px"}}>
                  <span style={{color:"#F5C000"}}>Dev</span>Career
                </p>
                <p style={{fontSize:9,fontWeight:700,color:"#555",letterSpacing:".12em",
                  textTransform:"uppercase",margin:0}}>PARTNER</p>
              </div>
            </div>
          </div>

          {/* Thick yellow bottom bar */}
          <div style={{height:18,background:"#F5C000"}}/>
        </div>
      </div>

      {/* Download hint */}
      <p style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#555",
        padding:"0 16px 12px"}}>
        Tap "Save PNG" to download your certificate as an image
      </p>

      {/* Share section */}
      <div style={{margin:"0 14px",background:"#161616",border:"1px solid #222",
        borderRadius:10,padding:"14px 16px",marginBottom:12}}>
        <p style={{fontWeight:800,fontSize:13,marginBottom:12}}>
          Share Your Achievement
        </p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {/* X / Twitter */}
          <button onClick={shareX}
            style={{display:"flex",alignItems:"center",gap:6,background:"#000",
              border:"1px solid #333",borderRadius:8,padding:"9px 14px",
              color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63z"/>
            </svg>
            Post on X
          </button>
          {/* LinkedIn */}
          <button onClick={shareLinkedIn}
            style={{display:"flex",alignItems:"center",gap:6,background:"#0A66C2",
              border:"none",borderRadius:8,padding:"9px 14px",
              color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2" fill="white"/>
            </svg>
            LinkedIn
          </button>
          {/* Copy */}
          <button onClick={copyPost}
            style={{display:"flex",alignItems:"center",gap:6,background:"#222",
              border:"1px solid #333",borderRadius:8,padding:"9px 14px",
              color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="white" strokeWidth="2"/>
            </svg>
            Copy Post
          </button>
        </div>
        {/* Instagram note */}
        <p style={{fontSize:10,fontWeight:600,color:"#555",marginTop:10}}>
          For Instagram: tap "Save PNG", then upload the image to your story or feed with the copied caption.
        </p>
      </div>

      {/* Cert ID copy */}
      <div style={{margin:"0 14px 14px",background:"#161616",border:"1px solid #222",
        borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1}}>
          <p style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",
            letterSpacing:".1em",marginBottom:2}}>Certificate ID</p>
          <p style={{fontSize:12,fontWeight:800,fontFamily:"monospace",color:"#F5C000"}}>
            {certId}
          </p>
        </div>
        <button onClick={()=>navigator.clipboard?.writeText(certId)}
          style={{background:"#222",border:"1px solid #333",borderRadius:6,
            padding:"6px 10px",color:"#888",fontWeight:700,fontSize:11,cursor:"pointer"}}>
          Copy ID
        </button>
      </div>

      <button className="tap"
        style={{display:"block",margin:"0 14px",width:"calc(100% - 28px)",
          background:"#1a1a1a",border:"1px solid #222",borderRadius:8,
          padding:"12px 0",color:"#888",fontWeight:800,fontSize:13,cursor:"pointer"}}
        onClick={onBack}>
        Back to Courses
      </button>
    </div>
  );
}

/* ─── AI EXAM ─────────────────────────────────────────────────── */
function AIExam({course, user, onPass, onFail, onClose}) {
  const [phase,     setPhase]     = useState("intro");   // intro|loading|exam|grading|result
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [result,    setResult]    = useState(null);
  const [err,       setErr]       = useState("");

  async function startExam() {
    setPhase("loading"); setErr("");
    try {
      const res = await fetch("/api/courses/exam", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          action:          "generate",
          courseTitle:     course.title,
          courseCategory:  course.category,
          modules:         course.modules || [],
        }),
      });
      const data = await res.json();
      if (!data.questions?.length) throw new Error(data.error || "No questions returned");
      setQuestions(data.questions);
      setAnswers({});
      setPhase("exam");
    } catch (e) {
      setErr("Could not load exam. Check your GROQ_API_KEY. " + String(e));
      setPhase("intro");
    }
  }

  async function submitExam() {
    if (Object.keys(answers).length < questions.length) {
      setErr("Please answer all questions before submitting.");
      return;
    }
    setErr(""); setPhase("grading");
    try {
      const res = await fetch("/api/courses/exam", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ action:"grade", questions, answers }),
      });
      const data = await res.json();
      setResult(data);
      setPhase("result");
      if (data.passed) onPass(data);
    } catch {
      setErr("Grading failed. Please try again.");
      setPhase("exam");
    }
  }

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div style={{background:"var(--bg)",minHeight:"100%",paddingBottom:40}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
        position:"sticky",top:0,background:"rgba(15,15,15,.97)",zIndex:50,
        borderBottom:"1px solid var(--line)"}}>
        <button className="tap" onClick={onClose}
          style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="back" size={17} color="#fff"/>
        </button>
        <div style={{flex:1}}>
          <p style={{fontWeight:900,fontSize:15}}>Course Exam</p>
          <p style={{fontSize:11,fontWeight:600,color:"var(--t3)"}}>{course.title}</p>
        </div>
        {phase==="exam"&&<span style={{fontSize:12,fontWeight:700,color:"var(--t3)"}}>
          {Object.keys(answers).length}/{questions.length} answered
        </span>}
      </div>

      <div style={{padding:"20px 16px"}}>

        {/* ── INTRO ── */}
        {phase==="intro"&&(<div style={{textAlign:"center",paddingTop:20}}>
          <div style={{width:80,height:80,borderRadius:"50%",margin:"0 auto 20px",
            background:"rgba(229,9,20,.1)",border:"2px solid rgba(229,9,20,.25)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{fontWeight:900,fontSize:22,letterSpacing:"-.02em",marginBottom:10}}>
            Ready for Your Exam?
          </h2>
          <p style={{fontSize:14,fontWeight:600,color:"var(--t3)",lineHeight:1.7,
            marginBottom:6,maxWidth:320,margin:"0 auto 8px"}}>
            5 AI-generated questions based on <strong style={{color:"var(--text)"}}>{course.title}</strong>.
          </p>
          <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",marginBottom:28}}>
            Pass mark: 70% — You can retake if you don't pass.
          </p>
          {err&&<p style={{fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:14}}>{err}</p>}
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="pbtn r tap" onClick={startExam}>
              <Icon name="play" size={14} color="#fff"/>Start Exam
            </button>
            <button className="pbtn gr tap" onClick={onClose}>Not Now</button>
          </div>
        </div>)}

        {/* ── LOADING ── */}
        {phase==="loading"&&<div style={{textAlign:"center",paddingTop:40}}>
          <Icon name="spinner" size={40} color="var(--red)" style={{margin:"0 auto 16px"}}/>
          <p style={{fontSize:14,fontWeight:700,color:"var(--t3)"}}>AI is generating your exam…</p>
        </div>}

        {/* ── EXAM ── */}
        {phase==="exam"&&(<div>
          {err&&<p style={{fontSize:13,fontWeight:700,color:"var(--red)",marginBottom:14}}>{err}</p>}
          {questions.map((q, qi) => (
            <div key={q.id} style={{background:"var(--bg2)",borderRadius:12,padding:"16px",
              marginBottom:14,border:"1px solid var(--line)"}}>
              <p style={{fontWeight:800,fontSize:14,marginBottom:12,lineHeight:1.5}}>
                <span style={{color:"var(--red)",marginRight:6}}>Q{qi+1}.</span>
                {q.question}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(q.options||[]).map(opt => {
                  const letter = opt.charAt(0);
                  const chosen = answers[q.id] === letter;
                  return (
                    <button key={opt} onClick={() => setAnswers(a=>({...a,[q.id]:letter}))}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                        borderRadius:8,border:`1.5px solid ${chosen?"var(--red)":"var(--line)"}`,
                        background:chosen?"rgba(229,9,20,.08)":"var(--bg3)",
                        cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                      <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,
                        background:chosen?"var(--red)":"var(--bg4)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:12,color:chosen?"#fff":"var(--t3)"}}>
                        {letter}
                      </div>
                      <span style={{fontWeight:600,fontSize:13,color:chosen?"var(--text)":"var(--t2)"}}>
                        {opt.slice(3)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button className="pbtn r tap" disabled={!allAnswered}
            style={{width:"100%",justifyContent:"center",padding:"14px 0",marginTop:8,fontSize:15}}
            onClick={submitExam}>
            Submit Exam
          </button>
          {!allAnswered&&<p style={{textAlign:"center",fontSize:12,fontWeight:600,
            color:"var(--t3)",marginTop:8}}>Answer all questions to submit</p>}
        </div>)}

        {/* ── GRADING ── */}
        {phase==="grading"&&<div style={{textAlign:"center",paddingTop:40}}>
          <Icon name="spinner" size={40} color="var(--red)" style={{margin:"0 auto 16px"}}/>
          <p style={{fontSize:14,fontWeight:700,color:"var(--t3)"}}>Grading your answers…</p>
        </div>}

        {/* ── RESULT ── */}
        {phase==="result"&&result&&(<div style={{textAlign:"center"}}>
          {/* Score ring */}
          <div style={{width:120,height:120,borderRadius:"50%",margin:"0 auto 20px",
            background: result.passed
              ? "linear-gradient(135deg,rgba(22,163,74,.15),rgba(22,163,74,.05))"
              : "linear-gradient(135deg,rgba(229,9,20,.15),rgba(229,9,20,.05))",
            border:`3px solid ${result.passed?"var(--green)":"var(--red)"}`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontWeight:900,fontSize:32,
              color:result.passed?"var(--green)":"var(--red)"}}>{result.score}%</span>
            <span style={{fontSize:11,fontWeight:800,
              color:result.passed?"var(--green)":"var(--red)",letterSpacing:".06em"}}>
              {result.passed?"PASS":"FAIL"}
            </span>
          </div>

          <h2 style={{fontWeight:900,fontSize:22,marginBottom:6}}>
            {result.passed ? "Congratulations!" : "Not quite there yet"}
          </h2>
          <p style={{fontSize:14,fontWeight:600,color:"var(--t3)",marginBottom:20}}>
            {result.correct}/{result.total} correct · Pass mark: 70%
          </p>

          {/* Per-question breakdown */}
          <div style={{textAlign:"left",marginBottom:20}}>
            {(result.results||[]).map(r => (
              <div key={r.id} style={{background:"var(--bg2)",borderRadius:10,padding:"12px 14px",
                marginBottom:8,border:`1px solid ${r.isCorrect?"rgba(22,163,74,.25)":"rgba(229,9,20,.2)"}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:r.isCorrect?0:6}}>
                  <span style={{fontWeight:900,fontSize:13,
                    color:r.isCorrect?"var(--green)":"var(--red)",flexShrink:0}}>
                    {r.isCorrect?"✓":"✗"}
                  </span>
                  <p style={{fontWeight:700,fontSize:13,lineHeight:1.4}}>{r.question}</p>
                </div>
                {!r.isCorrect&&<p style={{fontSize:12,fontWeight:600,color:"var(--t3)",
                  marginTop:6,lineHeight:1.5,paddingLeft:20}}>
                  Correct: {r.correct}) · {r.explanation}
                </p>}
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {result.passed ? (
              <button className="pbtn g tap"
                onClick={() => onPass(result)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 21h8M12 17v4M7 4H4a2 2 0 00-2 2v1a5 5 0 005 5h.5M17 4h3a2 2 0 012 2v1a5 5 0 01-5 5h-.5M6 4h12v6a6 6 0 01-12 0V4z"
                    stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Get Certificate
              </button>
            ) : (<>
              <button className="pbtn r tap" onClick={startExam}>Retake Exam</button>
              <button className="pbtn gr tap" onClick={onFail}>Restart Course</button>
            </>)}
            <button className="pbtn gr tap" onClick={onClose}>Close</button>
          </div>
        </div>)}
      </div>
    </div>
  );
}

/* ─── FOOTER ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <div style={{margin:"0 16px 24px",background:"var(--bg1)",borderRadius:16,
      padding:"28px 20px",textAlign:"center",border:"1px solid var(--line)"}}>
      {/* Logo using Nunito bold */}
      <div style={{marginBottom:8}}>
        <FlonexLogo size={32} showTagline={true}/>
      </div>
      <p style={{fontSize:12,fontWeight:700,color:"var(--t3)",marginBottom:22}}>
        Free legal streaming · Public domain · YouTube · Open source
      </p>

      {/* ── Developer credit — "Software Developer" ── */}
      <p style={{fontWeight:900,fontSize:20,letterSpacing:"-.02em",marginBottom:3}}>
        Emmanuel Ariyo
      </p>
      <p style={{fontSize:11,fontWeight:800,color:"var(--t3)",letterSpacing:".1em",
        textTransform:"uppercase",marginBottom:20}}>
        Software Developer
      </p>

      <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:20}}>
        {[
          ["https://github.com/Ememzyvisuals/FlonexTV", "github"],
          ["https://x.com/Ememzyvisuals",                "x_s"],
          ["https://www.tiktok.com/@Ememzyvisuals",       "tiktok"],
        ].map(([href, icon]) => (
          <a key={href} href={href} target="_blank" rel="noreferrer" className="tap"
            style={{width:42,height:42,borderRadius:"50%",
              border:"1px solid rgba(255,255,255,.12)",display:"flex",
              alignItems:"center",justifyContent:"center",
              color:"rgba(255,255,255,.55)"}}>
            <Icon name={icon} size={16} color="currentColor"/>
          </a>
        ))}
      </div>

      <a href="https://github.com/Ememzyvisuals/FlonexTV" target="_blank"
        rel="noreferrer" className="pbtn r tap"
        style={{textDecoration:"none",marginBottom:16,display:"inline-flex"}}>
        <Icon name="star" size={14} color="#fff"/>Star on GitHub
      </a>

      <p style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginTop:16}}>
        © 2026 FlonexTV · EMEMZYVISUALS · TMDB · Groq AI · Archive.org · YouTube
      </p>
    </div>
  );
}

/* ─── Sidebar + Header ────────────────────────────────────────── */
const NAV_ICONS = {home:"home", search:"search", shorts:"fire", courses:"legal", library:"library", profile:"profile"};

function NavIcon({id, active}) {
  const wl = id === "library" ? (S.get("cv_wl")||[]).length : 0;
  return (
    <div style={{position:"relative",display:"inline-flex"}}>
      <Icon name={NAV_ICONS[id]||"home"} size={24}
        color={active ? "var(--red)" : "rgba(229,229,229,.38)"}/>
      {wl > 0 && (
        <span style={{position:"absolute",top:-3,right:-5,
          background:"var(--red)",color:"#fff",borderRadius:8,
          fontSize:8,fontWeight:900,padding:"0 3px",lineHeight:"14px",
          minWidth:14,textAlign:"center",pointerEvents:"none"}}>
          {wl > 9 ? "9+" : wl}
        </span>
      )}
    </div>
  );
}

function Sidebar({page, setPage}) {
  const tabs = [
    {id:"home",    label:"Home"},
    {id:"search",  label:"Search"},
    {id:"courses", label:"Courses"},
    {id:"shorts",  label:"Shorts"},
    {id:"library", label:"Library"},
    {id:"profile", label:"Profile"},
  ];
  return (
    <aside className="sidebar desktop-only">
      <div style={{padding:"12px 18px 24px"}}>
        <FlonexLogo size={24} showTagline={true}/>
      </div>
      {tabs.map(tab => (
        <button key={tab.id} className={"sbi"+(page===tab.id?" on":"")}
          onClick={() => setPage(tab.id)}>
          <Icon name={NAV_ICONS[tab.id]} size={18}
            color={page===tab.id ? "var(--red)" : "currentColor"}/>
          {tab.label}
        </button>
      ))}
      <div style={{marginTop:"auto",padding:"16px 18px",borderTop:"1px solid var(--line)"}}>
        <p style={{fontSize:11,fontWeight:700,color:"var(--t3)",lineHeight:1.65}}>
          FlonexTV v5.0<br/>© 2026 EMEMZYVISUALS
        </p>
      </div>
    </aside>
  );
}

function Header({onSearch, lang, setLang}) {
  return (
    <header style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
      position:"sticky",top:0,zIndex:300,background:"rgba(15,15,15,.97)",
      backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
      borderBottom:"1px solid var(--line)"}}>
      <div className="mobile-only" style={{flexShrink:0}}>
        <FlonexLogo size={22}/>
      </div>

      <div onClick={onSearch}
        style={{flex:1,display:"flex",alignItems:"center",background:"var(--bg2)",
          borderRadius:10,height:40,gap:8,padding:"0 12px",
          border:"1px solid var(--line)",cursor:"text"}}>
        <Icon name="search" size={12} color="var(--t3)"/>
        <span style={{fontSize:11,fontWeight:600,color:"var(--t3)",flex:1,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          Search…
        </span>
        <span style={{fontSize:11,fontWeight:800,color:"var(--red)"}}>Search</span>
      </div>

      <select value={lang} onChange={e => setLang(e.target.value)}
        style={{appearance:"none",WebkitAppearance:"none",
          background:"var(--bg2)",border:"1px solid var(--line)",borderRadius:18,
          padding:"6px 10px",color:"var(--text)",fontSize:12,fontWeight:700,
          cursor:"pointer",outline:"none",flexShrink:0,maxWidth:88}}>
        {LANGS.slice(0,9).map(l => (
          <option key={l.code} value={l.code}>{l.code ? l.label : "All"}</option>
        ))}
      </select>
    </header>
  );
}

/* ─── OFFLINE STATE ─────────────────────────────────────────── */
function OfflineState({onRetry}) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"var(--bg)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"24px", textAlign:"center",
    }}>
      {/* Wi-Fi off SVG icon — no emoji */}
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
        style={{marginBottom:20, opacity:.4}}>
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"
          stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h2 style={{fontWeight:900, fontSize:22, letterSpacing:"-.02em", marginBottom:10, color:"var(--text)"}}>
        You're offline
      </h2>
      <p style={{fontSize:14, fontWeight:600, color:"var(--t3)", lineHeight:1.7,
        marginBottom:28, maxWidth:280}}>
        Check your internet connection and try again.
      </p>
      <button className="pbtn r tap" onClick={onRetry}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Retry
      </button>
    </div>
  );
}

/* ─── ERROR STATE ────────────────────────────────────────────── */
function ErrorState({message, onRetry}) {
  return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"40vh", padding:"32px 24px", textAlign:"center"}}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{marginBottom:14, opacity:.5}}>
        <circle cx="12" cy="12" r="10" stroke="var(--t3)" strokeWidth="1.5"/>
        <path d="M12 8v4M12 16h.01" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p style={{fontWeight:800, fontSize:15, color:"var(--t2)", marginBottom:8}}>
        {message || "Unable to load content right now."}
      </p>
      {onRetry && (
        <button className="pbtn gr tap" style={{marginTop:10, fontSize:13}} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

/* ─── ROOT ────────────────────────────────────────────────────── */
export default function CineVault() {
  const [page,     setPage]    = useState("home");
  const [playing,  setPlaying] = useState(null);
  const [detail,   setDetail]  = useState(null);
  const [showAll,  setShowAll] = useState(null);
  const [certData, setCertData]= useState(null);
  const [lang,     setLang]    = useState(() => S.get("cv_lang")||"en");
  const [user,     setUser]    = useState(() => S.get("cv_user"));
  const [offline,  setOffline] = useState(false);
  const scrollRef = useRef(null);



  // ── Offline detection ─────────────────────────────────────────
  useEffect(() => {
    function handleOffline()  { setOffline(true);  }
    function handleOnline()   { setOffline(false); }
    setOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, []);

  // Sync user state with localStorage
  function loginUser(u) { S.set("cv_user", u); setUser(u); }
  function logoutUser() { S.set("cv_user", null); setUser(null); }

  useEffect(() => { S.set("cv_lang", lang); }, [lang]);

  function goTo(p) {
    setPage(p); setPlaying(null); setDetail(null); setShowAll(null); setCertData(null);
    if (scrollRef.current) scrollRef.current.scrollTo({top:0, behavior:"smooth"});
  }

  async function handlePlay(item) {
    // ── YouTube: play directly in-app via iframe ─────────────────────
    if (item.isYouTube || item.source === "youtube" || (item.cvId||"").startsWith("youtube:")) {
      S.push("cv_hist", item, 50);
      setPlaying({
        ...item,
        _playerType: "youtube",
        embedUrl: item.embedUrl || ("https://www.youtube.com/embed/" + (item.cvId||"").replace("youtube:","") + "?autoplay=1&rel=0&modestbranding=1"),
      });
      setDetail(null); setShowAll(null);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }

    // ── Archive / TMDB: fetch stream data from API ────────────────────
    const id = item.cvId || item.id || ("tmdb:" + item.id);
    try {
      const res  = await fetch("/api/watch/" + encodeURIComponent(String(id)) + "?type=" + (item.type||"movie"));
      const data = await res.json();
      if (data.success) {
        S.push("cv_hist", item, 50);
        // YouTube result from API
        if (data.source === "youtube" || data.isYouTube) {
          setPlaying({
            ...item,
            _playerType: "youtube",
            embedUrl:  data.embedUrl,
            watchUrl:  data.watchUrl,
            channel:   data.channel,
          });
        } else {
          setPlaying({...item, _playerType:"video", streamUrl:data.streamUrl, downloadUrl:data.downloadUrl, downloads:data.downloads||[]});
        }
        setDetail(null); setShowAll(null);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } else {
        handleDetail(item);
      }
    } catch {
      handleDetail(item);
    }
  }

  function handleDetail(item) {
    setDetail(item); setPlaying(null); setShowAll(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  // Map section title → category key for ShowAllPage infinite loading
  const TITLE_TO_CAT = {
    "Nollywood Picks":      "nollywood",
    "Hollywood Selections": "hollywood",
    "Bollywood Hits":       "bollywood",
    "Korean Cinema":        "korean",
    "Faith & Inspiration":  "christian",
    "Yoruba Films":         "yoruba",
    "Comedy Shorts":        "comedy",
    "Trending Shorts":      "comedy",
  };
  function handleShowAll(title, items) {
    const category = TITLE_TO_CAT[title] || null;
    setShowAll({title, items, category}); setPlaying(null); setDetail(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  function handleBack() {
    if (playing) { setPlaying(null); return; }
    if (detail)  { setDetail(null);  return; }
    if (showAll) { setShowAll(null); return; }
  }

  const activeNav = (playing || detail || showAll) ? "none" : page;
  const showHeader = !playing && page !== "shorts" && page !== "courses";

  function renderMain() {
    // ── Playing state: dispatch to correct player ─────────────────────
    if (playing) {
      if (playing._playerType === "youtube" || playing.isYouTube || playing.source === "youtube") {
        return (
          <YouTubePlayer
            embedUrl={playing.embedUrl}
            title={playing.title}
            channel={playing.channel || playing.overview?.replace("YouTube · ","")}
            thumbnail={playing.poster || playing.backdrop}
            onBack={() => setPlaying(null)}
            onDetail={handleDetail}
            item={playing}
          />
        );
      }
      return (
        <VideoPlayer
          streamUrl={playing.streamUrl}
          downloadUrl={playing.downloadUrl}
          downloads={playing.downloads||[]}
          title={playing.title}
          onBack={() => setPlaying(null)}
          onDetail={handleDetail}
          item={playing}
        />
      );
    }
    if (detail) {
      return (
        <DetailPage
          item={detail}
          onPlay={handlePlay}
          onBack={handleBack}
          onDetail={handleDetail}
        />
      );
    }
    if (showAll) {
      return (
        <ShowAllPage
          title={showAll.title}
          items={showAll.items}
          onBack={() => setShowAll(null)}
          onDetail={handleDetail}
        />
      );
    }
    if (page === "home")    return <HomePage onPlay={handlePlay} onDetail={handleDetail} onShowAll={handleShowAll} lang={lang} onGoToCourses={()=>goTo("courses")} onGoToShorts={()=>goTo("shorts")}/>;
    if (page === "search")  return <SearchPage onPlay={handlePlay} onDetail={handleDetail}/>;
    if (page === "shorts")  return <ShortsPage onBack={() => goTo("home")}/>;
    if (page === "courses") {
      if (certData) return <CertificatePage certData={certData} onBack={() => setCertData(null)}/>;
      return <CoursesPage user={user} onGoProfile={() => goTo("profile")}
        onGoDetail={(d) => { if (d._type==="certificate") setCertData(d); }}/>;
    }
    if (page === "library") return <LibraryPage onPlay={handlePlay} onDetail={handleDetail}/>;
    if (page === "profile") return <ProfilePage lang={lang} setLang={setLang} user={user} onLogin={loginUser} onLogout={logoutUser}/>;
    return <HomePage onPlay={handlePlay} onDetail={handleDetail} onShowAll={handleShowAll} lang={lang}/>;
  }

  return (
    <>
      <Styles/>
      {offline && <OfflineState onRetry={() => { setOffline(!navigator.onLine); window.location.reload(); }}/>}

      <div style={{height:"100dvh",display:"flex",flexDirection:"column",
        background:"var(--bg)",maxWidth:1280,margin:"0 auto",
        position:"relative",overflow:"hidden"}}>

        {showHeader && (
          <Header onSearch={() => goTo("search")} lang={lang} setLang={setLang}/>
        )}

        <div style={{flex:1,overflow:"hidden",display:"flex",minHeight:0}}>
          <Sidebar page={page} setPage={goTo}/>
          <div
            ref={scrollRef}
            key={playing ? "p"+(playing.streamUrl||playing.embedUrl) : detail ? "d"+detail.id : showAll ? "sa" : page}
            style={{flex:1,overflowY:page==="shorts"?"hidden":"auto",overflowX:"hidden",
              paddingBottom: page==="shorts" ? 0 : "var(--nav)",
              WebkitOverflowScrolling:"touch"}}>
            {renderMain()}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="bnav mobile-only">
          {["home","courses","shorts","library","profile"].map(id => {
            const active = activeNav === id;
            return (
              <button key={id} className="bni" onClick={() => goTo(id)}>
                <NavIcon id={id} active={active}/>
                <span style={{
                  color: active ? "var(--red)" : "rgba(229,229,229,.38)",
                  transition:"color .14s",
                  fontSize:9,
                }}>
                  {t(id, lang)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ─── COURSE MODULE PANEL ───────────────────────────────────── */
function CourseModulePanel({mod, course, isModDone, onMarkDone, onNext}) {
  const [notes,    setNotes]    = useState(null);
  const [loadingN, setLoadingN] = useState(false);
  const [tab,      setTab]      = useState("overview");

  async function loadTheory() {
    if (notes) { setTab("theory"); return; }
    setLoadingN(true);
    try {
      const res = await fetch("/api/courses/theory", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          moduleTitle: mod.title, moduleDescription: mod.description||"",
          courseTitle: course.title, courseCategory: course.category,
        }),
      });
      const data = await res.json();
      setNotes(data.notes || null);
    } catch {}
    setLoadingN(false); setTab("theory");
  }

  return (
    <div style={{padding:"14px 16px",background:"var(--bg)",flex:1,overflowY:"auto"}}>
      <h3 style={{fontWeight:900,fontSize:16,marginBottom:4}}>{mod.position}. {mod.title}</h3>
      <div style={{display:"flex",gap:0,background:"var(--bg2)",borderRadius:8,padding:2,marginBottom:14}}>
        {[["overview","Overview"],["theory","AI Notes"]].map(([id,label])=>(
          <button key={id} onClick={()=> id==="theory" ? loadTheory() : setTab(id)}
            style={{flex:1,padding:"7px 0",borderRadius:6,border:"none",fontWeight:800,
              fontSize:12,cursor:"pointer",transition:"all .15s",
              background:tab===id?"var(--red)":"transparent",color:tab===id?"#fff":"var(--t3)"}}>
            {label}
          </button>
        ))}
      </div>
      {tab==="overview" && (
        <div>
          {mod.description && <p style={{fontSize:13,fontWeight:600,color:"var(--t2)",lineHeight:1.7,marginBottom:14}}>{mod.description}</p>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {!isModDone ? (
              <button className="pbtn g tap" onClick={onMarkDone}><Icon name="check" size={13} color="#fff"/>Mark as Complete</button>
            ) : (
              <span className="pbtn gr" style={{cursor:"default"}}><Icon name="check" size={13} color="var(--green)"/>Completed</span>
            )}
            {onNext && <button className="pbtn r tap" onClick={onNext}><Icon name="play" size={12} color="#fff"/>Next Module</button>}
          </div>
        </div>
      )}
      {tab==="theory" && (
        <div>
          {loadingN && <div style={{display:"flex",gap:10,alignItems:"center",padding:"20px 0"}}><Icon name="spinner" size={20} color="var(--red)"/><p style={{fontSize:13,fontWeight:700,color:"var(--t3)"}}>Generating AI notes…</p></div>}
          {!loadingN && !notes && <p style={{fontSize:13,fontWeight:600,color:"var(--t3)"}}>Could not load notes. Check GROQ_API_KEY.</p>}
          {!loadingN && notes && (
            <div style={{fontSize:13,lineHeight:1.7}}>
              {notes.summary && <div style={{background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.15)",borderRadius:8,padding:"10px 12px",marginBottom:14}}><p style={{fontWeight:700,color:"rgba(255,255,255,.8)"}}>{notes.summary}</p></div>}
              {(notes.concepts||[]).map((co,i)=>(
                <div key={i} style={{marginBottom:8,paddingLeft:12,borderLeft:"2px solid var(--red)"}}>
                  <p style={{fontWeight:800,fontSize:13,marginBottom:2}}>{co.title}</p>
                  <p style={{fontWeight:600,color:"var(--t2)",fontSize:12,lineHeight:1.65}}>{co.explanation}</p>
                </div>
              ))}
              {(notes.keyTakeaways||[]).map((t,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                  <span style={{color:"var(--green)",fontWeight:900}}>✓</span>
                  <p style={{fontWeight:600,fontSize:12,color:"var(--t2)",lineHeight:1.6}}>{t}</p>
                </div>
              ))}
              {notes.practicalInsight && (
                <div style={{background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.15)",borderRadius:8,padding:"10px 12px",marginTop:8}}>
                  <p style={{fontSize:10,fontWeight:800,color:"rgba(255,215,0,.6)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>Pro Tip</p>
                  <p style={{fontWeight:600,fontSize:12,color:"rgba(255,255,255,.75)",lineHeight:1.65}}>{notes.practicalInsight}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AutoProgressMarker({onComplete, mod}) {
  useEffect(() => {
    function onMsg(e) {
      try {
        const d = typeof e.data==="string" ? JSON.parse(e.data) : e.data;
        if (d?.event==="onStateChange" && d?.info===0) onComplete();
      } catch {}
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [mod?.youtube_id]);
  return null;
}

function CourseCard({course, progress, onClick}) {
  const pct  = progress?.percent_complete || 0;
  const done = progress?.is_completed;
  const catColors = {technology:"#3b82f6",business:"#10b981",faith:"#8b5cf6",health:"#f59e0b",creative:"#ec4899",general:"var(--red)"};
  const cc = catColors[course.category] || "var(--red)";
  return (
    <div className="card tap" onClick={()=>onClick(course)}
      style={{background:"var(--bg2)",borderRadius:12,overflow:"hidden",
        border:`1px solid ${done?"rgba(22,163,74,.3)":"var(--line)"}`,cursor:"pointer"}}>
      <div style={{position:"relative",width:"100%",aspectRatio:"16/9",background:"var(--bg3)"}}>
        <ImgF src={course.thumbnail} alt={course.title} style={{width:"100%",height:"100%"}} radius={0}/>
        {done && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(22,163,74,.9)",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon name="check" size={18} color="#fff"/>
            </div>
          </div>
        )}
        <span style={{position:"absolute",top:6,left:6,background:cc,color:"#fff",
          fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:4,textTransform:"capitalize"}}>
          {course.category}
        </span>
        <span style={{position:"absolute",top:6,right:6,background:"rgba(22,163,74,.9)",color:"#fff",
          fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:4}}>FREE</span>
      </div>
      <div style={{padding:"10px 10px 12px"}}>
        <p style={{fontWeight:800,fontSize:13,marginBottom:4,lineHeight:1.3,
          overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
          {course.title}
        </p>
        <p style={{fontSize:10,fontWeight:600,color:"var(--t3)",marginBottom:pct>0?6:0}}>
          {course.total_modules} modules · {course.duration_min} min
        </p>
        {pct > 0 && (
          <div style={{height:3,borderRadius:2,background:"var(--bg3)"}}>
            <div style={{height:3,borderRadius:2,width:pct+"%",
              background:done?"var(--green)":"var(--red)",transition:"width .3s"}}/>
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesPage({user, onGoProfile, onGoDetail}) {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cat,      setCat]      = useState("all");
  const [selected, setSelected] = useState(null);
  const [watchingModule, setWatchingModule] = useState(null);
  const [progress, setProgress] = useState({});
  const [showExam, setShowExam] = useState(false);
  const [showTask, setShowTask] = useState(false);

  const CATS = [
    {key:"all",label:"All"},{key:"technology",label:"Tech"},
    {key:"business",label:"Business"},{key:"creative",label:"Creative"},
    {key:"faith",label:"Faith"},{key:"health",label:"Health"},
  ];

  useEffect(() => {
    const cacheKey = "courses_" + (user?.id||"anon");
    const cached = PAGE_CACHE.get(cacheKey);
    if (cached) { setCourses(cached.courses||[]); setProgress(cached.progress||{}); setLoading(false); }
    else setLoading(true);
    const url = "/api/courses" + (user?.id ? "?userId="+user.id : "");
    fetch(url).then(r=>r.json()).then(d => {
      const cs = d.courses||[];
      const local = {};
      cs.forEach(c => {
        const p = S.get("fx_prog_"+c.id);
        if (p) local[c.id] = p;
        if (c.userProgress) local[c.id] = c.userProgress;
      });
      PAGE_CACHE.set(cacheKey,{courses:cs,progress:local},5*60*1000);
      setCourses(cs); setProgress(local); setLoading(false);
    }).catch(()=>setLoading(false));
  }, [user?.id]);

  function openCourse(course) { setSelected(course); setWatchingModule(null); setShowExam(false); }
  function startModule(mod) { if (!user) { onGoProfile(); return; } setWatchingModule(mod); }

  async function markModuleDone(course, mod) {
    const prog = progress[course.id] || {completed_modules:[],percent_complete:0};
    const completed = new Set(prog.completed_modules||[]);
    completed.add(mod.position);
    const arr = Array.from(completed);
    const pct = Math.round((arr.length/course.total_modules)*100);
    const isDone = pct>=100;
    const newProg = {completed_modules:arr,percent_complete:pct,is_completed:isDone};
    setProgress(p=>({...p,[course.id]:newProg}));
    S.set("fx_prog_"+course.id, newProg);
    if (isDone) { const done=S.get("fx_courses_done")||{}; done[course.id]=true; S.set("fx_courses_done",done); }
    try {
      await fetch("/api/courses/"+course.id+"/progress",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userId:user?.id,modulePosition:mod.position,totalModules:course.total_modules,userName:user?.name,userEmail:user?.email,courseTitle:course.title}),
      });
    } catch {}
  }

  function handleExamPass() {
    setShowExam(false);
    setShowTask(true); // exam passed → practical task before cert
  }
  function handleExamFail() {
    if(selected){const r={completed_modules:[],percent_complete:0,is_completed:false};setProgress(p=>({...p,[selected.id]:r}));S.set("fx_prog_"+selected.id,r);}
    setShowExam(false);
  }

  if (showExam && selected) return <AIExam course={selected} user={user} onPass={handleExamPass} onFail={handleExamFail} onClose={()=>setShowExam(false)}/>;
  if (showTask && selected) return <PracticalTask
    course={selected} user={user}
    onPass={()=>{
      setShowTask(false);
      onGoDetail&&onGoDetail({_type:"certificate",courseTitle:selected?.title,userName:user?.name,certId:null,issuedAt:new Date().toISOString()});
    }}
    onClose={()=>setShowTask(false)}
  />;

  if (watchingModule && selected) {
    const prog = progress[selected.id]||{};
    const isModDone = (prog.completed_modules||[]).includes(watchingModule.position);
    return (
      <div style={{background:"#000",minHeight:"100%",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
          background:"rgba(0,0,0,.95)",borderBottom:"1px solid rgba(255,255,255,.08)",position:"sticky",top:0,zIndex:50}}>
          <button className="tap" onClick={()=>setWatchingModule(null)}
            style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="back" size={17} color="#fff"/>
          </button>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:800,fontSize:12,color:"var(--t3)"}}>{selected.title}</p>
            <p style={{fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{watchingModule.position}. {watchingModule.title}</p>
          </div>
          <span style={{fontSize:11,fontWeight:800,padding:"3px 10px",borderRadius:12,
            background:isModDone?"rgba(22,163,74,.2)":"var(--bg3)",color:isModDone?"var(--green)":"var(--t3)"}}>
            {isModDone?"✓ Done":"In Progress"}
          </span>
        </div>
        <div style={{width:"100%",aspectRatio:"16/9",background:"#000"}}>
          <iframe key={watchingModule.youtube_id}
            src={`https://www.youtube-nocookie.com/embed/${watchingModule.youtube_id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            style={{width:"100%",height:"100%",border:"none"}}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen={true} title={watchingModule.title} referrerPolicy="strict-origin-when-cross-origin"/>
        </div>
        <CourseModulePanel
          mod={watchingModule} course={selected} isModDone={isModDone}
          onMarkDone={()=>{markModuleDone(selected,watchingModule);setWatchingModule(null);}}
          onNext={()=>{const n=(selected.modules||[]).find(m=>m.position===watchingModule.position+1);if(n)setWatchingModule(n);}}
        />
        {!isModDone && <AutoProgressMarker onComplete={()=>markModuleDone(selected,watchingModule)} mod={watchingModule}/>}
      </div>
    );
  }

  if (selected) {
    const prog = progress[selected.id]||{};
    const pct  = prog.percent_complete||0;
    const isDone = prog.is_completed;
    const certId = prog.certificateId;
    return (
      <div style={{background:"var(--bg)",minHeight:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",position:"sticky",top:0,background:"rgba(15,15,15,.97)",zIndex:50,borderBottom:"1px solid var(--line)"}}>
          <button className="tap" onClick={()=>setSelected(null)} style={{width:36,height:36,borderRadius:"50%",background:"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="back" size={17} color="#fff"/></button>
          <p style={{fontWeight:900,fontSize:16,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.title}</p>
          {pct>0&&<span style={{fontSize:11,fontWeight:800,color:"var(--red)"}}>{pct}%</span>}
        </div>
        <div style={{padding:"16px 16px 0"}}>
          <ImgF src={selected.thumbnail} alt={selected.title} style={{width:"100%",aspectRatio:"16/9",marginBottom:14}} radius={10}/>
          <p style={{fontSize:13,fontWeight:600,color:"var(--t2)",lineHeight:1.7,marginBottom:14}}>{selected.description}</p>
          {pct>0&&(<div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--t3)"}}>Progress</span>
              <span style={{fontSize:12,fontWeight:800,color:isDone?"var(--green)":"var(--red)"}}>{pct}%{isDone?" — Complete!":""}</span>
            </div>
            <div style={{height:5,borderRadius:3,background:"var(--bg3)"}}>
              <div style={{height:5,borderRadius:3,width:pct+"%",background:isDone?"var(--green)":"var(--red)",transition:"width .3s"}}/>
            </div>
          </div>)}
          {isDone&&!certId&&<button className="pbtn r tap" style={{width:"100%",justifyContent:"center",padding:"12px 0",marginBottom:12}} onClick={()=>setShowExam(true)}><Icon name="legal" size={14} color="#fff"/>Take Exam to Earn Certificate</button>}
          {isDone&&certId&&<button className="pbtn g tap" style={{width:"100%",justifyContent:"center",padding:"12px 0",marginBottom:12}} onClick={()=>onGoDetail&&onGoDetail({_type:"certificate",courseTitle:selected.title,userName:user?.name,certId,issuedAt:new Date().toISOString()})}><Icon name="legal" size={14} color="#fff"/>View Certificate</button>}
          {isDone&&<div style={{background:"rgba(22,163,74,.08)",border:"1px solid rgba(22,163,74,.2)",borderRadius:10,padding:"10px 14px",marginBottom:14}}><p style={{fontWeight:700,fontSize:13,color:"var(--green)"}}>Course completed!</p></div>}
          <p style={{fontWeight:900,fontSize:15,marginBottom:10}}>Modules ({selected.total_modules})</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {(selected.modules||[]).map(mod=>{
              const done2=(prog.completed_modules||[]).includes(mod.position);
              return (
                <div key={mod.id||mod.position} className="tap"
                  style={{display:"flex",gap:12,alignItems:"center",background:"var(--bg2)",borderRadius:10,
                    padding:"12px 14px",border:`1px solid ${done2?"rgba(22,163,74,.3)":"var(--line)"}`,cursor:"pointer"}}
                  onClick={()=>startModule(mod)}>
                  <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
                    background:done2?"rgba(22,163,74,.15)":"var(--bg3)",
                    border:`2px solid ${done2?"var(--green)":"var(--line)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {done2?<Icon name="check" size={15} color="var(--green)"/>:<span style={{fontWeight:900,fontSize:13,color:"var(--t3)"}}>{mod.position}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:800,fontSize:13,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{mod.title}</p>
                    <p style={{fontSize:11,fontWeight:600,color:"var(--t3)"}}>{mod.duration_min} min</p>
                  </div>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(229,9,20,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Icon name="play" size={11} color="var(--red)"/>
                  </div>
                </div>
              );
            })}
          </div>
          {!user&&<div style={{background:"rgba(229,9,20,.06)",border:"1px solid rgba(229,9,20,.2)",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
            <p style={{fontWeight:800,fontSize:13,marginBottom:6}}>Sign in to track progress</p>
            <button className="pbtn r tap" onClick={onGoProfile}><Icon name="profile" size={13} color="#fff"/>Sign In</button>
          </div>}
        </div>
      </div>
    );
  }

  const filtered = cat==="all" ? courses : courses.filter(c=>c.category===cat);
  return (
    <div style={{background:"var(--bg)",minHeight:"100%",paddingBottom:32}}>
      <div style={{padding:"14px 16px 0"}}>
        <h1 style={{fontWeight:900,fontSize:22,letterSpacing:"-.02em",marginBottom:4}}>Free Courses</h1>
        <p style={{fontSize:13,fontWeight:600,color:"var(--t3)",marginBottom:16,lineHeight:1.6}}>Complete any course · Take AI exam · Earn free certificate</p>
      </div>
      <div style={{padding:"0 0 16px",borderBottom:"1px solid var(--line)",marginBottom:20}}>
        <div className="hrow" style={{gap:8,padding:"4px 16px"}}>
          {CATS.map(c=>(
            <button key={c.key} className={"ctab"+(cat===c.key?" on":"")} onClick={()=>setCat(c.key)}>{c.label}</button>
          ))}
        </div>
      </div>
      {loading?<SkelGrid count={6}/>:(
        <div className="courses-grid">
          {filtered.map(course=>(
            <CourseCard key={course.id} course={course} progress={progress[course.id]} onClick={openCourse}/>
          ))}
        </div>
      )}
    </div>
  );
}
