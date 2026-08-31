import { supabase } from '../lib/supabaseClient'

export async function listComments(targetId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles(username, display_name, avatar_url)')
    .eq('target_type', 'work_chapter')
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createComment({ userId, targetId, body }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, target_type: 'work_chapter', target_id: targetId, body })
    .select('*, user:profiles(username, display_name, avatar_url)')
    .single()
  if (error) throw error
  return data
}
