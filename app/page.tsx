import Link from 'next/link'
import { TIERS } from '@/lib/copy/tiers'

export default function Landing() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold leading-tight">
        看清你的工作流，
        <br />
        AI 帮你做哪些 / 你必须做哪些
      </h1>
      <p className="mt-6 text-lg text-slate-600">
        3-5 句话描述你平时怎么工作。我们画出流程图，告诉你哪些可以 AI 化、哪些必须自己做。
      </p>

      <Link
        href="/reports/new"
        className="mt-10 inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
      >
        开始诊断 →
      </Link>

      <ul className="mt-12 space-y-2 text-sm text-slate-500">
        {Object.entries(TIERS).map(([key, t]) => (
          <li key={key} className="flex items-baseline gap-2">
            <span>{t.emoji}</span>
            <span className="font-medium text-slate-700">{t.label}</span>
            <span>— {t.short}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
