import { GRADES, Grade } from './constants'
import { TeamMember } from './mock-data'

export function totalRoutes(member: TeamMember): number {
  return member.grade_completions.reduce((sum, g) => sum + g.count, 0)
}

export function topGrade(member: TeamMember): Grade | null {
  for (let i = GRADES.length - 1; i >= 0; i--) {
    const g = GRADES[i]
    const entry = member.grade_completions.find(c => c.grade === g)
    if (entry && entry.count > 0) return g
  }
  return null
}

export function rankMembers(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    // Primary: highest grade achieved (hardest first)
    const topA = topGrade(a)
    const topB = topGrade(b)
    if (topA !== topB) {
      if (topA === null) return 1
      if (topB === null) return -1
      return GRADES.indexOf(topB) - GRADES.indexOf(topA)
    }
    // Tiebreaker: descending through all grades, more routes wins
    for (let i = GRADES.length - 1; i >= 0; i--) {
      const grade = GRADES[i]
      const countA = a.grade_completions.find(g => g.grade === grade)?.count ?? 0
      const countB = b.grade_completions.find(g => g.grade === grade)?.count ?? 0
      if (countA !== countB) return countB - countA
    }
    return 0
  })
}

export function formatTeamDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
