import { TIERS, TIER_BORDER, TIER_BG } from '@/lib/copy/tiers'
import type { Workflow, Diagnosis } from '@/types'

type Props = {
  workflow: Workflow
  diagnosis: Diagnosis
}

export function NodeDetailsList({ workflow, diagnosis }: Props) {
  return (
    <ul className="mt-8 space-y-3">
      {workflow.nodes.map((n) => {
        const v = diagnosis[n.id]
        if (!v) return null
        const tier = TIERS[v.tier]
        return (
          <li
            key={n.id}
            className={`${TIER_BORDER[v.tier]} ${TIER_BG[v.tier]} border-l-4 rounded-md p-4`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-medium text-slate-900">{n.label}</div>
              <div className="text-sm whitespace-nowrap">
                <span className="mr-1">{tier.emoji}</span>
                <span className="font-medium">{tier.label}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-700">{v.reason}</p>
            <div className="mt-2 text-xs text-slate-500">
              {v.tool !== '—' && (
                <>
                  <span className="font-medium">工具：</span>
                  <span>{v.tool}</span>
                  <span className="mx-2">·</span>
                </>
              )}
              <span>{v.how}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
