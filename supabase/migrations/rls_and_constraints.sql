-- ─── Row Level Security: sessions ───────────────────────────────────────────

alter table sessions enable row level security;

create policy "Users can select own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on sessions for update
  using (auth.uid() = user_id);

-- ─── Row Level Security: session_routes ─────────────────────────────────────

alter table session_routes enable row level security;

create policy "Users can select own session_routes"
  on session_routes for select
  using (
    exists (
      select 1 from sessions
      where sessions.id = session_routes.session_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own session_routes"
  on session_routes for insert
  with check (
    exists (
      select 1 from sessions
      where sessions.id = session_routes.session_id
        and sessions.user_id = auth.uid()
    )
  );

create policy "Users can update own session_routes"
  on session_routes for update
  using (
    exists (
      select 1 from sessions
      where sessions.id = session_routes.session_id
        and sessions.user_id = auth.uid()
    )
  );

-- ─── Unique constraint required for upsert onConflict ───────────────────────

alter table session_routes
  add constraint session_routes_session_id_route_id_key
  unique (session_id, route_id);
