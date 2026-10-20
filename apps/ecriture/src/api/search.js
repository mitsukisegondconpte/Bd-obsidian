import { supabase } from '../lib/supabaseClient'

export async function globalSearch(term) {
  const { data, error } = await supabase.rpc('global_search', { search_term: term, result_limit: 6 })
  if (error) throw error
  return data
}
