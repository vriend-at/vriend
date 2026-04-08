'use client'

import { useState } from 'react'
import { MOCK_USER } from '@/lib/mock-data'
import SettingsModal from './SettingsModal'

export default function TopBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#f5f0eb]/90 backdrop-blur-sm border-b border-[#e7e0d8]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <span className="text-xl font-bold text-[#b45309] tracking-tight">vriend</span>
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#b45309] flex items-center justify-center text-white text-sm font-bold hover:bg-[#92400e] transition-colors"
          >
            {MOCK_USER.avatar_initials}
          </button>
        </div>
      </header>

      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}
