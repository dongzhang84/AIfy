export function truncate(s: string | null | undefined, max: number): string {
  if (!s) return ''
  return s.length > max ? s.slice(0, max).trimEnd() + '…' : s
}

export function firstSentence(s: string): string {
  if (!s) return ''
  const m = s.match(/^[^。！？.!?\n]{1,80}[。！？.!?]?/)
  return (m?.[0] ?? s.slice(0, 80)).trim()
}
