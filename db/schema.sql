-- FluxStream v5 — Full Supabase Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run

create extension if not exists "uuid-ossp";

-- WATCHLIST
create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer, archive_id text, yt_id text,
  title text, poster text, type text default 'movie',
  added_at timestamptz not null default now()
);
create index if not exists watchlist_user on public.watchlist(user_id);
alter table public.watchlist enable row level security;
create policy "users_own_watchlist" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WATCH HISTORY
create table if not exists public.watch_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer, archive_id text, yt_id text,
  title text, poster text, backdrop text, type text default 'movie',
  progress_sec integer default 0, duration_sec integer,
  season integer, episode integer, watched_at timestamptz not null default now()
);
create index if not exists history_user on public.watch_history(user_id);
alter table public.watch_history enable row level security;
create policy "users_own_history" on public.watch_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COURSES
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null, description text, thumbnail text,
  category text, level text default 'beginner',
  language text default 'en', duration_min integer default 0,
  is_free boolean not null default true,
  is_published boolean not null default true,
  total_modules integer default 0,
  created_at timestamptz not null default now()
);
create index if not exists courses_slug on public.courses(slug);
create index if not exists courses_cat  on public.courses(category);
alter table public.courses enable row level security;
create policy "courses_public_read" on public.courses for select using (is_published = true);

-- COURSE MODULES
create table if not exists public.course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position integer not null default 1,
  title text not null, description text,
  youtube_id text not null, duration_min integer default 0,
  created_at timestamptz not null default now(),
  unique(course_id, position)
);
create index if not exists modules_course on public.course_modules(course_id);
alter table public.course_modules enable row level security;
create policy "modules_public_read" on public.course_modules for select using (true);

-- COURSE PROGRESS
create table if not exists public.course_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completed_modules integer[] default '{}',
  percent_complete integer not null default 0,
  is_completed boolean not null default false,
  last_watched_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);
create index if not exists progress_user   on public.course_progress(user_id);
create index if not exists progress_course on public.course_progress(course_id);
alter table public.course_progress enable row level security;
create policy "users_own_progress" on public.course_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CERTIFICATES
create table if not exists public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  user_name text not null, course_title text not null,
  issued_at timestamptz not null default now(),
  verification_code text unique not null default upper(left(md5(random()::text), 12)),
  unique(user_id, course_id)
);
create index if not exists cert_user  on public.certificates(user_id);
create index if not exists cert_code  on public.certificates(verification_code);
alter table public.certificates enable row level security;
create policy "users_own_certs"   on public.certificates for select using (auth.uid() = user_id);
create policy "public_verify_cert" on public.certificates for select using (true);
