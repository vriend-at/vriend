'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { fetchMyTeams, createTeam, ensureProfile, leaveTeam, deleteTeam } from '@/lib/supabase-queries'
import { Team } from '@/lib/mock-data'
import Leaderboard from '@/components/teams/Leaderboard'
import CreateTeamModal from '@/components/teams/CreateTeamModal'
import InviteModal from '@/components/teams/InviteModal'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<{ name: string; id: string } | null>(null)

  const load = useCallback(async () => {
    setFetchError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await ensureProfile(user.id, user.email ?? user.id)
      const data = await fetchMyTeams(user.id)
      setTeams(data)
    } catch (err) {
      console.error('[TeamsPage] load error:', err)
      setFetchError('Teams konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(name: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Nicht angemeldet')

    const teamId = await createTeam(name, user.id)
    if (!teamId) throw new Error('Team konnte nicht erstellt werden')

    // Close modal first, then reload list
    setShowCreate(false)
    setLoading(true)
    await load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-[#b45309] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        {!fetchError && teams.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e7e0d8] shadow-sm p-8 text-center">
            <p className="text-[#78716c] text-sm mb-1">Du bist noch in keinem Team.</p>
            <p className="text-[#78716c] text-sm">Erstelle ein Team oder tritt über einen Einladungslink bei.</p>
          </div>
        )}

        {teams.map(team => (
          <Leaderboard
            key={team.id}
            team={team}
            userId={userId ?? ''}
            onInvite={() => setInviteTarget({ name: team.name, id: team.id })}
            onLeave={async () => { await leaveTeam(team.id); setLoading(true); await load() }}
            onDelete={async () => { await deleteTeam(team.id); setLoading(true); await load() }}
          />
        ))}

        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[#d6cfc6] text-[#78716c] hover:border-[#b45309] hover:text-[#b45309] hover:bg-[#fef9f4] transition-colors text-sm font-semibold"
        >
          <Plus size={16} />
          Neues Team erstellen
        </button>
      </div>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {inviteTarget && (
        <InviteModal
          teamName={inviteTarget.name}
          teamId={inviteTarget.id}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </>
  )
}
