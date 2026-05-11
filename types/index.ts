import type { Tier } from '@/lib/copy/tiers'

export type WorkflowNode = {
  id: string
  label: string
}

export type WorkflowEdge = {
  from: string
  to: string
}

export type Workflow = {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export type NodeVerdict = {
  tier: Tier
  reason: string
  tool: string
  how: string
}

export type Diagnosis = Record<string, NodeVerdict>

export type Report = {
  id: string
  owner_id: string | null
  session_id: string | null
  public_slug: string
  work_description: string
  workflow_json: Workflow | null
  diagnosis_json: Diagnosis | null
  edit_count: number
  created_at: string
  finalized_at: string | null
}
