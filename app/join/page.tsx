'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { joinTeam } from '@/lib/supabase-queries'

const PENDING_INVITE_KEY = 'vriend_pending_invite'

type Status = 'loading' | 'prompt' | 'already_member' | 'joining' | 'invalid'

export default function JoinPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [teamId, setTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('team')
    if (!id) { setStatus('invalid'); return }
    setTeamId(id)

    async function handle() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        localStorage.setItem(PENDING_INVITE_KEY, id!)
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Load team name
      const { data: team } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', id)
        .maybeSingle()

      if (!team) { setStatus('invalid'); return }
      setTeamName(team.name)

      // Check if already a member
      const { data: existing } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('team_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      setStatus(existing ? 'already_member' : 'prompt')
    }

    handle()
  }, [router])

  async function handleJoin() {
    setError(null)
    setStatus('joining')
    try {
      await joinTeam(teamId, userId)
      router.push('/teams')
    } catch {
      setError('Beitritt fehlgeschlagen. Bitte versuche es erneut.')
      setStatus('prompt')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#b45309] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6 text-center">
            <p className="text-sm text-[#78716c]">Dieser Einladungslink ist ungültig oder abgelaufen.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'already_member') {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⛰️</span>
            </div>
            <h2 className="text-lg font-bold text-[#1c1917] mb-2">Bereits Mitglied</h2>
            <p className="text-sm text-[#78716c] mb-5">
              Du bist bereits Mitglied von <span className="font-semibold text-[#1c1917]">{teamName}</span>.
            </p>
            <button
              onClick={() => router.push('/teams')}
              className="w-full bg-[#b45309] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#92400e] transition-colors"
            >
              Zum Team
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 'prompt' or 'joining'
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛰️</span>
          </div>
          <h2 className="text-lg font-bold text-[#1c1917] mb-2">Einladung</h2>
          <p className="text-sm text-[#78716c] mb-6">
            Möchtest du dem Team{' '}
            <span className="font-semibold text-[#1c1917]">{teamName}</span>{' '}
            beitreten?
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleJoin}
              disabled={status === 'joining'}
              className="w-full bg-[#b45309] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#92400e] transition-colors disabled:opacity-60"
            >
              {status === 'joining' ? 'Beitreten…' : 'Beitreten'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              disabled={status === 'joining'}
              className="w-full border border-[#e7e0d8] text-[#78716c] rounded-xl py-3 font-semibold text-sm hover:bg-[#f5f0eb] transition-colors disabled:opacity-60"
            >
              Ablehnen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
