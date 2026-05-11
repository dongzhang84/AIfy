'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkflowEditor } from '@/components/WorkflowEditor'
import type { Workflow } from '@/types'

type Props = { params: Promise<{ id: string }> }

const MAX_EDITS = 2

export default function WorkflowPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [editsUsed, setEditsUsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/reports/${id}/workflow`, { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'failed')
        return r.json()
      })
      .then((d) => {
        if (cancelled) return
        setWorkflow(d.workflow)
        setEditsUsed(d.edit_count ?? 0)
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSave(next: Workflow) {
    setSaving(true)
    try {
      const res = await fetch(`/api/reports/${id}/edit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workflow: next }),
      })
      if (res.status === 403) {
        setError('已用完 2 次修改')
        return
      }
      if (!res.ok) {
        setError((await res.json()).error || '保存失败')
        return
      }
      const { edit_count } = await res.json()
      setEditsUsed(edit_count)
      setWorkflow(next)
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-red-600">出错了：{error}</p>
      </main>
    )
  }

  if (!workflow) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-slate-500">正在生成你的流程图…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-2xl font-semibold">这是你的工作流</h2>
      <p className="mt-2 text-slate-500">
        看一眼对不对。可以调整最多 {MAX_EDITS} 次（拖动 / 删除节点）。差不多就行——不需要 100% 准确。
      </p>

      <div className="mt-6">
        <WorkflowEditor
          workflow={workflow}
          editable
          editsRemaining={MAX_EDITS - editsUsed}
          onSave={handleSave}
          saving={saving}
        />
      </div>

      <button
        onClick={() => router.push(`/reports/${id}/diagnose`)}
        className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
      >
        就这样，继续分析 →
      </button>
    </main>
  )
}
