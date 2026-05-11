import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/lib/ownership'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params
  const db = createAdminClient()
  const { data: report } = await db.from('reports').select('*').eq('id', id).single()
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!(await verifyOwnership(report))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json(report)
}
