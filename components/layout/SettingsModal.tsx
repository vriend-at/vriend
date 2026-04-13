'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { GRADES, Grade } from '@/lib/constants'
import { createClient } from '@/lib/supabase'

const MAX_GRADE_KEY = 'vriend_max_grade'

interface Props {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [maxGrade, setMaxGrade] = useState<Grade>('8A')
  const [initials, setInitials] = useState('?')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, max_grade')
        .eq('id', user.id)
        .maybeSingle()

      const displayName = profile?.display_name
        || user.user_metadata?.display_name
        || user.email?.split('@')[0]
        || ''
      setName(displayName)

      const storedGrade = profile?.max_grade as Grade | null
      const grade = storedGrade && GRADES.includes(storedGrade) ? storedGrade : '8A'
      setMaxGrade(grade)

      setInitials(
        displayName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
      )
    }
    load()
  }, [])

  async function handleSave() {
    if (!userId) return
    setError(null)
    setSaving(true)
    setSaved(false)

    const supabase = createClient()
    const { error: err } = await supabase.from('profiles').upsert(
      { id: userId, display_name: name.trim(), max_grade: maxGrade },
      { onConflict: 'id' }
    )

    if (err) {
      setError(err.message)
    } else {
      // Persist max_grade for Routen page filtering
      localStorage.setItem(MAX_GRADE_KEY, maxGrade)
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { maxGrade } }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 overlay-enter" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl sheet-enter sm:animate-none">
          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-[#e7e0d8]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e0d8]">
            <h2 className="text-lg font-bold text-[#1c1917]">Einstellungen</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f5f0eb] text-[#78716c] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#b45309] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1c1917] truncate">{name || '–'}</p>
                <p className="text-sm text-[#78716c] truncate">{email}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              />
            </div>

            {/* Max grade */}
            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                Maximaler Schwierigkeitsgrad
              </label>
              <p className="text-xs text-[#78716c] mb-2">Routen über diesem Grad werden auf der Routen-Seite ausgeblendet.</p>
              <select
                value={maxGrade}
                onChange={e => setMaxGrade(e.target.value as Grade)}
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309] bg-white"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full rounded-xl py-3 font-semibold text-sm transition-colors disabled:opacity-60 ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-[#b45309] hover:bg-[#92400e] text-white'
              }`}
            >
              {saved ? 'Gespeichert!' : saving ? 'Speichern…' : 'Speichern'}
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full border border-[#e7e0d8] text-[#78716c] rounded-xl py-3 font-semibold text-sm hover:bg-[#f5f0eb] transition-colors"
            >
              Abmelden
            </button>
          </div>

          <div className="h-safe-bottom pb-4" />
        </div>
      </div>
    </>
  )
}
