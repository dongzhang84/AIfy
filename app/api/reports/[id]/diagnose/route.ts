import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/lib/ownership'
import { generateDiagnosis } from '@/lib/ai/diagnose'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Ctx) {
  const { id } = await params
  const db = createAdminClient()

  const { data: report } = await db.from('reports').select('*').eq('id', id).single()
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!(await verifyOwnership(report))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!report.workflow_json) {
    return NextResponse.json({ error: 'workflow not generated yet' }, { status: 409 })
  }

  if (report.diagnosis_json) {
    return NextResponse.json({
      workflow: report.workflow_json,
      diagnosis: report.diagnosis_json,
      public_slug: report.public_slug,
    })
  }

  try {
    const diagnosis = await generateDiagnosis(report.work_description, report.workflow_json)
    const { error } = await db
      .from('reports')
      .update({ diagnosis_json: diagnosis, finalized_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      workflow: report.workflow_json,
      diagnosis,
      public_slug: report.public_slug,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'diagnosis failed' },
      { status: 500 },
    )
  }
}
