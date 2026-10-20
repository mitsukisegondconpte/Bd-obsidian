import { supabase } from '../lib/supabaseClient'

const LIST_WITH_ITEMS =
  '*, reading_list_items(work_id, added_at, work:works(id, title, work_type, author:profiles!works_author_id_fkey(username, display_name), cover:platform_images(image_url)))'

export async function listMyReadingLists(ownerId) {
  const { data, error } = await supabase
    .from('reading_lists')
    .select(LIST_WITH_ITEMS)
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

export async function deleteReadingList(listId) {
  const { error } = await supabase.from('reading_lists').delete().eq('id', listId)
  if (error) throw error
}

export async function addWorkToList({ listId, workId }) {
  const { error } = await supabase.from('reading_list_items').insert({ list_id: listId, work_id: workId })
  if (error) throw error
}

export async function removeWorkFromList({ listId, workId }) {
  const { error } = await supabase.from('reading_list_items').delete().eq('list_id', listId).eq('work_id', workId)
  if (error) throw error
}
