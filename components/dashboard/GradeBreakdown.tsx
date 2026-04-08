'use client'

import { Grade, GRADE_COLORS } from '@/lib/constants'

interface GradeEntry {
  grade: Grade
  total: number
  completed: number
}

interface Props {
  breakdown: GradeEntry[]
}

export default function GradeBreakdown({ breakdown }: Props) {
  if (breakdown.length === 0) {
    return <p className="text-sm text-[#78716c] text-center py-4">Keine Routen vorhanden</p>
  }

  return (
    <div className="space-y-3">
      {breakdown.map(({ grade, total, completed }) => {
        const pct = total > 0 ? (completed / total) * 100 : 0
        const colors = GRADE_COLORS[grade]
        return (
          <div key={grade} className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center font-bold rounded-lg text-xs px-2 py-0.5 w-10 shrink-0"
              style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              {grade}
            </span>
            <div className="flex-1 bg-[#f5f0eb] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: colors.bar }}
              />
            </div>
            <span className="text-xs text-[#78716c] w-12 text-right shrink-0">
              {completed}/{total}
            </span>
          </div>
        )
      })}
    </div>
  )
}
