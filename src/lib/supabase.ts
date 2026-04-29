import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type GlossaryItem = {
  id: string
  correct_term: string
  category: '人名' | '品牌' | '術語' | '口頭禪' | '其他'
  scope: string
  notes: string | null
  created_by: string | null
  created_at: string
}

let _client: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    _client = createClient(url, key)
  }
  return _client
}

// 向下相容
export const supabase = {
  from: (table: string) => getSupabase().from(table),
  auth: {
    signInWithOtp: (opts: any) => getSupabase().auth.signInWithOtp(opts),
  }
}
