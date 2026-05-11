import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'

const PROMPTS_DIR = path.join(process.cwd(), 'lib', 'ai', 'prompts')

const cache = new Map<string, string>()

export async function loadPrompt(name: string): Promise<string> {
  const cached = cache.get(name)
  if (cached) return cached
  const raw = await fs.readFile(path.join(PROMPTS_DIR, name), 'utf8')
  cache.set(name, raw)
  return raw
}
