-- ─────────────────────────────────────────────────────────────────────────────
--  Dayton Relo App — Supabase Database Setup
--  Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. PROFILES TABLE ────────────────────────────────────────────────────────
--  Stores the extra lead capture fields collected at signup.
--  The `id` is linked directly to Supabase Auth (auth.users).

create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text not null,
  email         text not null,
  phone         text default '',
  move_timeline text not null default '3-6 months',
  persona       text not null default 'general',
  created_at    timestamptz default timezone('utc', now())
);

-- Enable Row Level Security (users can only see/edit their own row)
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);


-- ── 2. SAVED ITEMS TABLE ─────────────────────────────────────────────────────
--  Stores bookmarked pages, tools, and listings per user.

create table if not exists saved_items (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  item_type  text not null,         -- 'listing' | 'page' | 'tool'
  item_id    text not null,         -- unique id within that type
  title      text not null,
  subtitle   text,
  route      text,                  -- expo-router route to navigate to
  metadata   jsonb,                 -- extra data (e.g. listing price/address)
  created_at timestamptz default timezone('utc', now()),
  unique(user_id, item_type, item_id)
);

alter table saved_items enable row level security;

create policy "Users can manage own saved items"
  on saved_items for all
  using (auth.uid() = user_id);


-- ── 3. ADMIN VIEW (for you to see all leads) ─────────────────────────────────
--  Go to Supabase → Table Editor → profiles to see every signup.
--  Or run this query any time to get a lead report:

-- select
--   p.full_name,
--   p.email,
--   p.phone,
--   p.move_timeline,
--   p.persona,
--   p.created_at,
--   count(s.id) as saved_items
-- from profiles p
-- left join saved_items s on s.user_id = p.id
-- group by p.id
-- order by p.created_at desc;
