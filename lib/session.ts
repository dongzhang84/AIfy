import 'server-only'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE = 'aify-session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 天

export async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(COOKIE)?.value
  if (existing) return existing
  const sid = crypto.randomUUID()
  jar.set(COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  return sid
}

export async function getSessionId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(COOKIE)?.value ?? null
}
