export const GRADES = [
  '3', '4', '4+', '5', '5+',
  '6A', '6A+', '6B', '6B+',
  '6C', '6C+',
  '7A', '7A+', '7B', '7B+',
  '7C', '7C+',
  '8A',
] as const

export type Grade = typeof GRADES[number]

export const GRADE_COLORS: Record<Grade, { bg: string; text: string; border: string; bar: string }> = {
  '3':   { bg: '#dcfce7', text: '#15803d', border: '#86efac', bar: '#22c55e' },
  '4':   { bg: '#dcfce7', text: '#15803d', border: '#86efac', bar: '#22c55e' },
  '4+':  { bg: '#dcfce7', text: '#15803d', border: '#86efac', bar: '#22c55e' },
  '5':   { bg: '#fef9c3', text: '#a16207', border: '#fde047', bar: '#eab308' },
  '5+':  { bg: '#fef9c3', text: '#a16207', border: '#fde047', bar: '#eab308' },
  '6A':  { bg: '#ffedd5', text: '#c2410c', border: '#fdba74', bar: '#f97316' },
  '6A+': { bg: '#ffedd5', text: '#c2410c', border: '#fdba74', bar: '#f97316' },
  '6B':  { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', bar: '#ef4444' },
  '6B+': { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', bar: '#ef4444' },
  '6C':  { bg: '#ffe4e6', text: '#9f1239', border: '#fda4af', bar: '#e11d48' },
  '6C+': { bg: '#ffe4e6', text: '#9f1239', border: '#fda4af', bar: '#e11d48' },
  '7A':  { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe', bar: '#a855f7' },
  '7A+': { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe', bar: '#a855f7' },
  '7B':  { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', bar: '#8b5cf6' },
  '7B+': { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd', bar: '#8b5cf6' },
  '7C':  { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd', bar: '#3b82f6' },
  '7C+': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd', bar: '#3b82f6' },
  '8A':  { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', bar: '#64748b' },
}

export const GRADE_INDEX: Record<Grade, number> = Object.fromEntries(
  GRADES.map((g, i) => [g, i])
) as Record<Grade, number>
