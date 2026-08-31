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

export async function createComment({ userId, targetId, body, parentCommentId }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, target_type: 'work_chapter', target_id: targetId, body, parent_comment_id: parentCommentId ?? null })
    .select('*, user:profiles(username, display_name, avatar_url)')
    .single()
  if (error) throw error
  return data
}

export async function countCommentLikes(commentId) {
  const { count, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'comment')
    .eq('target_id', commentId)
  if (error) throw error
  return count ?? 0
}

export async function hasLikedComment(userId, commentId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'comment')
    .eq('target_id', commentId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function likeComment(userId, commentId) {
  const { error } = await supabase.from('likes').insert({ user_id: userId, target_type: 'comment', target_id: commentId })
  if (error) throw error
}

export async function unlikeComment(userId, commentId) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('target_type', 'comment')
    .eq('target_id', commentId)
  if (error) throw error
}
