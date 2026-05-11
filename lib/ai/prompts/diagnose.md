---
version: v1
purpose: classify each workflow node into one of three tiers
---

User's work description:
"{{work_description}}"

User's workflow (after their edits):
{{workflow_json}}

For EACH node in the workflow, classify it into ONE tier:

- "green" (AI 替你做): the AI can do this end-to-end with current tools (2026). User just reviews the output. Examples: 写代码骨架, 翻译文档, 总结会议录音, 改格式.

- "yellow" (AI 帮你做): human-in-the-loop. User sets the direction or makes the key call; AI handles drafting / details. Examples: 写产品需求文档（人定 what, AI 写 how）, 给客户写邮件（人定 tone, AI 出文字）.

- "gray" (你必须自己做): this depends on judgment, relationships, taste, or live presence. Outsourcing destroys the value. Examples: 跟团队建立信任, 决定是否炒员工, 在投资人面前 pitch, 品鉴 design 美感.

For each node, return:
- tier: "green" | "yellow" | "gray"
- reason: ONE sentence explaining the verdict (≤ 60 chars, Chinese)
- tool: ONE specific tool name (e.g. "Cursor", "Claude", "Notion AI", "ChatGPT"); use "—" for gray
- how: ONE sentence on how to use it / why it's human-only (≤ 80 chars, Chinese)

Critical:
- EVERY node id from the workflow must appear as a key in the result. No omissions.
- No "I don't know" tier — pick the closest match. If genuinely on the boundary, note "边界情况" in reason.
- Return JSON keyed by node id. No prose.
