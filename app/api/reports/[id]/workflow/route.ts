import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/lib/ownership'
import { generateWorkflow } from '@/lib/ai/workflow'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Ctx) {
  const { id } = await params
  const db = createAdminClient()

  const { data: report } = await db.from('reports').select('*').eq('id', id).single()
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!(await verifyOwnership(report))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (report.workflow_json) {
    return NextResponse.json({ workflow: report.workflow_json, edit_count: report.edit_count })
  }

  try {
    const workflow = await generateWorkflow(report.work_description)
    const { error } = await db.from('reports').update({ workflow_json: workflow }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ workflow, edit_count: report.edit_count })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'workflow generation failed' },
      { status: 500 },
    )
  }
}
