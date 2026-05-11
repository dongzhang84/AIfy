'use client'
import { createBrowserClient } from '@supabase/ssr'

// 共享 BeProfitly 项目，AIfy 只用 `aify` schema。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'aify' } },
  )
}
