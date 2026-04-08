'use client'

import { UserPlus } from 'lucide-react'
import { Team } from '@/lib/mock-data'
import { GRADES, GRADE_COLORS } from '@/lib/constants'
import { rankMembers, totalRoutes, formatTeamDate } from '@/lib/team-utils'

const MEDALS = ['🥇', '🥈', '🥉']
const CURRENT_USER_ID = 'user-1'

// Row bg colours — used in both cells and sticky overrides
const ROW_BG = (isCurrentUser: boolean) => isCurrentUser ? '#fef9f0' : '#ffffff'
const HEADER_BG = '#fafaf9'

interface Props {
  team: Team
}

export default function Leaderboard({ team }: Props) {
  const ranked = rankMembers(team.members)

  // All grades with at least one completion, hardest first
  const activeGrades = [...GRADES]
    .reverse()
    .filter(grade =>
      team.members.some(m => (m.grade_completions.find(g => g.grade === grade)?.count ?? 0) > 0)
    )

  return (
    <div className="bg-white rounded-2xl border border-[#e7e0d8] shadow-sm overflow-hidden">
      {/* Team header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#1c1917]">⛰️ {team.name}</h2>
          <p className="text-xs text-[#78716c] mt-0.5">
            {team.members.length} {team.members.length === 1 ? 'Mitglied' : 'Mitglieder'}
            <span className="mx-1.5 text-[#d6d0ca]">·</span>
            seit {formatTeamDate(team.created_at)}
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#fef3c7] hover:bg-amber-100 text-[#b45309] border border-amber-200 text-xs font-semibold rounded-xl px-3 py-2 transition-colors shrink-0">
          <UserPlus size={13} />
          Einladen
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t border-[#e7e0d8]">
        <table className="text-sm border-collapse" style={{ minWidth: '100%' }}>
          <thead>
            <tr className="border-b border-[#e7e0d8]">

              {/* Sticky left: Rank + Name */}
              <th
                className="text-left px-3 py-2.5 text-xs font-semibold text-[#78716c]"
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: HEADER_BG,
                  boxShadow: '4px 0 8px -2px rgba(0,0,0,0.07)',
                  minWidth: 140,
                }}
              >
                Name
              </th>

              {/* Scrollable grade headers */}
              {activeGrades.map(grade => {
                const colors = GRADE_COLORS[grade]
                return (
                  <th key={grade} className="text-center px-2 py-2" style={{ backgroundColor: HEADER_BG, width: 44 }}>
                    <span
                      className="inline-flex items-center justify-center text-[11px] font-bold rounded-lg px-1.5 py-0.5"
                      style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      {grade}
                    </span>
                  </th>
                )
              })}

              {/* Sticky right: Gesamt */}
              <th
                className="text-center px-3 py-2.5 text-xs font-semibold text-[#b45309]"
                style={{
                  position: 'sticky',
                  right: 0,
                  zIndex: 2,
                  backgroundColor: HEADER_BG,
                  boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.07)',
                  width: 52,
                }}
              >
                Ges.
              </th>
            </tr>
          </thead>

          <tbody>
            {ranked.map((member, i) => {
              const rank = i + 1
              const isCurrentUser = member.id === CURRENT_USER_ID
              const total = totalRoutes(member)
              const rowBg = ROW_BG(isCurrentUser)

              return (
                <tr
                  key={member.id}
                  className={`border-b border-[#f0ebe4] last:border-0 ${isCurrentUser ? '' : 'hover:bg-[#fafaf9]'}`}
                  style={{ backgroundColor: rowBg }}
                >
                  {/* Sticky left: Rank + Name */}
                  <td
                    className="px-3 py-3"
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      backgroundColor: rowBg,
                      boxShadow: '4px 0 8px -2px rgba(0,0,0,0.07)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Rank */}
                      <span className="shrink-0 w-6 text-center">
                        {rank <= 3
                          ? <span className="text-base leading-none">{MEDALS[rank - 1]}</span>
                          : <span className="text-xs font-bold text-[#78716c]">{rank}</span>
                        }
                      </span>
                      {/* Avatar */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ backgroundColor: isCurrentUser ? '#b45309' : '#a8a29e' }}
                      >
                        {member.avatar_initials}
                      </div>
                      {/* Name + Du badge */}
                      <span className={`font-semibold text-sm whitespace-nowrap ${isCurrentUser ? 'text-[#b45309]' : 'text-[#1c1917]'}`}>
                        {member.display_name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold text-[#b45309] bg-[#fef3c7] border border-amber-200 rounded-full px-1.5 py-0.5 shrink-0">
                          Du
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Scrollable grade cells */}
                  {activeGrades.map(grade => {
                    const count = member.grade_completions.find(g => g.grade === grade)?.count ?? 0
                    const colors = GRADE_COLORS[grade]
                    return (
                      <td key={grade} className="text-center px-2 py-3">
                        {count > 0 ? (
                          <span
                            className="inline-flex items-center justify-center text-xs font-bold rounded-md w-6 h-6"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {count}
                          </span>
                        ) : (
                          <span className="text-[#d6d0ca] text-xs">—</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Sticky right: Gesamt */}
                  <td
                    className="text-center px-3 py-3"
                    style={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 1,
                      backgroundColor: rowBg,
                      boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.07)',
                    }}
                  >
                    <span className={`text-base font-bold ${isCurrentUser ? 'text-[#b45309]' : 'text-[#1c1917]'}`}>
                      {total}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
