import { supabase } from '../lib/supabaseClient'

export async function getProfileByUsername(username) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (error) throw error
  return data
}

export async function countFollowers(userId) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'author')
    .eq('target_id', userId)
  if (error) throw error
  return count ?? 0
}

export async function isFollowingAuthor(followerId, authorId) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('target_type', 'author')
    .eq('target_id', authorId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function followAuthor(followerId, authorId) {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, target_type: 'author', target_id: authorId })
  if (error) throw error
}

export async function unfollowAuthor(followerId, authorId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('target_type', 'author')
    .eq('target_id', authorId)
  if (error) throw error
}

// Vitrine cross-plateforme : un même profil (même base Supabase) peut avoir
// publié des séries BD (plateforme 1), des oeuvres écrites (plateforme 2),
// et posséder des canaux ici — on les affiche ensemble sur une seule page.
export async function getCrossPlatformWorks(userId) {
  const [seriesRes, worksRes] = await Promise.all([
    supabase.from('series').select('id, title, slug, cover_url').eq('author_id', userId),
    supabase.from('works').select('id, title, work_type').eq('author_id', userId),
  ])
  if (seriesRes.error) throw seriesRes.error
  if (worksRes.error) throw worksRes.error
  return { series: seriesRes.data, works: worksRes.data }
}

// Pour le sélecteur "lier à mon oeuvre" lors de la création d'une communauté.
export async function listMyPublishedContent(userId) {
  const [seriesRes, worksRes] = await Promise.all([
    supabase.from('series').select('id, title').eq('author_id', userId),
    supabase.from('works').select('id, title').eq('author_id', userId),
  ])
  if (seriesRes.error) throw seriesRes.error
  if (worksRes.error) throw worksRes.error
  return { series: seriesRes.data, works: worksRes.data }
}
