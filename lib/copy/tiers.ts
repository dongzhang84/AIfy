// Rule 1: 三档措辞固定。所有 user-facing tier 文案从这里读，禁止散落到组件里。
// PR review 必查：组件里出现 "可以 AI 化 / 人机协作 / 保留人工" 之类的字面量 → 拒绝。

export const TIERS = {
  green: {
    label: 'AI 替你做',
    color: 'emerald',
    short: '你只需要 review 结果',
    emoji: '🟢',
  },
  yellow: {
    label: 'AI 帮你做',
    color: 'amber',
    short: '你定方向、AI 跑细节',
    emoji: '🟡',
  },
  gray: {
    label: '你必须自己做',
    color: 'zinc',
    short: '判断 / 关系 / 品味，不该外包',
    emoji: '⚪',
  },
} as const

export type Tier = keyof typeof TIERS

export const TIER_KEYS = ['green', 'yellow', 'gray'] as const satisfies readonly Tier[]

export function isTier(x: unknown): x is Tier {
  return x === 'green' || x === 'yellow' || x === 'gray'
}

// 给节点边框上色用的 Tailwind class — Tailwind v4 需要静态 class，不能字符串拼接
export const TIER_BORDER: Record<Tier, string> = {
  green: 'border-emerald-500',
  yellow: 'border-amber-500',
  gray: 'border-zinc-400',
}

export const TIER_BG: Record<Tier, string> = {
  green: 'bg-emerald-50',
  yellow: 'bg-amber-50',
  gray: 'bg-zinc-50',
}
