-- ============================================================
-- Teams & Profiles Migration — run in Supabase SQL editor
-- Safe to re-run (uses IF NOT EXISTS + DROP IF EXISTS)
-- ============================================================

-- 1. Profiles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  max_grade text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;

create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);


-- 2. Teams
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table teams enable row level security;

drop policy if exists "teams_select"         on teams;
drop policy if exists "teams_insert"         on teams;
drop policy if exists "teams_delete"         on teams;
drop policy if exists "teams_invite_lookup"  on teams;

-- Any authenticated user can read teams (needed for join-by-ID invite links)
create policy "teams_select" on teams
  for select using (auth.uid() is not null);

-- Authenticated users can create teams they own
create policy "teams_insert" on teams
  for insert with check (auth.uid() = created_by);

-- Only the creator can delete a team
create policy "teams_delete" on teams
  for delete using (auth.uid() = created_by);


-- 3. Team members
create table if not exists team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

alter table team_members enable row level security;

drop policy if exists "team_members_own_select" on team_members;
drop policy if exists "team_members_select"     on team_members;
drop policy if exists "team_members_insert"     on team_members;
drop policy if exists "team_members_delete"     on team_members;

-- Users can read their own memberships (so they know which teams they're in)
create policy "team_members_own_select" on team_members
  for select using (auth.uid() = user_id);

-- Any authenticated user can join a team (insert their own row)
create policy "team_members_insert" on team_members
  for insert with check (auth.uid() = user_id);

-- Users can delete their own membership (leave team)
create policy "team_members_delete" on team_members
  for delete using (auth.uid() = user_id);


-- 4. RPC: member profiles for a team (security definer reads across RLS)
create or replace function get_team_member_profiles(p_team_id uuid)
returns table(user_id uuid, display_name text)
language sql
security definer
stable
set search_path = public
as $$
  select tm.user_id, p.display_name
  from team_members tm
  join profiles p on p.id = tm.user_id
  where tm.team_id = p_team_id
    and exists (
      select 1 from team_members
      where team_id = p_team_id and user_id = auth.uid()
    )
$$;


-- 5. RPC: completed route grade counts per member (security definer bypasses sessions RLS)
create or replace function get_team_grade_completions(p_team_id uuid)
returns table(user_id uuid, grade text, cnt bigint)
language sql
security definer
stable
set search_path = public
as $$
  select s.user_id, r.grade, count(*) as cnt
  from team_members tm
  join sessions s on s.user_id = tm.user_id
  join session_routes sr on sr.session_id = s.id
  join routes r on r.id = sr.route_id
  where tm.team_id = p_team_id
    and sr.completed = true
    and exists (
      select 1 from team_members
      where team_id = p_team_id and user_id = auth.uid()
    )
  group by s.user_id, r.grade
$$;


-- 6. RPC: leave a team (removes membership; deletes team if last member)
create or replace function leave_team(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining int;
begin
  if not exists (
    select 1 from team_members where team_id = p_team_id and user_id = auth.uid()
  ) then
    raise exception 'Not a member of this team';
  end if;

  delete from team_members where team_id = p_team_id and user_id = auth.uid();

  select count(*) into v_remaining from team_members where team_id = p_team_id;

  if v_remaining = 0 then
    delete from teams where id = p_team_id;
  end if;
end;
$$;
