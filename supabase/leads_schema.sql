-- ─────────────────────────────────────────────────────────────────────────────
--  Leads table — captures every contact form submission from the app
--  Run this once in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  phone          text,
  move_timeline  text,
  employer       text,
  message        text,
  source         text default 'Dayton Relo App',
  submitted_at   timestamptz default now(),
  created_at     timestamptz default now()
);

-- Index for quick lookup by email or date
create index if not exists leads_email_idx on leads (email);
create index if not exists leads_submitted_idx on leads (submitted_at desc);

-- RLS: only the service role (server) can read/write leads
alter table leads enable row level security;

drop policy if exists "Service role full access" on leads;
create policy "Service role full access"
  on leads for all
  using (true)
  with check (true);

-- Allow anonymous inserts (the app submits without auth)
drop policy if exists "Anyone can insert a lead" on leads;
create policy "Anyone can insert a lead"
  on leads for insert
  to anon
  with check (true);
