import { Grade, GRADES, GRADE_INDEX } from './constants'
import { Route, Session } from './mock-data'

export function isExpiringSoon(removeDate: string): boolean {
  const remove = new Date(removeDate)
  const now = new Date()
  const diff = (remove.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

export function isExpired(removeDate: string): boolean {
  return new Date(removeDate) < new Date()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  })
}

export function getCompletedRouteIds(sessions: Session[], gymId?: string): Set<string> {
  const ids = new Set<string>()
  for (const session of sessions) {
    if (gymId && session.gym_id !== gymId) continue
    for (const sr of session.routes) {
      if (sr.completed) ids.add(sr.route_id)
    }
  }
  return ids
}

export function gradeGte(grade: Grade, min: Grade): boolean {
  return GRADE_INDEX[grade] >= GRADE_INDEX[min]
}

export function gradeLte(grade: Grade, max: Grade): boolean {
  return GRADE_INDEX[grade] <= GRADE_INDEX[max]
}

export function getSessionsThisMonth(sessions: Session[]): Session[] {
  const now = new Date()
  return sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
}

export function getGradeBreakdown(
  routes: Route[],
  completedIds: Set<string>
): { grade: Grade; total: number; completed: number }[] {
  const map = new Map<Grade, { total: number; completed: number }>()
  for (const grade of GRADES) {
    map.set(grade, { total: 0, completed: 0 })
  }
  for (const route of routes) {
    const entry = map.get(route.grade)!
    entry.total++
    if (completedIds.has(route.id)) entry.completed++
  }
  return GRADES.map(grade => ({ grade, ...map.get(grade)! })).filter(e => e.total > 0)
}

export function getRouteById(routes: Route[], id: string): Route | undefined {
  return routes.find(r => r.id === id)
}

export function daysUntilRemoval(removeDate: string): number {
  const diff = new Date(removeDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
