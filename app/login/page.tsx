'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Config error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add both to Vercel → Settings → Environment Variables and redeploy.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const status = (error as { status?: number }).status
      const msg = error.message === 'Invalid login credentials'
        ? 'E-Mail oder Passwort ist falsch.'
        : error.message
      setError(status ? `[${status}] ${msg}` : msg)
      console.error('Supabase signInWithPassword error:', error)
      setLoading(false)
    } else {
      const pendingInvite = localStorage.getItem('vriend_pending_invite')
      if (pendingInvite) {
        localStorage.removeItem('vriend_pending_invite')
        router.push(`/join?team=${pendingInvite}`)
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
          <p className="text-sm text-[#78716c]">your vertical friend</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6">
          <h2 className="text-lg font-bold text-[#1c1917] mb-5">Anmelden</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309] bg-white"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309] bg-white"
                placeholder="••••••••"
              />
              <div className="mt-1.5 text-right">
                <Link href="/forgot-password" className="text-xs text-[#b45309] hover:underline">
                  Passwort vergessen?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b45309] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#92400e] transition-colors disabled:opacity-60"
            >
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716c] mt-4">
          Noch kein Konto?{' '}
          <Link href="/signup" className="text-[#b45309] font-semibold hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
