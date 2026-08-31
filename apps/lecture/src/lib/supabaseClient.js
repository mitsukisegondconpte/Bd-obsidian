import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes — voir .env.example à la racine du repo. ' +
      'Sur Vercel : Project Settings → Environment Variables.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.invalid',
  supabaseKey || 'placeholder-key',
)
