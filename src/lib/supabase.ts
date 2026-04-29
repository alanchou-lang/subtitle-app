import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cljtdvfywockwarfnmkw.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type GlossaryItem = {
  id: string
  correct_term: string
  category: '人名' | '品牌' | '術語' | '口頭禪' | '其他'
  scope: string
  notes: string | null
  created_by: string | null
  created_at: string
}
