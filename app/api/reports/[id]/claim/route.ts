import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'

type Ctx = { params: Promise<{ id: string }> }

// Session → User 迁移：登录后把匿名报告挂到用户名下。
export async function POST(_request: Request, { params }: Ctx) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = await getSessionId()
  if (!sessionId) return NextResponse.json({ error: 'no session' }, { status: 400 })

  const { id } = await params
  const db = createAdminClient()
  const { data, error } = await db
    .from('reports')
    .update({ owner_id: user.id, session_id: null })
    .eq('id', id)
    .eq('session_id', sessionId)
    .is('owner_id', null)
    .select('id, public_slug')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'claim failed' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, public_slug: data.public_slug })
}
