'use client'

import { usePathname } from 'next/navigation'
import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' ||
    pathname === '/forgot-password' || pathname === '/auth/reset-password' ||
    pathname === '/join'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
