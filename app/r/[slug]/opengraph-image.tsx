import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { countTiers } from '@/lib/tally'
import { truncate } from '@/lib/text'
import type { Diagnosis } from '@/types'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function og({ params }: Props) {
  const { slug } = await params
  const db = createAdminClient()
  const { data: report } = await db
    .from('reports')
    .select('work_description, diagnosis_json')
    .eq('public_slug', slug)
    .single()

  const tally = countTiers((report?.diagnosis_json as Diagnosis | null) ?? null)
  const desc = report ? truncate(report.work_description, 80) : 'AI 化诊断'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#64748b' }}>AIfy 诊断</div>
          <div style={{ fontSize: 44, color: '#0f172a', marginTop: 16, lineHeight: 1.3 }}>
            "{desc}"
          </div>
        </div>

        <div style={{ display: 'flex', gap: 48, fontSize: 80, alignItems: 'center' }}>
          <span>🟢 {tally.green}</span>
          <span>🟡 {tally.yellow}</span>
          <span>⚪ {tally.gray}</span>
        </div>

        <div style={{ fontSize: 24, color: '#94a3b8' }}>aify · /r/{slug}</div>
      </div>
    ),
    size,
  )
}
