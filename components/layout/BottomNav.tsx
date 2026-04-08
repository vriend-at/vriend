'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Route, Users } from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/routen',    label: 'Routen',    icon: Route },
  { href: '/teams',     label: 'Teams',     icon: Users },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e7e0d8] shadow-lg">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-[#b45309]' : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-[#b45309]' : ''}
              />
              {label}
            </Link>
          )
        })}
      </div>
      {/* Safe area for notch phones */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
