import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kbtfplhkbdsjyuxmsfmq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TDulvTE6V_d02hJpuFv9hQ_aJN46Tlx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)