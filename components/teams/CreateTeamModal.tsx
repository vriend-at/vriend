'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export default function CreateTeamModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onCreate(name.trim())
      // onCreate closes the modal on success; if we reach here the modal is already unmounting
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Team konnte nicht erstellt werden.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1c1917]">Neues Team erstellen</h2>
          <button onClick={onClose} disabled={loading} className="text-[#78716c] hover:text-[#1c1917] disabled:opacity-40">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#78716c] uppercase tracking-wide mb-1.5">
              Teamname
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              maxLength={40}
              className="w-full border border-[#e7e0d8] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#b45309] bg-white"
              placeholder="z.B. Blockteufel"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-[#b45309] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#92400e] transition-colors disabled:opacity-60"
          >
            {loading ? 'Erstellen…' : 'Team erstellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
