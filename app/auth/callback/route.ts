import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // Create profile from display_name set at signup, falling back to email prefix
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const rawName = user.user_metadata?.display_name
        || user.email?.split('@')[0]?.replace(/[._-]/g, ' ')
        || 'User'
      const displayName = rawName.replace(/\b\w/g, (l: string) => l.toUpperCase())
      await supabase.from('profiles').upsert(
        { id: user.id, display_name: displayName },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
