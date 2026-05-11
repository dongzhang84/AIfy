'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLACEHOLDERS = [
  '我是 indie dev，每天写代码、回邮件、刷 X、做 demo、写周报...',
  '我是产品经理，开会、写 PRD、看用户反馈、约访谈、跟工程师讨论...',
  '我是 freelance designer，找客户、做 brief、画 mock、来回改、出图...',
]

const MIN_LEN = 30

export default function NewReportPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 选一次就固定，避免每次输入都重新随机抖动
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)],
  )

  async function submit() {
    if (text.trim().length < MIN_LEN) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ work_description: text.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || '提交失败')
      }
      const { id } = await res.json()
      router.push(`/reports/${id}/workflow`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
      setSubmitting(false)
    }
  }

  const remaining = Math.max(0, MIN_LEN - text.trim().length)

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="text-2xl font-semibold">3-5 句话讲讲你平时怎么工作</h2>
      <p className="mt-2 text-sm text-slate-500">
        不分步、不追问、不强制结构化。写到流程级别，包含痛点。
      </p>

      <textarea
        rows={6}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-6 w-full rounded-md border border-slate-300 p-4 text-base focus:outline-none focus:ring-2 focus:ring-black/10"
      />

      <div className="mt-2 text-xs text-slate-400">
        {remaining > 0 ? `还需要 ${remaining} 个字符` : '可以提交了'}
      </div>

      <button
        disabled={submitting || text.trim().length < MIN_LEN}
        onClick={submit}
        className="mt-4 bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
      >
        {submitting ? '生成中…' : '画出我的流程图 →'}
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  )
}
