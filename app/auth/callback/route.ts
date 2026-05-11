import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/library'

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 只允许相对路径回流，防 open redirect
  const safeNext = next.startsWith('/') ? next : '/library'
  return NextResponse.redirect(new URL(safeNext, url.origin))
}
