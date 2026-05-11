'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginInner() {
  const search = useSearchParams()
  const next = search.get('next') ?? '/library'
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function google() {
    setBusy(true)
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

  async function email_(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    window.location.href = next
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl font-semibold">登录</h1>

      <button
        onClick={google}
        disabled={busy}
        className="mt-6 w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        用 Google 登录
      </button>

      <div className="my-4 text-center text-xs text-slate-400">或</div>

      <form onSubmit={email_} className="space-y-2">
        <input
          type="email"
          required
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="password"
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
        没账号？
        <a href={`/auth/register?next=${encodeURIComponent(next)}`} className="underline">
          注册
        </a>
      </p>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-sm px-6 py-24" />}>
      <LoginInner />
    </Suspense>
  )
}
