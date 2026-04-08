'use client'

import { Box, MapPin, Palette, Calendar } from 'lucide-react'
import { Route } from '@/lib/mock-data'
import { formatDate, isExpiringSoon } from '@/lib/utils'
import GradeBadge from '@/components/ui/GradeBadge'

interface Props {
  route: Route
  completed: boolean
  onMarkComplete: (id: string) => void
}

export default function RouteCard({ route, completed, onMarkComplete }: Props) {
  const expiring = !completed && isExpiringSoon(route.remove_date)
  const hasSplat = !!route.splat_url

  let borderClass = 'border-[#e7e0d8]'
  if (completed) borderClass = 'border-green-400'
  else if (expiring) borderClass = 'border-yellow-400'

  return (
    <div
      className={`bg-white rounded-2xl border-2 ${borderClass} shadow-sm flex flex-col overflow-hidden transition-all duration-200`}
    >
      {/* Top bar: grade + badges */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <GradeBadge grade={route.grade} size="md" />

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {expiring && (
            <span className="inline-flex items-center text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg px-2 py-0.5">
              ⏳
            </span>
          )}
          {hasSplat && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b45309] bg-[#fef3c7] border border-amber-300 rounded-lg px-2 py-0.5">
              <Box size={11} />
              3D
            </span>
          )}
        </div>
      </div>

      {/* Route name */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-[#1c1917] text-base leading-tight">{route.name}</h3>
      </div>

      {/* Meta info */}
      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#78716c]">
          <MapPin size={12} className="shrink-0 text-[#b45309]" />
          <span>{route.zone}</span>
          <span className="text-[#e7e0d8]">·</span>
          <Palette size={12} className="shrink-0 text-[#b45309]" />
          <span>{route.color}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#78716c]">
          <Calendar size={12} className="shrink-0 text-[#b45309]" />
          <span>
            {formatDate(route.set_date)}
            <span className="mx-1 text-[#e7e0d8]">→</span>
            <span className={expiring && !completed ? 'text-yellow-600 font-semibold' : ''}>
              {formatDate(route.remove_date)}
            </span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#f0ebe4]" />

      {/* Action button */}
      <div className="px-4 py-3">
        {!completed ? (
          <button
            onClick={() => onMarkComplete(route.id)}
            className="w-full flex items-center justify-center bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
          >
            Als geschafft markieren
          </button>
        ) : (
          <button
            onClick={() => onMarkComplete(route.id)}
            className="w-full flex items-center justify-center bg-green-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-green-700 border border-green-200 text-xs font-semibold rounded-xl py-2.5 transition-colors"
          >
            Geschafft
          </button>
        )}
      </div>
    </div>
  )
}
