-- ─────────────────────────────────────────────────────────────────────────────
-- Dayton Relo — Community Board Schema  (safe to re-run)
-- Run this in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add display_name column to profiles (safe — does nothing if already exists)
alter table profiles
  add column if not exists community_display_name text;

-- 2. Community posts table
create table if not exists community_posts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade not null,
  display_name   text not null,
  category       text not null check (category in ('general','pcs','neighborhoods','schools','events','restaurants','feedback')),
  title          text not null,
  body           text not null,
  is_pinned      boolean default false,
  upvote_count   integer default 0,
  reply_count    integer default 0,
  created_at     timestamptz default now()
);

-- 3. Community replies table
create table if not exists community_replies (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid references community_posts(id) on delete cascade not null,
  user_id        uuid references profiles(id) on delete cascade not null,
  display_name   text not null,
  body           text not null,
  created_at     timestamptz default now()
);

-- 4. Upvotes table (unique constraint enforces one vote per user per post)
create table if not exists post_upvotes (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid references community_posts(id) on delete cascade not null,
  user_id        uuid references profiles(id) on delete cascade not null,
  created_at     timestamptz default now(),
  unique(post_id, user_id)
);

-- 5. Indexes
create index if not exists idx_posts_category    on community_posts(category);
create index if not exists idx_posts_created_at  on community_posts(created_at desc);
create index if not exists idx_replies_post_id   on community_replies(post_id);
create index if not exists idx_upvotes_post_id   on post_upvotes(post_id);
create index if not exists idx_upvotes_user_id   on post_upvotes(user_id);

-- 6. Enable row-level security on the NEW tables only (not profiles)
alter table community_posts   enable row level security;
alter table community_replies enable row level security;
alter table post_upvotes      enable row level security;

-- 7. Policies for community_posts
--    (drop first so this is safe to re-run)
drop policy if exists "Anyone can read posts"              on community_posts;
drop policy if exists "Authenticated users can insert posts" on community_posts;
drop policy if exists "Owner can delete own post"          on community_posts;

create policy "Anyone can read posts"
  on community_posts for select using (true);

create policy "Authenticated users can insert posts"
  on community_posts for insert
  with check (auth.uid() = user_id);

create policy "Owner can delete own post"
  on community_posts for delete
  using (auth.uid() = user_id);

-- 8. Policies for community_replies
drop policy if exists "Anyone can read replies"              on community_replies;
drop policy if exists "Authenticated users can insert replies" on community_replies;
drop policy if exists "Owner can delete own reply"           on community_replies;

create policy "Anyone can read replies"
  on community_replies for select using (true);

create policy "Authenticated users can insert replies"
  on community_replies for insert
  with check (auth.uid() = user_id);

create policy "Owner can delete own reply"
  on community_replies for delete
  using (auth.uid() = user_id);

-- 9. Policies for post_upvotes
drop policy if exists "Anyone can read upvotes"          on post_upvotes;
drop policy if exists "Authenticated users can upvote"   on post_upvotes;
drop policy if exists "User can remove own upvote"       on post_upvotes;

create policy "Anyone can read upvotes"
  on post_upvotes for select using (true);

create policy "Authenticated users can upvote"
  on post_upvotes for insert
  with check (auth.uid() = user_id);

create policy "User can remove own upvote"
  on post_upvotes for delete
  using (auth.uid() = user_id);

-- 10. Function + trigger: auto-update reply_count
create or replace function update_reply_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set reply_count = reply_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts set reply_count = greatest(reply_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_reply_count on community_replies;
create trigger trg_reply_count
  after insert or delete on community_replies
  for each row execute function update_reply_count();

-- 11. Function + trigger: auto-update upvote_count
create or replace function update_upvote_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts set upvote_count = upvote_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts set upvote_count = greatest(upvote_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_upvote_count on post_upvotes;
create trigger trg_upvote_count
  after insert or delete on post_upvotes
  for each row execute function update_upvote_count();

-- 12. Enable realtime on the new tables
alter publication supabase_realtime add table community_posts;
alter publication supabase_realtime add table community_replies;
