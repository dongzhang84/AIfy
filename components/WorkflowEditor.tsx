'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TIERS, TIER_BORDER, TIER_BG, type Tier } from '@/lib/copy/tiers'
import type { Workflow, Diagnosis } from '@/types'

type Props = {
  workflow: Workflow
  editable?: boolean
  diagnosis?: Diagnosis | null
  editsRemaining?: number
  onSave?: (workflow: Workflow) => Promise<void> | void
  saving?: boolean
}

type FlowNode = Node<{ label: string; tier?: Tier }>
type FlowEdge = Edge

// 简单 top-to-bottom 自动布局（implementation guide §5.1 + §常见坑）
function layout(nodes: Workflow['nodes']): FlowNode[] {
  return nodes.map((n, i) => ({
    id: n.id,
    data: { label: n.label },
    position: { x: 0, y: i * 90 },
    type: 'default',
  }))
}

function toFlowEdges(edges: Workflow['edges']): FlowEdge[] {
  return edges.map((e, i) => ({ id: `e-${i}-${e.from}-${e.to}`, source: e.from, target: e.to }))
}

export function WorkflowEditor({
  workflow,
  editable = false,
  diagnosis,
  editsRemaining = 0,
  onSave,
  saving = false,
}: Props) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => layout(workflow.nodes))
  const [edges, setEdges] = useState<FlowEdge[]>(() => toFlowEdges(workflow.edges))
  const [pending, setPending] = useState(false)

  // 上游 workflow / diagnosis 变更时同步（如保存后从 server 拿回）
  useEffect(() => {
    setNodes((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]))
      return workflow.nodes.map((n, i) => {
        const prevNode = byId.get(n.id)
        return {
          id: n.id,
          data: { label: n.label, tier: diagnosis?.[n.id]?.tier },
          position: prevNode?.position ?? { x: 0, y: i * 90 },
          type: 'default',
        }
      })
    })
    setEdges(toFlowEdges(workflow.edges))
    setPending(false)
  }, [workflow, diagnosis])

  const styledNodes = useMemo<FlowNode[]>(
    () =>
      nodes.map((n) => {
        const tier = diagnosis?.[n.id]?.tier
        const border = tier ? TIER_BORDER[tier] : 'border-slate-300'
        const bg = tier ? TIER_BG[tier] : 'bg-white'
        return {
          ...n,
          data: { ...n.data, tier },
          className: `${border} ${bg} border-2 rounded-md px-3 py-2 text-sm font-medium`,
          style: { padding: 0 },
        }
      }),
    [nodes, diagnosis],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!editable) return
      setNodes((ns) => applyNodeChanges(changes, ns) as FlowNode[])
      // remove / add 算编辑；纯位置拖动不算
      if (changes.some((c) => c.type === 'remove' || c.type === 'add')) setPending(true)
    },
    [editable],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!editable) return
      setEdges((es) => applyEdgeChanges(changes, es))
      if (changes.some((c) => c.type === 'remove' || c.type === 'add')) setPending(true)
    },
    [editable],
  )

  async function handleSave() {
    if (!onSave) return
    const out: Workflow = {
      nodes: nodes.map((n) => ({ id: n.id, label: n.data.label })),
      edges: edges.map((e) => ({ from: String(e.source), to: String(e.target) })),
    }
    await onSave(out)
    setPending(false)
  }

  return (
    <div>
      <div className="h-[520px] border border-slate-200 rounded-md bg-slate-50">
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={editable}
          nodesConnectable={editable}
          edgesFocusable={editable}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {editable && (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-slate-500">
            还能改 {editsRemaining} 次（拖位置不算）
          </span>
          <button
            disabled={!pending || editsRemaining === 0 || saving}
            onClick={handleSave}
            className="text-sm bg-black text-white px-4 py-2 rounded disabled:opacity-40"
          >
            {saving ? '保存中…' : '保存修改'}
          </button>
        </div>
      )}

      {diagnosis && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          {Object.entries(TIERS).map(([key, t]) => (
            <span key={key} className="flex items-center gap-1">
              <span>{t.emoji}</span>
              <span className="font-medium text-slate-700">{t.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
