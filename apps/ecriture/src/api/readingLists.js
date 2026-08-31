import { supabase } from '../lib/supabaseClient'

export async function listMyReadingLists(ownerId) {
  const { data, error } = await supabase
    .from('reading_lists')
    .select('*, reading_list_items(work_id)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createReadingList({ ownerId, name }) {
  const { data, error } = await supabase.from('reading_lists').insert({ owner_id: ownerId, name }).select().single()
  if (error) throw error
  return data
}

export async function addWorkToList({ listId, workId }) {
  const { error } = await supabase.from('reading_list_items').insert({ list_id: listId, work_id: workId })
  if (error) throw error
}
