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

export async function listSupportReports() {
  const { data, error } = await supabase
    .from('support_reports')
    .select('id, category, description, created_at, reporter:profiles(username, display_name)')
    .is('resolved_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function resolveSupportReport(reportId) {
  const { error } = await supabase
    .from('support_reports')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', reportId)
    .select('id')
    .single()
  if (error) throw error
}
