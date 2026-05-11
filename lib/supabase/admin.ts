import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Admin client = service role key. RLS 关闭，安全靠 API 层 ownership 检查。
// 永远不要在 client 组件里 import 这个文件。
// 共享 BeProfitly 项目，AIfy 只用 `aify` schema。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'aify' },
    },
  )
}
