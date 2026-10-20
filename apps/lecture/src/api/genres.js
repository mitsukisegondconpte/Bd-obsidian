import { supabase } from '../lib/supabaseClient'

export async function listGenres() {
  const { data, error } = await supabase.from('genres').select('name').order('name')
  if (error) throw error
  return data.map((g) => g.name)
}
