import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyOwnership } from '@/lib/ownership'
import type { Workflow } from '@/types'

type Ctx = { params: Promise<{ id: string }> }

function isWorkflow(x: unknown): x is Workflow {
  if (!x || typeof x !== 'object') return false
  const w = x as Workflow
  if (!Array.isArray(w.nodes) || !Array.isArray(w.edges)) return false
  if (w.nodes.length < 2 || w.nodes.length > 20) return false
  return w.nodes.every(
    (n) => typeof n?.id === 'string' && typeof n?.label === 'string' && n.label.length <= 30,
  ) && w.edges.every((e) => typeof e?.from === 'string' && typeof e?.to === 'string')
}

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const workflow = body?.workflow
  if (!isWorkflow(workflow)) {
    return NextResponse.json({ error: 'invalid workflow' }, { status: 400 })
  }

  const db = createAdminClient()
  const { data: report } = await db
    .from('reports')
    .select('owner_id, session_id, edit_count, finalized_at')
    .eq('id', id)
    .single()
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!(await verifyOwnership(report))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 诊断已生成后不允许再改 workflow（否则诊断会跟 workflow 不一致）
  if (report.finalized_at) {
    return NextResponse.json({ error: 'report finalized' }, { status: 409 })
  }

  // Rule 2: hard limit. 不是 UI hint。
  if (report.edit_count >= 2) {
    return NextResponse.json({ error: 'Edit limit reached' }, { status: 403 })
  }

  // 验证 edges 的 from/to 都指向 nodes
  const ids = new Set(workflow.nodes.map((n) => n.id))
  workflow.edges = workflow.edges.filter((e) => ids.has(e.from) && ids.has(e.to))

  const newCount = report.edit_count + 1
  const { error } = await db
    .from('reports')
    .update({ workflow_json: workflow, edit_count: newCount })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, edit_count: newCount })
}
