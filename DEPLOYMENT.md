# FluxStream v5 — Production Deployment Guide
# =============================================
# Built by EMEMZYVISUALS · github.com/Ememzyvisuals/FluxStream

## ═══════════════════════════════════════
## ARCHITECTURE OVERVIEW
## ═══════════════════════════════════════
#
#  FluxStream = Next.js 15.1.9 (Vercel) + Supabase (DB) + 5 external APIs
#
#  VERCEL (main app):
#    - All UI pages (Home, Search, Courses, Shorts, Library, Profile)
#    - 14 serverless API routes
#    - No server config needed — push to GitHub, deploy
#
#  SUPABASE (database):
#    - User accounts + auth
#    - Course progress tracking
#    - Certificates with verification codes
#    - Watchlist + watch history
#
#  EXTERNAL APIS (all free):
#    - TMDB        → movie/TV metadata, posters, trailers
#    - Groq        → AI recommendations, synopsis, trivia
#    - YouTube     → courses, Yoruba films, Christian movies, Shorts
#    - Resend      → welcome, progress, and certificate emails
#    - Archive.org → public domain film streaming (no key needed)

## ═══════════════════════════════════════
## ENVIRONMENT VARIABLES — COMPLETE LIST
## ═══════════════════════════════════════
#
# Add ALL of these in Vercel → Settings → Environment Variables
# (Set each to "All Environments")
#
# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ KEY                          │ REQUIRED │ WHERE TO GET IT                   │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ NEXT_PUBLIC_TMDB_API_KEY     │ YES      │ themoviedb.org → Settings → API   │
# │                              │          │ → "API Key (v3 auth)"             │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ GROQ_API_KEY                 │ YES      │ console.groq.com → API Keys       │
# │                              │          │ → Create API Key                  │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ NEXT_PUBLIC_SUPABASE_URL     │ YES*     │ Supabase → Settings → API         │
# │                              │          │ → Project URL                     │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ NEXT_PUBLIC_SUPABASE_ANON_KEY│ YES*     │ Supabase → Settings → API         │
# │                              │          │ → anon / public key               │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ SUPABASE_SERVICE_ROLE_KEY    │ YES*     │ Supabase → Settings → API         │
# │                              │          │ → service_role / secret key       │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ YOUTUBE_API_KEY              │ OPTIONAL │ console.cloud.google.com          │
# │                              │          │ → Enable YouTube Data API v3      │
# │                              │          │ → Credentials → API Key           │
# │                              │          │ Free: 10,000 units/day            │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ RESEND_API_KEY               │ OPTIONAL │ resend.com → Sign up free         │
# │                              │          │ → API Keys → Create               │
# │                              │          │ Free: 3,000 emails/month          │
# ├──────────────────────────────┼──────────┼───────────────────────────────────┤
# │ EMAIL_FROM                   │ OPTIONAL │ Set after domain verification     │
# │                              │          │ e.g: FluxStream <you@domain.com>  │
# │                              │          │ Default: uses resend.dev domain   │
# └──────────────────────────────┴──────────┴───────────────────────────────────┘
#
# * Supabase: works without it (courses still work in static mode)
#   With Supabase: user auth + progress sync + certificates stored in DB
#   Without Supabase: progress saved to localStorage only

## ═══════════════════════════════════════
## STEP 1 — GET ALL API KEYS (30 minutes)
## ═══════════════════════════════════════

### TMDB (movie metadata)
# 1. Go to: themoviedb.org/signup → create free account
# 2. Login → avatar (top right) → Settings → API (left sidebar)
# 3. Request API access → Developer → fill form
# 4. Copy: "API Key (v3 auth)"
# Looks like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

### GROQ (AI features)
# 1. Go to: console.groq.com → Sign up
# 2. Left sidebar → API Keys → Create API Key
# 3. Copy immediately (shown once!)
# Looks like: gsk_abcdefghijklmnopqrstuvwxyz123456789

### SUPABASE (database + auth)
# 1. Go to: supabase.com → Sign up with GitHub
# 2. New Project → fill details → Create
# 3. Wait ~2 min for setup
# 4. Settings (gear icon) → API:
#    - Project URL: https://xxxxx.supabase.co
#    - anon/public key: eyJhbGc...
#    - service_role key: eyJhbGc... (KEEP SECRET)

### YOUTUBE (Yoruba/Christian/Shorts sections)
# 1. Go to: console.cloud.google.com
# 2. Create project → Enable APIs → YouTube Data API v3
# 3. Credentials → Create Credentials → API Key
# 4. (Optional) Restrict key to YouTube Data API v3
# Free: 10,000 units/day (each search = 100 units = ~100 searches/day)

### RESEND (emails)
# 1. Go to: resend.com → Sign up
# 2. Dashboard → API Keys → Create API Key
# 3. For production: Domains → Add Domain → follow DNS setup
# Free: 3,000 emails/month, 100/day

## ═══════════════════════════════════════
## STEP 2 — SUPABASE SETUP
## ═══════════════════════════════════════

# 1. In Supabase dashboard → SQL Editor → New query
# 2. Paste ENTIRE contents of db/schema.sql
# 3. Click Run → should see "Success" messages
#
# This creates:
#   watchlist, watch_history, courses, course_modules,
#   course_progress, certificates
#   + Row Level Security policies
#   + Sample courses pre-loaded

## ═══════════════════════════════════════
## STEP 3 — DEPLOY TO VERCEL
## ═══════════════════════════════════════

# Push to GitHub:
git init
git add .
git commit -m "FluxStream v5 — production"
git remote add origin https://github.com/Ememzyvisuals/FluxStream.git
git push -u origin main

# On Vercel (vercel.com):
# 1. New Project → Import "FluxStream" from GitHub
# 2. Framework: Next.js (auto-detected)
# 3. Environment Variables → Add ALL keys from the table above
# 4. Click Deploy → ~60 seconds → live!

## ═══════════════════════════════════════
## VERCEL ENV VARS — COPY-PASTE REFERENCE
## ═══════════════════════════════════════
#
# NAME                           VALUE
# ─────────────────────────────────────────────────────────────
# NEXT_PUBLIC_TMDB_API_KEY       [your tmdb key]
# GROQ_API_KEY                   [your groq key]
# NEXT_PUBLIC_SUPABASE_URL       https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY  [your anon key]
# SUPABASE_SERVICE_ROLE_KEY      [your service role key - SECRET]
# YOUTUBE_API_KEY                [your youtube key]
# RESEND_API_KEY                 [your resend key]
# EMAIL_FROM                     FluxStream <noreply@yourdomain.com>
# ─────────────────────────────────────────────────────────────
# TOTAL: 8 environment variables (5 required, 3 optional)

## ═══════════════════════════════════════
## RENDER — NOT NEEDED
## ═══════════════════════════════════════
# FluxStream v5 has NO Render dependency.
# All video encoding was removed.
# Streams come from: Archive.org + YouTube (legal, free, zero infra)

## ═══════════════════════════════════════
## FEATURE VERIFICATION CHECKLIST
## ═══════════════════════════════════════
# After deploy, verify:
# [ ] Home page loads with trending movies (requires TMDB key)
# [ ] Search works and finds movies
# [ ] Archive.org films play (try: search "Nosferatu" or "Metropolis")
# [ ] AI recommendations work (requires GROQ key)
# [ ] YouTube sections show on home (requires YOUTUBE key)
# [ ] Shorts page loads with comedy/Yoruba content
# [ ] Courses page shows 6 free courses
# [ ] Sign up creates account + welcome email received
# [ ] Course module plays YouTube video
# [ ] Marking module complete updates progress bar
# [ ] Completing all modules shows certificate
# [ ] Certificate PDF print/share works
# [ ] Language switcher changes UI labels
# [ ] Mobile layout: 5-tab bottom nav (Home/Search/Courses/Shorts/Library/Profile)
# [ ] Desktop: sidebar with all nav items

## ═══════════════════════════════════════
## TROUBLESHOOTING
## ═══════════════════════════════════════

# Movies not loading
# → Check NEXT_PUBLIC_TMDB_API_KEY in Vercel env vars

# AI not responding
# → Check GROQ_API_KEY — get fresh one at console.groq.com

# YouTube sections empty
# → YOUTUBE_API_KEY not set OR quota exceeded (10,000 units/day free)
# → Check: your-app.vercel.app/api/youtube?q=test

# Emails not sending
# → Check RESEND_API_KEY
# → Use resend.dev test domain until you verify your own domain
# → Check Resend dashboard for delivery logs

# Courses not saving progress
# → Supabase not configured → progress saves to localStorage only
# → This is fine! Progress is still tracked per device

# Certificate not generating
# → User must be signed in to generate persistent certificates
# → Without Supabase, cert is shown but not stored in DB

## ═══════════════════════════════════════
## LINKS
## ═══════════════════════════════════════
# GitHub:   github.com/Ememzyvisuals/FluxStream
# X:        x.com/Ememzyvisuals
# TikTok:   tiktok.com/@Ememzyvisuals
# TMDB:     themoviedb.org
# Supabase: supabase.com
# Groq:     console.groq.com
# YouTube:  console.cloud.google.com
# Resend:   resend.com

# FluxStream v5 · Built by Emmanuel Ariyo (EMEMZYVISUALS)
# "Entertainment & Education, Free for Everyone."
