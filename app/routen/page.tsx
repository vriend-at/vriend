'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { type Gym, type Route } from '@/lib/mock-data'
import { GRADES, Grade, GRADE_INDEX } from '@/lib/constants'
import { createClient } from '@/lib/supabase'
import { getOrCreateTodaySession, fetchCompletedRouteIds } from '@/lib/supabase-queries'
import { getLastGymId, setLastGymId } from '@/lib/gym-store'
import GymSelector from '@/components/ui/GymSelector'
import RouteCard from '@/components/routen/RouteCard'

const MAX_GRADE_KEY = 'vriend_max_grade'

function RoutenPageInner() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null)
  const [gymRoutes, setGymRoutes] = useState<Route[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loadingRoutes, setLoadingRoutes] = useState(false)

  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [maxGrade, setMaxGrade] = useState<Grade | null>(null)

  // Load max_grade from localStorage and listen for settings updates
  useEffect(() => {
    const stored = localStorage.getItem(MAX_GRADE_KEY) as Grade | null
    if (stored && GRADES.includes(stored)) setMaxGrade(stored)

    const handler = (e: Event) => {
      const grade = (e as CustomEvent<{ maxGrade: Grade }>).detail?.maxGrade
      if (grade && GRADES.includes(grade)) setMaxGrade(grade)
    }
    window.addEventListener('profileUpdated', handler)
    return () => window.removeEventListener('profileUpdated', handler)
  }, [])

  // Fetch user + gyms on mount; prefer ?gym= param, then last used gym
  useEffect(() => {
    const supabase = createClient()
    const gymParam = searchParams.get('gym')
    const savedGymId = getLastGymId()

    Promise.all([
      supabase.auth.getUser(),
      supabase.from('gyms').select('id, name, city, description, logo_url'),
    ]).then(([{ data: { user } }, { data: gymsData }]) => {
      if (user) setUserId(user.id)
      if (gymsData?.length) {
        setGyms(gymsData)
        const ids = gymsData.map((g: { id: string }) => g.id)

        if (gymParam === 'all') {
          // Explicit "Alle Hallen" — skip auto-select
          setSelectedGymId(null)
        } else if (gymParam && ids.includes(gymParam)) {
          // Specific gym from dashboard link
          setSelectedGymId(gymParam)
        } else {
          // No param — normal auto-select: last used gym or first gym
          const initial = (savedGymId && ids.includes(savedGymId) ? savedGymId : null) ?? gymsData[0].id
          setSelectedGymId(initial)
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch routes + completed IDs when gym or user changes
  useEffect(() => {
    if (!selectedGymId || !userId) return

    setLoadingRoutes(true)
    const supabase = createClient()

    Promise.all([
      supabase
        .from('routes')
        .select('id, gym_id, name, grade, color, zone, setter_name, set_date, remove_date, splat_url')
        .eq('gym_id', selectedGymId),
      fetchCompletedRouteIds(userId, selectedGymId),
    ]).then(([{ data: routesData }, ids]) => {
      setGymRoutes((routesData as Route[]) ?? [])
      setCompletedIds(ids)
      setLoadingRoutes(false)
    })
  }, [selectedGymId, userId])

  const zones = useMemo(() => {
    const set = new Set(gymRoutes.map(r => r.zone))
    return Array.from(set).sort()
  }, [gymRoutes])

  const filteredRoutes = useMemo(() => {
    const filtered = gymRoutes.filter(route => {
      if (gradeFilter !== 'all' && route.grade !== gradeFilter) return false
      if (zoneFilter !== 'all' && route.zone !== zoneFilter) return false
      if (maxGrade && GRADE_INDEX[route.grade] > GRADE_INDEX[maxGrade]) return false
      return true
    })
    filtered.sort((a, b) => {
      const diff = GRADE_INDEX[a.grade] - GRADE_INDEX[b.grade]
      return sortDir === 'asc' ? diff : -diff
    })
    return filtered
  }, [gymRoutes, gradeFilter, zoneFilter, sortDir, maxGrade])

  function handleGymChange(id: string | null) {
    setSelectedGymId(id)
    if (id) setLastGymId(id)
    setZoneFilter('all')
    setGradeFilter('all')
    setCompletedIds(new Set())
  }

  async function toggleComplete(routeId: string) {
    if (!userId || !selectedGymId) return

    const isCurrentlyCompleted = completedIds.has(routeId)

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev)
      if (isCurrentlyCompleted) next.delete(routeId)
      else next.add(routeId)
      return next
    })

    const supabase = createClient()

    if (isCurrentlyCompleted) {
      const { data: userSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('gym_id', selectedGymId)

      if (userSessions?.length) {
        await supabase
          .from('session_routes')
          .update({ completed: false })
          .in('session_id', userSessions.map((s: { id: string }) => s.id))
          .eq('route_id', routeId)
      }
    } else {
      const sessionId = await getOrCreateTodaySession(userId, selectedGymId)
      if (!sessionId) return

      await supabase
        .from('session_routes')
        .upsert(
          { session_id: sessionId, route_id: routeId, completed: true, attempts: 1 },
          { onConflict: 'session_id,route_id' }
        )
        .select()

      // Remember this gym as the last active one
      setLastGymId(selectedGymId)
    }
  }

  const completedCount = filteredRoutes.filter(r => completedIds.has(r.id)).length
  const activeFilters = (gradeFilter !== 'all' ? 1 : 0) + (zoneFilter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Gym selector */}
      <GymSelector
        gyms={gyms}
        selectedId={selectedGymId}
        onChange={handleGymChange}
      />

      {/* Filter row */}
      <div className="flex gap-2">
        {/* Grade filter */}
        <div className="relative flex-1">
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value as Grade | 'all')}
            className="appearance-none w-full bg-white border border-[#e7e0d8] rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-[#1c1917] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b45309] cursor-pointer"
          >
            <option value="all">Alle Grade</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] pointer-events-none" />
        </div>

        {/* Zone filter */}
        <div className="relative flex-1">
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="appearance-none w-full bg-white border border-[#e7e0d8] rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-[#1c1917] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b45309] cursor-pointer"
          >
            <option value="all">Alle Zonen</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] pointer-events-none" />
        </div>
      </div>

      {/* Sort control */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wide shrink-0">Sortierung</span>
        <div className="flex rounded-xl border border-[#e7e0d8] bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setSortDir('asc')}
            className={`px-3 py-2 text-xs font-semibold transition-colors ${
              sortDir === 'asc'
                ? 'bg-[#b45309] text-white'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Aufsteigend
          </button>
          <div className="w-px bg-[#e7e0d8]" />
          <button
            onClick={() => setSortDir('desc')}
            className={`px-3 py-2 text-xs font-semibold transition-colors ${
              sortDir === 'desc'
                ? 'bg-[#b45309] text-white'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Absteigend
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#78716c]">
            <span className="font-semibold text-[#1c1917]">{filteredRoutes.length}</span> Routen
          </span>
          {activeFilters > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#b45309] bg-[#fef3c7] border border-amber-200 rounded-full px-2 py-0.5">
              <SlidersHorizontal size={10} />
              {activeFilters} Filter aktiv
            </span>
          )}
        </div>
        <span className="text-sm text-[#78716c]">
          <span className="font-semibold text-green-600">{completedCount}</span> geschafft
        </span>
      </div>

      {/* Route grid */}
      {loadingRoutes ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[#78716c]">Routen werden geladen…</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">🔍</span>
          <p className="font-semibold text-[#1c1917]">Keine Routen gefunden</p>
          <p className="text-sm text-[#78716c] mt-1">Probiere andere Filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredRoutes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              completed={completedIds.has(route.id)}
              onMarkComplete={toggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoutenPage() {
  return (
    <Suspense>
      <RoutenPageInner />
    </Suspense>
  )
}
