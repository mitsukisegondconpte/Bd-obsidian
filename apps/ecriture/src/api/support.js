import { supabase } from '../lib/supabaseClient'

export async function createSupportReport({ reporterId, category, description }) {
  const { data, error } = await supabase
    .from('support_reports')
    .insert({ reporter_id: reporterId, category, description: description.trim() })
    .select('id')
    .single()
  if (error) throw error
  return data
}
