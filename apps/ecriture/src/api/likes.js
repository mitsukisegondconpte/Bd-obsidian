import { supabase } from '../lib/supabaseClient'

export async function countWorkLikes(workId) {
  const { count, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'work')
    .eq('target_id', workId)
  if (error) throw error
  return count ?? 0
}

export async function hasLikedWork(userId, workId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'work')
    .eq('target_id', workId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function likeWork(userId, workId) {
  const { error } = await supabase.from('likes').insert({ user_id: userId, target_type: 'work', target_id: workId })
  if (error) throw error
}

export async function unlikeWork(userId, workId) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('target_type', 'work')
    .eq('target_id', workId)
  if (error) throw error
}
