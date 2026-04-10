'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { joinTeam, ensureProfile } from '@/lib/supabase-queries'

const PENDING_INVITE_KEY = 'vriend_pending_invite'

export default function JoinPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'joining' | 'success' | 'invalid'>('loading')
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    const teamId = new URLSearchParams(window.location.search).get('team')
    if (!teamId) {
      setStatus('invalid')
      return
    }

    async function handle() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        localStorage.setItem(PENDING_INVITE_KEY, teamId!)
        router.push('/login')
        return
      }

      setStatus('joining')

      // Look up team by ID
      const { data: team } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .maybeSingle()

      if (!team) {
        setStatus('invalid')
        return
      }

      setTeamName(team.name)
      await ensureProfile(user.id, user.email ?? user.id)
      await joinTeam(team.id, user.id)
      setStatus('success')
    }

    handle()
  }, [router])

  if (status === 'loading' || status === 'joining') {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
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
          <h2 className="text-lg font-bold text-[#1c1917] mb-2">Willkommen im Team!</h2>
          <p className="text-sm text-[#78716c] mb-5">
            Du bist jetzt Mitglied von <span className="font-semibold text-[#1c1917]">{teamName}</span>.
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
