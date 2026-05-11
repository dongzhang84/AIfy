# AIfy

Personal Workflow AI-ification Diagnostic — 看清你的工作流，AI 替你做 / 帮你做 / 你必须自己做。

## Docs

- [Product Spec](./docs/product-spec.md) — what it is, who it's for, design rules
- [Implementation Guide](./docs/implementation-guide.md) — phase-by-phase build instructions

## Status

Scaffolded — 2026-05-08. Code wired end-to-end; needs Supabase + OpenAI keys to run.

## Quickstart

AIfy 与 BeProfitly 共享同一个 Supabase project，靠独立 schema (`aify`) 隔离。

```bash
# 1. 装依赖
npm install

# 2. 在 Supabase Dashboard → SQL Editor 跑迁移
#    把 supabase/migrations/0001_init.sql 粘进去执行（会建 schema `aify` + reports 表）

# 3. 把 `aify` schema 暴露给 PostgREST
#    Dashboard → Settings → API → Data API → Exposed schemas：加上 `aify`

# 4. 配 Auth（已和 BeProfitly 共用，多半不用改）
#    Authentication → Providers：关 Email Confirmation；开 Google OAuth
#    URL Configuration → Redirect URLs 加上 http://localhost:3000/auth/callback

# 5. .env.local 已填好（共享 BeProfitly 的 keys）

# 6. （可选）生成 DB types
npm run db:types

# 7. 起 dev
npm run dev
```

## Architecture

- **Stack**: Next.js 16 App Router · TypeScript · Tailwind v4 · Supabase (Auth + Postgres) · React Flow · OpenAI gpt-4o-mini · Vercel
- **核心规则**：见 [Implementation Guide §Golden Rules](./docs/implementation-guide.md#-golden-rules)
  - Rule 1：tier 文案锁定在 `lib/copy/tiers.ts`
  - Rule 2：edit count ≤ 2 在 API 层强制（`app/api/reports/[id]/edit/route.ts`）
  - Rule 3：`/r/[slug]` SSR 无 auth
  - Rule 4：诊断必须给所有节点打颜色（`lib/ai/diagnose.ts` schema 强制）
- **目录**：`app/` 路由 · `components/` UI · `lib/` 业务（ai, supabase, copy, session）· `supabase/migrations/` SQL · `types/` 共享类型

## Links

- Upstream playbook: https://github.com/dongzhang84/indie-product-playbook
