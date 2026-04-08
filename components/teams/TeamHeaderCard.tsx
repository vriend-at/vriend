'use client'

import { UserPlus } from 'lucide-react'
import { Team } from '@/lib/mock-data'
import { formatTeamDate } from '@/lib/team-utils'

interface Props {
  team: Team
}

export default function TeamHeaderCard({ team }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#e7e0d8] shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#1c1917] flex items-center gap-2">
            ⛰️ {team.name}
          </h2>
          <p className="text-sm text-[#78716c] mt-0.5">
            {team.members.length} {team.members.length === 1 ? 'Mitglied' : 'Mitglieder'}
            <span className="mx-1.5 text-[#e7e0d8]">·</span>
            seit {formatTeamDate(team.created_at)}
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#fef3c7] hover:bg-amber-100 text-[#b45309] border border-amber-200 text-xs font-semibold rounded-xl px-3 py-2 transition-colors shrink-0">
          <UserPlus size={13} />
          Einladen
        </button>
      </div>

      {/* Member avatars */}
      <div className="flex items-center gap-2 mt-4">
        {team.members.map(member => (
          <div
            key={member.id}
            title={member.display_name}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: member.id === 'user-1' ? '#b45309' : '#a8a29e' }}
          >
            {member.avatar_initials}
          </div>
        ))}
      </div>
    </div>
  )
}
