'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://vriend.at/auth/reset-password',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
            <p className="text-sm text-[#78716c]">your vertical friend</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📬</span>
            </div>
            <h2 className="text-lg font-bold text-[#1c1917] mb-2">E-Mail gesendet</h2>
            <p className="text-sm text-[#78716c]">
              Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen des Passworts geschickt.
            </p>
          </div>
          <p className="text-center text-sm text-[#78716c] mt-4">
            <Link href="/login" className="text-[#b45309] font-semibold hover:underline">
              Zurück zur Anmeldung
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
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="vriend" width={80} height={80} className="mb-3" />
          <p className="text-sm text-[#78716c]">your vertical friend</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e7e0d8] p-6">
          <h2 className="text-lg font-bold text-[#1c1917] mb-1">Passwort zurücksetzen</h2>
          <p className="text-sm text-[#78716c] mb-5">
            Gib deine E-Mail-Adresse ein und wir schicken dir einen Link zum Zurücksetzen.
          </p>

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
              {loading ? 'Senden…' : 'Link senden'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#78716c] mt-4">
          <Link href="/login" className="text-[#b45309] font-semibold hover:underline">
            Zurück zur Anmeldung
          </Link>
        </p>
      </div>
    </div>
  )
}
