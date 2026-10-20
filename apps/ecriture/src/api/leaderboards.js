import { supabase } from '../lib/supabaseClient'

export async function topWorksWeekly(limit = 10) {
  const { data, error } = await supabase.rpc('top_works_weekly', { p_limit: limit })
  if (error) throw error
  return data
}

export async function topAuthorsWeekly(limit = 10) {
  const { data, error } = await supabase.rpc('top_authors_weekly', { p_limit: limit })
  if (error) throw error
  return data
}
