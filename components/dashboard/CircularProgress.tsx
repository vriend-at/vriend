'use client'

interface Props {
  percentage: number
  completed: number
  total: number
  size?: number
}

export default function CircularProgress({ percentage, completed, total, size = 180 }: Props) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e7e0d8"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#b45309"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#1c1917]">{Math.round(percentage)}%</span>
          <span className="text-xs text-[#78716c] mt-0.5">abgeschlossen</span>
        </div>
      </div>
      <div className="text-sm text-[#78716c] mt-2">
        <span className="font-semibold text-[#1c1917]">{completed}</span> von{' '}
        <span className="font-semibold text-[#1c1917]">{total}</span> Routen
      </div>
    </div>
  )
}
