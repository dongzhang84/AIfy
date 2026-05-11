import type { Diagnosis } from '@/types'
import { isTier, type Tier } from '@/lib/copy/tiers'

export type Tally = Record<Tier, number>

export function countTiers(diagnosis: Diagnosis | null | undefined): Tally {
  const tally: Tally = { green: 0, yellow: 0, gray: 0 }
  if (!diagnosis) return tally
  for (const verdict of Object.values(diagnosis)) {
    if (verdict && isTier(verdict.tier)) tally[verdict.tier] += 1
  }
  return tally
}
