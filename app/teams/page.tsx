'use client'

import { Plus } from 'lucide-react'
import { MOCK_TEAMS } from '@/lib/mock-data'
import Leaderboard from '@/components/teams/Leaderboard'

export default function TeamsPage() {
  const [primaryTeam, ...otherTeams] = MOCK_TEAMS

  return (
    <div className="space-y-6">
      <Leaderboard team={primaryTeam} />

      {otherTeams.map(team => (
        <Leaderboard key={team.id} team={team} />
      ))}

      <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[#d6cfc6] text-[#78716c] hover:border-[#b45309] hover:text-[#b45309] hover:bg-[#fef9f4] transition-colors text-sm font-semibold">
        <Plus size={16} />
        Neues Team erstellen
      </button>
    </div>
  )
}
