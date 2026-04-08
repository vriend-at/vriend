import { createClient } from './supabase'
import type { Session, Route } from './mock-data'

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
