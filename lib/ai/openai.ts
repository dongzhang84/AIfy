import 'server-only'
import OpenAI from 'openai'

let cached: OpenAI | null = null

export function openai() {
  if (!cached) cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return cached
}

export const MODEL = 'gpt-4o-mini'
