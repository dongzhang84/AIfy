'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  reportId: string
  onClose: () => void
}

export function LoginModal({ reportId, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const next = `/reports/${reportId}/diagnose?share=1`

  async function loginGoogle() {
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setError(error.message)
      setBusy(false)
    }
  }

  async function loginEmail(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    // claim 然后跳到分享页
    const claim = await fetch(`/api/reports/${reportId}/claim`, { method: 'POST' })
    if (claim.ok) {
      const { public_slug } = await claim.json()
      window.location.href = `/r/${public_slug}`
    } else {
      window.location.href = next
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold">最后一步：登录后才能分享</h2>
        <p className="mt-3 text-sm text-slate-600">
          你刚刚看到的诊断报告是匿名生成的。登录后，这份报告会归到你账户下，可以分享、可以稍后回来看。
          <br />
          <span className="text-xs text-slate-400 mt-1 inline-block">
            （这是我们唯一会要求你登录的时刻。）
          </span>
        </p>

        <button
          onClick={loginGoogle}
          disabled={busy}
          className="mt-6 w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          用 Google 登录
        </button>

        <div className="my-4 text-center text-xs text-slate-400">或</div>

        <form onSubmit={loginEmail} className="space-y-2">
          <input
            type="email"
            placeholder="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full border border-slate-300 py-2 rounded text-sm disabled:opacity-50"
          >
            用 Email 登录
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          没账号？<a href={`/auth/register?next=${encodeURIComponent(next)}`} className="underline">注册</a>
        </p>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button onClick={onClose} className="mt-6 text-xs text-slate-400 hover:text-slate-600">
          关闭
        </button>
      </div>
    </div>
  )
}
