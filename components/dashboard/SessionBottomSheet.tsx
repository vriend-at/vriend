'use client'

import { X } from 'lucide-react'
import { Session, Route } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import GradeBadge from '@/components/ui/GradeBadge'

interface Props {
  session: Session
  routes: Route[]
  gymName: string
  onClose: () => void
}

export default function SessionBottomSheet({ session, routes, gymName, onClose }: Props) {
  const sessionRoutes = session.routes
    .filter(sr => sr.completed)
    .map(sr => ({
      ...sr,
      route: routes.find(r => r.id === sr.route_id),
    }))
    .filter(sr => sr.route)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 overlay-enter"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter">
        <div className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl mx-auto max-w-lg">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#e7e0d8]" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 py-3 border-b border-[#e7e0d8]">
            <div>
              <h2 className="text-lg font-bold text-[#1c1917]">{formatDate(session.date)}</h2>
              <p className="text-sm text-[#78716c]">{gymName}</p>
              {session.notes && (
                <p className="text-sm text-[#1c1917] mt-1 italic">&quot;{session.notes}&quot;</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f5f0eb] text-[#78716c] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Route list */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
            {sessionRoutes.map(({ route }) => (
              <div
                key={route!.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f0eb]"
              >
                <GradeBadge grade={route!.grade} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1c1917] truncate">{route!.name}</p>
                  <p className="text-xs text-[#78716c]">{route!.zone} · {route!.color}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Safe area */}
          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
