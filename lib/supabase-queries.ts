import { createClient } from './supabase'
import type { Session, Route, Team, TeamMember } from './mock-data'
import type { Grade } from './constants'

export async function getOrCreateTodaySession(userId: string, gymId: string): Promise<string | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('gym_id', gymId)
    .eq('date', today)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('sessions')
    .insert({ user_id: userId, gym_id: gymId, date: today })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function fetchCompletedRouteIds(userId: string, gymId: string | null): Promise<Set<string>> {
  const supabase = createClient()

  let q = supabase.from('sessions').select('id').eq('user_id', userId)
  if (gymId) q = q.eq('gym_id', gymId)

  const { data: sessions } = await q
  if (!sessions?.length) return new Set()

  const { data: srs } = await supabase
    .from('session_routes')
    .select('route_id')
    .in('session_id', sessions.map((s: { id: string }) => s.id))
    .eq('completed', true)

  return new Set(srs?.map((r: { route_id: string }) => r.route_id) ?? [])
}

export async function fetchRoutes(gymId: string | null): Promise<Route[]> {
  const supabase = createClient()

  let q = supabase
    .from('routes')
    .select('id, gym_id, name, grade, color, zone, setter_name, set_date, remove_date, splat_url')

  if (gymId) q = q.eq('gym_id', gymId)

  const { data } = await q
  return (data as Route[]) ?? []
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function ensureProfile(userId: string, email: string): Promise<void> {
  const supabase = createClient()
  const rawName = email.split('@')[0].replace(/[._-]/g, ' ')
  const displayName = rawName.replace(/\b\w/g, (l: string) => l.toUpperCase())
  await supabase.from('profiles').upsert(
    { id: userId, display_name: displayName },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

function initialsFromName(name: string | null, email?: string | null): string {
  if (!name && !email) return '?'
  const str = name || email || '?'
  return str.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export async function fetchMyTeams(userId: string): Promise<Team[]> {
  const supabase = createClient()

  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, teams(id, name, created_by, created_at)')
    .eq('user_id', userId)

  if (!memberships?.length) return []

  const teams: Team[] = []

  for (const m of memberships) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const team = m.teams as any
    if (!team) continue

    const [profilesResult, completionsResult] = await Promise.all([
      supabase.rpc('get_team_member_profiles', { p_team_id: team.id }),
      supabase.rpc('get_team_grade_completions', { p_team_id: team.id }),
    ])

    const profiles: Array<{ user_id: string; display_name: string }> =
      profilesResult.data ?? []
    const completions: Array<{ user_id: string; grade: string; cnt: number }> =
      completionsResult.data ?? []

    // Build per-member grade_completions map
    const gradeMap = new Map<string, Map<string, number>>()
    for (const c of completions) {
      if (!gradeMap.has(c.user_id)) gradeMap.set(c.user_id, new Map())
      gradeMap.get(c.user_id)!.set(c.grade, Number(c.cnt))
    }

    const members: TeamMember[] = profiles.map(p => ({
      id: p.user_id,
      display_name: p.display_name,
      avatar_initials: initialsFromName(p.display_name),
      grade_completions: Array.from(gradeMap.get(p.user_id)?.entries() ?? []).map(
        ([grade, count]) => ({ grade: grade as Grade, count })
      ),
    }))

    teams.push({
      id: team.id,
      name: team.name,
      created_by: team.created_by,
      created_at: team.created_at,
      members,
    })
  }

  return teams
}

export async function createTeam(name: string, userId: string): Promise<string> {
  const supabase = createClient()

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, created_by: userId })
    .select('id')
    .single()
  console.log('[createTeam] team insert:', { data: team, error: teamError })
  if (teamError || !team) throw new Error(teamError?.message ?? 'Team konnte nicht erstellt werden')

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId })
  console.log('[createTeam] team_members insert:', { error: memberError })
  if (memberError) throw new Error(memberError.message)

  return team.id
}

export async function joinTeam(teamId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('team_members')
    .upsert({ team_id: teamId, user_id: userId }, { onConflict: 'team_id,user_id', ignoreDuplicates: true })
  return !error
}

export async function leaveTeam(teamId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('leave_team', { p_team_id: teamId })
  if (error) throw new Error(error.message)
}

export async function deleteTeam(teamId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw new Error(error.message)
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function fetchSessions(userId: string, gymId: string | null, limit = 10): Promise<Session[]> {
  const supabase = createClient()

  let q = supabase
    .from('sessions')
    .select('id, user_id, gym_id, date, notes, session_routes(route_id, completed, attempts)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (gymId) q = q.eq('gym_id', gymId)

  const { data } = await q

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    gym_id: s.gym_id,
    date: s.date,
    notes: s.notes ?? undefined,
    routes: (s.session_routes ?? []).map((sr: { route_id: string; completed: boolean; attempts: number }) => ({
      route_id: sr.route_id,
      completed: sr.completed,
      attempts: sr.attempts,
    })),
  }))
}
