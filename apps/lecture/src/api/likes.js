import { supabase } from '../lib/supabaseClient'

export async function countChapterLikes(chapterId) {
  const { count, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'chapter')
    .eq('target_id', chapterId)
  if (error) throw error
  return count ?? 0
}

export async function hasLikedChapter(userId, chapterId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'chapter')
    .eq('target_id', chapterId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function likeChapter(userId, chapterId) {
  const { error } = await supabase.from('likes').insert({ user_id: userId, target_type: 'chapter', target_id: chapterId })
  if (error) throw error
}

export async function unlikeChapter(userId, chapterId) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('target_type', 'chapter')
    .eq('target_id', chapterId)
  if (error) throw error
}
