import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { createAdminClient } from '@/lib/supabase/admin'
import { TierLegend } from '@/components/TierLegend'
import { NodeDetailsList } from '@/components/NodeDetailsList'
import { WorkflowEditor } from '@/components/WorkflowEditor'
import { countTiers } from '@/lib/tally'
import { firstSentence, truncate } from '@/lib/text'
import type { Workflow, Diagnosis } from '@/types'

type Props = { params: Promise<{ slug: string }> }

// Rule 3: SSR, 不要求 auth。任何人有链接就能看。
export default async function PublicReportPage({ params }: Props) {
  const { slug } = await params
  const db = createAdminClient()
  const { data: report } = await db
    .from('reports')
    .select('work_description, workflow_json, diagnosis_json, finalized_at')
    .eq('public_slug', slug)
    .single()

  if (!report || !report.diagnosis_json || !report.workflow_json) notFound()

  const workflow = report.workflow_json as Workflow
  const diagnosis = report.diagnosis_json as Diagnosis

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header>
        <p className="text-sm text-slate-500">来自一个匿名工作流的 AI 化诊断</p>
        <h1 className="mt-2 text-2xl font-semibold">"{firstSentence(report.work_description)}"</h1>
      </header>

      <TierLegend />
      <WorkflowEditor workflow={workflow} diagnosis={diagnosis} editable={false} />
      <NodeDetailsList workflow={workflow} diagnosis={diagnosis} />

      <section className="mt-16 border-t border-slate-200 pt-8">
        <h3 className="text-xl">想给自己也来一份？</h3>
        <Link
          href="/"
          className="mt-4 inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          AIfy 我的工作 →
        </Link>
      </section>
    </main>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = createAdminClient()
  const { data: report } = await db
    .from('reports')
    .select('work_description, diagnosis_json')
    .eq('public_slug', slug)
    .single()

  if (!report) {
    return { title: 'AIfy — 报告不存在' }
  }

  const tally = countTiers(report.diagnosis_json as Diagnosis | null)
  const desc = `🟢 ${tally.green} · 🟡 ${tally.yellow} · ⚪ ${tally.gray}`
  const title = `AI 化诊断：${truncate(report.work_description, 30)} | AIfy`

  return {
    title,
    description: desc,
    openGraph: { title, description: desc, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: desc },
  }
}
