import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes — voir .env.example à la racine du repo.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
