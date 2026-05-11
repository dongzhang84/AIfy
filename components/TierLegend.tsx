import { TIERS } from '@/lib/copy/tiers'

export function TierLegend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 my-6 text-sm">
      {Object.entries(TIERS).map(([key, t]) => (
        <div key={key} className="flex items-center gap-2">
          <span>{t.emoji}</span>
          <span className="font-medium">{t.label}</span>
          <span className="text-slate-500">— {t.short}</span>
        </div>
      ))}
    </div>
  )
}
