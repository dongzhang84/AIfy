import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'
import type { Report } from '@/types'

// 已登录用户拥有 owner_id 匹配的报告；未登录用 session_id 匹配。
export async function verifyOwnership(report: Pick<Report, 'owner_id' | 'session_id'>) {
  if (report.owner_id) {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id === report.owner_id
  }
  if (report.session_id) {
    const sid = await getSessionId()
    return sid !== null && sid === report.session_id
  }
  return false
}
