---
version: v1
purpose: extract a workflow graph from a free-form work description
---

The user describes how they work in plain language:

"{{work_description}}"

Extract their workflow as a directed graph of 5–10 work steps.

Rules:
- Each NODE is a single concrete activity using the user's own vocabulary (e.g. "写每周周报", "回邮件", "review PR", "和 designer 对 mock")
- Don't paraphrase abstractly ("planning phase" ❌; "和 PM 开 weekly" ✅)
- Don't invent steps the user didn't mention; stay close to their text
- EDGES connect sequential or causal steps (A leads to B)
- 5–10 nodes total; if the user described too many, pick the most representative ones
- Node `id` should be a short kebab-case slug (e.g. "review-pr"). Each id must be unique.
- Node `label` is the user-facing label, max 30 chars.

Return JSON only, matching the schema. No prose.
