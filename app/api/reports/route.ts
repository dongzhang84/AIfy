import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOrCreateSessionId } from '@/lib/session'
import { newSlug } from '@/lib/slug'

const MIN_LEN = 30
const MAX_LEN = 4000

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const work = typeof body?.work_description === 'string' ? body.work_description.trim() : ''
  if (work.length < MIN_LEN) {
    return NextResponse.json({ error: 'work_description too short' }, { status: 400 })
  }
  if (work.length > MAX_LEN) {
    return NextResponse.json({ error: 'work_description too long' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 已登录直接挂到用户名下；未登录用 session cookie
  const sessionId = user ? null : await getOrCreateSessionId()

  const db = createAdminClient()
  // 重试一次以防 slug 碰撞
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await db
      .from('reports')
      .insert({
        owner_id: user?.id ?? null,
        session_id: sessionId,
        public_slug: newSlug(),
        work_description: work,
      })
      .select('id')
      .single()

    if (!error && data) return NextResponse.json({ id: data.id })

    // 23505 = unique violation (public_slug)
    if (error?.code !== '23505') {
      return NextResponse.json({ error: error?.message ?? 'insert failed' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: 'slug collision' }, { status: 500 })
}
