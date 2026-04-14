'use client'

import { useState, useMemo, useEffect } from 'react'
import { type Gym, type Route, type Session } from '@/lib/mock-data'
import { getGradeBreakdown } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { fetchCompletedRouteIds, fetchRoutes, fetchSessions } from '@/lib/supabase-queries'
import GymSelector from '@/components/ui/GymSelector'
import CircularProgress from '@/components/dashboard/CircularProgress'
import GradeBreakdown from '@/components/dashboard/GradeBreakdown'
import CompletedRoutesSheet from '@/components/dashboard/CompletedRoutesSheet'
import AllSessionsSheet from '@/components/dashboard/AllSessionsSheet'
import { CalendarDays, TrendingUp, ChevronRight } from 'lucide-react'

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [allRoutes, setAllRoutes] = useState<Route[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<Session[]>([])
  const [showCompletedSheet, setShowCompletedSheet] = useState(false)
  const [showSessionsSheet, setShowSessionsSheet] = useState(false)

  // Fetch user + gyms on mount
  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('gyms').select('id, name, city, description, logo_url'),
      fetchRoutes(null),
    ]).then(([{ data: { user } }, { data: gymsData }, allR]) => {
      if (user) setUserId(user.id)
      if (gymsData) setGyms(gymsData)
      setAllRoutes(allR)
    })
  }, [])

  // Fetch routes, completedIds, sessions when gym or user changes
  useEffect(() => {
    if (!userId) return

    Promise.all([
      fetchRoutes(selectedGymId),
      fetchCompletedRouteIds(userId, selectedGymId),
      fetchSessions(userId, selectedGymId, 200),
    ]).then(([r, ids, s]) => {
      setRoutes(r)
      setCompletedIds(ids)
      setSessions(s)
    })
  }, [selectedGymId, userId])

  const totalRoutes = routes.length
  const completedCount = routes.filter(r => completedIds.has(r.id)).length
  const percentage = totalRoutes > 0 ? (completedCount / totalRoutes) * 100 : 0

  const now = new Date()
  const sessionsThisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const breakdown = useMemo(
    () => getGradeBreakdown(routes, completedIds),
    [routes, completedIds]
  )

  // Build completed route items sorted by most recent completion date
  const completedRouteItems = useMemo(() => {
    // Map routeId → most recent session date where it was completed
    const latestDate = new Map<string, string>()
    for (const session of sessions) {
      for (const sr of session.routes) {
        if (!sr.completed) continue
        const existing = latestDate.get(sr.route_id)
        if (!existing || session.date > existing) {
          latestDate.set(sr.route_id, session.date)
        }
      }
    }

    return Array.from(completedIds)
      .map(id => {
        const route = allRoutes.find(r => r.id === id)
        if (!route) return null
        const gymName = gyms.find(g => g.id === route.gym_id)?.name ?? '–'
        const completedOn = latestDate.get(id) ?? ''
        return { route, gymName, completedOn }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.completedOn.localeCompare(a.completedOn))
  }, [completedIds, allRoutes, gyms, sessions])

  return (
    <div className="space-y-4">
      {/* Gym selector */}
      <GymSelector
        gyms={gyms}
        selectedId={selectedGymId}
        onChange={setSelectedGymId}
      />

      {/* Hero card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6">
        <h2 className="text-sm font-semibold text-[#78716c] uppercase tracking-wide mb-4">
          {selectedGymId ? gyms.find(g => g.id === selectedGymId)?.name : 'Gesamt Fortschritt'}
        </h2>
        <div className="flex justify-center">
          <CircularProgress
            percentage={percentage}
            completed={completedCount}
            total={totalRoutes}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => setShowCompletedSheet(true)}
            className="bg-[#f5f0eb] rounded-xl p-3.5 flex items-center gap-3 hover:bg-[#ede8e1] transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-[#b45309]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-[#1c1917] leading-none">{completedCount}</p>
              <p className="text-xs text-[#78716c] mt-0.5">Routen gesamt</p>
            </div>
            <ChevronRight size={14} className="text-[#78716c] shrink-0" />
          </button>

          <button
            onClick={() => setShowSessionsSheet(true)}
            className="bg-[#f5f0eb] rounded-xl p-3.5 flex items-center gap-3 hover:bg-[#ede8e1] transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
              <CalendarDays size={18} className="text-[#b45309]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-[#1c1917] leading-none">{sessionsThisMonth}</p>
              <p className="text-xs text-[#78716c] mt-0.5">Sessions diesen Monat</p>
            </div>
            <ChevronRight size={14} className="text-[#78716c] shrink-0" />
          </button>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-5">
        <h2 className="text-sm font-semibold text-[#78716c] uppercase tracking-wide mb-4">
          Schwierigkeitsgrade
        </h2>
        <GradeBreakdown breakdown={breakdown} />
      </div>

      {/* Bottom sheets */}
      {showCompletedSheet && (
        <CompletedRoutesSheet
          items={completedRouteItems}
          onClose={() => setShowCompletedSheet(false)}
        />
      )}
      {showSessionsSheet && (
        <AllSessionsSheet
          sessions={sessions}
          routes={allRoutes}
          gyms={gyms}
          onClose={() => setShowSessionsSheet(false)}
        />
      )}
    </div>
  )
}
