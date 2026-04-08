'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#b45309] tracking-tight">vriend</h1>
            <p className="text-sm text-[#78716c] mt-1">your vertical friend</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📬</span>
            </div>
            <h2 className="text-lg font-bold text-[#1c1917] mb-2">E-Mail bestätigen</h2>
            <p className="text-sm text-[#78716c]">
              Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klick auf den Link, um dein Konto zu aktivieren.
            </p>
          </div>
          <p className="text-center text-sm text-[#78716c] mt-4">
            Schon ein Konto?{' '}
            <Link href="/login" className="text-[#b45309] font-semibold hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#b45309] tracking-tight">vriend</h1>
          <p className="text-sm text-[#78716c] mt-1">your vertical friend</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6">
          <h2 className="text-lg font-bold text-[#1c1917] mb-5">Konto erstellen</h2>

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
                autoComplete="new-password"
                minLength={6}
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309] bg-white"
                placeholder="Mindestens 6 Zeichen"
              />
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
              {loading ? 'Registrieren…' : 'Registrieren'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716c] mt-4">
          Schon ein Konto?{' '}
          <Link href="/login" className="text-[#b45309] font-semibold hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  )
}
