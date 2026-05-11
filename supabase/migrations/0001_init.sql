-- AIfy v0.1 schema
-- 共享 BeProfitly 的 Supabase project，但隔离在独立 schema `aify` 里。
-- 在 Supabase Dashboard → SQL Editor 跑这段。
-- 跑完后还要去 Dashboard → Settings → API → Exposed schemas 把 `aify` 加进去（PostgREST 默认只暴露 public）。
--
-- 所有表 RLS DISABLED — 安全靠 API 层 ownership 检查（参考 indie-product-playbook STANDARD §4.1）。

-- 1. schema
create schema if not exists aify;

-- 2. PostgREST + Supabase JS 访问授权
grant usage on schema aify to anon, authenticated, service_role;
alter default privileges in schema aify
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema aify
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema aify
  grant all on functions to anon, authenticated, service_role;

-- 3. tables
create table if not exists aify.reports (
  id uuid primary key default gen_random_uuid(),

  -- ownership
  owner_id uuid references auth.users(id) on delete cascade,
  session_id text,                                -- 登录前用 cookie 识别
  public_slug text unique not null
    default substring(md5(random()::text || clock_timestamp()::text) from 1 for 8),

  -- input
  work_description text not null check (char_length(work_description) >= 30),

  -- AI outputs (null until each stage completes)
  workflow_json jsonb,                            -- {nodes: [...], edges: [...]}
  diagnosis_json jsonb,                           -- {[node_id]: {tier, reason, tool, how}}

  -- edit tracking (Rule 2 — hard limit 2)
  edit_count int not null default 0
    check (edit_count >= 0 and edit_count <= 2),

  -- metadata
  created_at timestamptz default now(),
  finalized_at timestamptz                        -- 当 diagnosis_json 生成完
);

-- 显式给已建好的表授权（default privileges 只对未来的表生效）
grant all on aify.reports to anon, authenticated, service_role;

create index if not exists reports_owner_id_idx on aify.reports (owner_id);
create index if not exists reports_session_id_idx on aify.reports (session_id);
create index if not exists reports_public_slug_idx on aify.reports (public_slug);
