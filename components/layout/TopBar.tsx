'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import SettingsModal from './SettingsModal'

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [initials, setInitials] = useState('?')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle()

      const name = profile?.display_name
        || user.user_metadata?.display_name
        || user.email?.split('@')[0]
        || ''
      setInitials(
        name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
      )
    }

    load()

    // Refresh initials when settings are saved
    const handler = () => load()
    window.addEventListener('profileUpdated', handler)
    return () => window.removeEventListener('profileUpdated', handler)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#f5f0eb]/90 backdrop-blur-sm border-b border-[#e7e0d8]">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Image
            src="/logo.png"
            alt="vriend"
            height={32}
            width={32}
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#b45309] flex items-center justify-center text-white text-sm font-bold hover:bg-[#92400e] transition-colors"
          >
            {initials}
          </button>
        </div>
      </header>

      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}
