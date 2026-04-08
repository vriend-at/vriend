'use client'

import { useState, useMemo, useEffect } from 'react'
import { type Gym, type Route, type Session } from '@/lib/mock-data'
import { getGradeBreakdown } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { fetchCompletedRouteIds, fetchRoutes, fetchSessions } from '@/lib/supabase-queries'
import GymSelector from '@/components/ui/GymSelector'
import CircularProgress from '@/components/dashboard/CircularProgress'
import GradeBreakdown from '@/components/dashboard/GradeBreakdown'
import RecentSessions from '@/components/dashboard/RecentSessions'
import { CalendarDays, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  // All routes across all gyms, used by the session bottom sheet to look up route details
  const [allRoutes, setAllRoutes] = useState<Route[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [sessions, setSessions] = useState<Session[]>([])

  // Fetch user + gyms on mount
  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('gyms').select('id, name, city, description, logo_url'),
      fetchRoutes(null), // all routes for bottom sheet lookups
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
      fetchSessions(userId, selectedGymId, 4),
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
          <div className="bg-[#f5f0eb] rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
              <TrendingUp size={18} className="text-[#b45309]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1c1917] leading-none">{completedCount}</p>
              <p className="text-xs text-[#78716c] mt-0.5">Routen gesamt</p>
            </div>
          </div>
          <div className="bg-[#f5f0eb] rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
              <CalendarDays size={18} className="text-[#b45309]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1c1917] leading-none">{sessionsThisMonth}</p>
              <p className="text-xs text-[#78716c] mt-0.5">Sessions diesen Monat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-5">
        <h2 className="text-sm font-semibold text-[#78716c] uppercase tracking-wide mb-4">
          Schwierigkeitsgrade
        </h2>
        <GradeBreakdown breakdown={breakdown} />
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-5">
        <h2 className="text-sm font-semibold text-[#78716c] uppercase tracking-wide mb-4">
          Letzte Sessions
        </h2>
        <RecentSessions
          sessions={sessions}
          routes={allRoutes}
          gyms={gyms}
        />
      </div>
    </div>
  )
}
