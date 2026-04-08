'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { MOCK_USER } from '@/lib/mock-data'
import { GRADES, Grade } from '@/lib/constants'
import { createClient } from '@/lib/supabase'

interface Props {
  onClose: () => void
}

export default function SettingsModal({ onClose }: Props) {
  const [name, setName] = useState(MOCK_USER.display_name)
  const [email, setEmail] = useState(MOCK_USER.email)
  const [maxGrade, setMaxGrade] = useState<Grade>(MOCK_USER.max_grade)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 overlay-enter"
        onClick={onClose}
      />
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
              <div className="w-16 h-16 rounded-2xl bg-[#b45309] flex items-center justify-center text-white text-xl font-bold">
                {MOCK_USER.avatar_initials}
              </div>
              <div>
                <p className="font-semibold text-[#1c1917]">{name}</p>
                <p className="text-sm text-[#78716c]">{email}</p>
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

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              />
            </div>

            {/* Max grade */}
            <div>
              <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
                Maximaler Schwierigkeitsgrad
              </label>
              <p className="text-xs text-[#78716c] mb-2">Routen über diesem Grad werden app-weit ausgeblendet.</p>
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

            {/* Save button */}
            <button className="w-full bg-[#b45309] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#92400e] transition-colors">
              Speichern
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
