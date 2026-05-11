'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegisterInner() {
  const search = useSearchParams()
  const next = search.get('next') ?? '/library'
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }
    setDone(true)
    setBusy(false)
  }

  if (done) {
    return (
      <main className="mx-auto max-w-sm px-6 py-24">
        <h1 className="text-2xl font-semibold">检查你的邮箱</h1>
        <p className="mt-3 text-sm text-slate-500">
          如果配置了 Email confirmation，请点验证链接。否则直接{' '}
          <a href={`/auth/login?next=${encodeURIComponent(next)}`} className="underline">登录</a>。
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl font-semibold">注册</h1>
      <form onSubmit={submit} className="mt-6 space-y-2">
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
          minLength={6}
          placeholder="password (6+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          注册
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-sm px-6 py-24" />}>
      <RegisterInner />
    </Suspense>
  )
}
