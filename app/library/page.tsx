import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { countTiers } from '@/lib/tally'
import { truncate } from '@/lib/text'
import type { Diagnosis } from '@/types'

function timeAgo(ts: string): string {
  const ms = Date.now() - new Date(ts).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  return `${d} 天前`
}

export default async function LibraryPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // middleware 已挡过未登录；这里仅作 type narrow
  if (!user) return null

  const db = createAdminClient()
  const { data: reports } = await db
    .from('reports')
    .select('id, work_description, public_slug, diagnosis_json, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">我的诊断历史</h1>

      {!reports?.length && (
        <p className="mt-6 text-sm text-slate-500">
          还没有报告。
          <Link href="/reports/new" className="underline ml-1">
            做一份
          </Link>
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {reports?.map((r) => {
          const tally = countTiers(r.diagnosis_json as Diagnosis | null)
          return (
            <li
              key={r.id}
              className="border border-slate-200 rounded-md p-4 flex justify-between items-start gap-4"
            >
              <div>
                <p className="font-medium">{truncate(r.work_description, 60)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  🟢 {tally.green} · 🟡 {tally.yellow} · ⚪ {tally.gray}
                  <span className="mx-2">·</span>
                  {timeAgo(r.created_at as unknown as string)}
                </p>
              </div>
              <Link href={`/r/${r.public_slug}`} className="text-blue-600 whitespace-nowrap">
                查看 →
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
