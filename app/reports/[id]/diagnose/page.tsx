'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { WorkflowEditor } from '@/components/WorkflowEditor'
import { TierLegend } from '@/components/TierLegend'
import { NodeDetailsList } from '@/components/NodeDetailsList'
import { LoginModal } from '@/components/LoginModal'
import type { Workflow, Diagnosis } from '@/types'

type Props = { params: Promise<{ id: string }> }
type Result = { workflow: Workflow; diagnosis: Diagnosis; public_slug: string }

export default function DiagnosePage({ params }: Props) {
  const { id } = use(params)
  const search = useSearchParams()
  const [data, setData] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/reports/${id}/diagnose`, { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'failed')
        return r.json()
      })
      .then((d: Result) => {
        if (cancelled) return
        setData(d)
        // 登录回流时 ?share=1 → 立刻跳到公开分享页
        if (search.get('share') === '1') {
          window.location.href = `/r/${d.public_slug}`
        }
      })
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [id, search])

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-red-600">出错了：{error}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-slate-500">诊断中…（需要 10–20 秒）</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-2xl font-semibold">你的 AI 化诊断</h2>
      <TierLegend />

      <WorkflowEditor workflow={data.workflow} diagnosis={data.diagnosis} editable={false} />

      <NodeDetailsList workflow={data.workflow} diagnosis={data.diagnosis} />

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          onClick={() => setShowLogin(true)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          📤 分享我的诊断
        </button>
        {process.env.NEXT_PUBLIC_CALENDLY_URL && (
          <a
            href={process.env.NEXT_PUBLIC_CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50 transition"
          >
            🗣️ 和创始人聊聊
          </a>
        )}
      </div>

      {showLogin && <LoginModal reportId={id} onClose={() => setShowLogin(false)} />}
    </main>
  )
}
