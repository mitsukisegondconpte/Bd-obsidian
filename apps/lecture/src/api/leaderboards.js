import { supabase } from '../lib/supabaseClient'

export async function topSeriesWeekly(limit = 10) {
  const { data, error } = await supabase.rpc('top_series_weekly', { p_limit: limit })
  if (error) throw error
  return data
}

export async function topAuthorsWeekly(limit = 10) {
  const { data, error } = await supabase.rpc('top_authors_weekly', { p_limit: limit })
  if (error) throw error
  return data
}
