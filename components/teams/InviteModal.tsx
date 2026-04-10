'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface Props {
  teamName: string
  teamId: string
  onClose: () => void
}

export default function InviteModal({ teamName, teamId, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `https://vriend.at/join?team=${teamId}`

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#1c1917]">Einladen zu {teamName}</h2>
          <button onClick={onClose} className="text-[#78716c] hover:text-[#1c1917]">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-[#78716c] mb-4">
          Teile diesen Link, um Freunde zu deinem Team einzuladen:
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#f5f0eb] rounded-xl px-4 py-2.5 text-sm text-[#1c1917] font-mono truncate">
            {inviteUrl}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 bg-[#b45309] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#92400e] transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Kopiert!' : 'Link kopieren'}
          </button>
        </div>
      </div>
    </div>
  )
}
