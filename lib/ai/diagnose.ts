import 'server-only'
import { openai, MODEL } from './openai'
import { loadPrompt } from './loadPrompt'
import type { Workflow, Diagnosis, NodeVerdict } from '@/types'

// Rule 4：每个 node 都必须有判定，不允许 unknown 档。
function buildSchema(nodeIds: string[]) {
  const verdict = {
    type: 'object',
    required: ['tier', 'reason', 'tool', 'how'],
    additionalProperties: false,
    properties: {
      tier: { type: 'string', enum: ['green', 'yellow', 'gray'] },
      reason: { type: 'string', maxLength: 80 },
      tool: { type: 'string', maxLength: 40 },
      how: { type: 'string', maxLength: 120 },
    },
  } as const

  return {
    type: 'object',
    required: nodeIds,
    additionalProperties: false,
    properties: Object.fromEntries(nodeIds.map((id) => [id, verdict])),
  }
}

export async function generateDiagnosis(
  workDescription: string,
  workflow: Workflow,
): Promise<Diagnosis> {
  const tmpl = await loadPrompt('diagnose.md')
  const prompt = tmpl
    .replace('{{work_description}}', workDescription)
    .replace('{{workflow_json}}', JSON.stringify(workflow, null, 2))

  const nodeIds = workflow.nodes.map((n) => n.id)
  const schema = buildSchema(nodeIds)

  const res = await openai().chat.completions.create({
    model: MODEL,
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'diagnosis', strict: true, schema },
    },
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = res.choices[0]?.message?.content
  if (!raw) throw new Error('Empty diagnosis response')
  const parsed = JSON.parse(raw) as Record<string, NodeVerdict>

  // Rule 4 enforcement: 验证所有 node 都拿到判定
  for (const id of nodeIds) {
    if (!parsed[id]) throw new Error(`Diagnosis missing node ${id}`)
  }
  return parsed
}
