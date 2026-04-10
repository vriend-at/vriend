'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

export default function ConfirmModal({ title, message, confirmLabel, destructive = false, onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setError(null)
    setLoading(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1c1917]">{title}</h2>
          <button onClick={onClose} disabled={loading} className="text-[#78716c] hover:text-[#1c1917] disabled:opacity-40">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-[#78716c] mb-5">{message}</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-[#e7e0d8] text-[#78716c] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#f5f0eb] transition-colors disabled:opacity-40"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#b45309] hover:bg-[#92400e]'
            }`}
          >
            {loading ? 'Bitte warten…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
