import 'server-only'
import { openai, MODEL } from './openai'
import { loadPrompt } from './loadPrompt'
import type { Workflow } from '@/types'

const SCHEMA = {
  type: 'object',
  required: ['nodes', 'edges'],
  additionalProperties: false,
  properties: {
    nodes: {
      type: 'array',
      minItems: 5,
      maxItems: 10,
      items: {
        type: 'object',
        required: ['id', 'label'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1, maxLength: 40 },
          label: { type: 'string', minLength: 1, maxLength: 30 },
        },
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['from', 'to'],
        additionalProperties: false,
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
        },
      },
    },
  },
} as const

export async function generateWorkflow(workDescription: string): Promise<Workflow> {
  const tmpl = await loadPrompt('workflow.md')
  const prompt = tmpl.replace('{{work_description}}', workDescription)

  const res = await openai().chat.completions.create({
    model: MODEL,
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'workflow', strict: true, schema: SCHEMA },
    },
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = res.choices[0]?.message?.content
  if (!raw) throw new Error('Empty workflow response')
  const parsed = JSON.parse(raw) as Workflow

  // sanity check: edges reference valid node ids
  const ids = new Set(parsed.nodes.map((n) => n.id))
  parsed.edges = parsed.edges.filter((e) => ids.has(e.from) && ids.has(e.to))
  return parsed
}
