'use client'

import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { type Session, type Route, type Gym } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import SessionBottomSheet from './SessionBottomSheet'

interface Props {
  sessions: Session[]
  routes: Route[]
  gyms: Gym[]
  onClose: () => void
}

export default function AllSessionsSheet({ sessions, routes, gyms, onClose }: Props) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const getGymName = (gymId: string) => gyms.find(g => g.id === gymId)?.name ?? '–'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 overlay-enter" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter">
        <div className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl mx-auto max-w-lg">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#e7e0d8]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e7e0d8]">
            <div>
              <h2 className="text-lg font-bold text-[#1c1917]">Sessions</h2>
              <p className="text-sm text-[#78716c]">{sessions.length} Session{sessions.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f5f0eb] text-[#78716c] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Session list */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-[#78716c] text-center py-8">Noch keine Sessions aufgezeichnet.</p>
            ) : (
              sessions.map(session => {
                const completedCount = session.routes.filter(r => r.completed).length
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f5f0eb] hover:bg-[#ede8e1] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1c1917]">{formatDate(session.date)}</p>
                      <p className="text-xs text-[#78716c] truncate">{getGymName(session.gym_id)}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#1c1917] shrink-0">
                      {completedCount} Route{completedCount !== 1 ? 'n' : ''}
                    </p>
                    <ChevronRight size={16} className="text-[#78716c] shrink-0" />
                  </button>
                )
              })
            )}
          </div>

          <div className="h-6" />
        </div>
      </div>

      {/* Sub-sheet: session detail */}
      {selectedSession && (
        <SessionBottomSheet
          session={selectedSession}
          routes={routes}
          gymName={getGymName(selectedSession.gym_id)}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  )
}
