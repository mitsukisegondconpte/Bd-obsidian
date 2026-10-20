import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cette app dépend entièrement de Supabase (pas de données mockées ici).
// Sans ces variables, createClient() plante immédiatement et fait planter
// tout le rendu React (écran noir, sans message) — on l'expose donc comme un
// drapeau que main.jsx vérifie avant de monter l'app, avec un écran clair
// plutôt qu'un crash silencieux.
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
