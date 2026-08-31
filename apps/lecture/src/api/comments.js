import { supabase } from '../lib/supabaseClient'

export async function listComments(chapterId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles(username, display_name, avatar_url)')
    .eq('target_type', 'chapter')
    .eq('target_id', chapterId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createComment({ userId, chapterId, body }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, target_type: 'chapter', target_id: chapterId, body })
    .select('*, user:profiles(username, display_name, avatar_url)')
    .single()
  if (error) throw error
  return data
}
