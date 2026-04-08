'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Session, Route, Gym } from '@/lib/mock-data'
import SessionBottomSheet from './SessionBottomSheet'

interface Props {
  sessions: Session[]
  routes: Route[]
  gyms: Gym[]
}

export default function RecentSessions({ sessions, routes, gyms }: Props) {
  const [selected, setSelected] = useState<Session | null>(null)

  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  function gymName(gymId: string) {
    return gyms.find(g => g.id === gymId)?.name ?? gymId
  }

  return (
    <>
      <div className="space-y-2">
        {sorted.length === 0 && (
          <p className="text-sm text-[#78716c] text-center py-4">Noch keine Sessions</p>
        )}
        {sorted.map(session => (
          <button
            key={session.id}
            onClick={() => setSelected(session)}
            className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#e7e0d8] hover:border-[#b45309] hover:shadow-sm transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#fef3c7] flex flex-col items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#b45309] leading-none">
                {new Date(session.date).getDate()}
              </span>
              <span className="text-[10px] text-[#b45309] uppercase">
                {new Date(session.date).toLocaleDateString('de-DE', { month: 'short' })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#1c1917] truncate">{gymName(session.gym_id)}</p>
            </div>
            <ChevronRight size={16} className="text-[#78716c] shrink-0" />
          </button>
        ))}
      </div>

      {selected && (
        <SessionBottomSheet
          session={selected}
          routes={routes}
          gymName={gymName(selected.gym_id)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
