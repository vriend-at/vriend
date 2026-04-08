import { Grade, GRADE_COLORS } from '@/lib/constants'

interface Props {
  grade: Grade
  size?: 'sm' | 'md' | 'lg'
}

export default function GradeBadge({ grade, size = 'md' }: Props) {
  const colors = GRADE_COLORS[grade]
  const sizeClass = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : size === 'lg'
    ? 'text-base px-3 py-1'
    : 'text-sm px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg ${sizeClass}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {grade}
    </span>
  )
}
