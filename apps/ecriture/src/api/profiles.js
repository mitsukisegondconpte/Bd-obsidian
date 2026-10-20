import { supabase } from '../lib/supabaseClient'

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function getProfileByUsername(username) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (error) throw error
  return data
}

export async function updateProfile({ userId, displayName, bio, avatarUrl }) {
  const updates = { display_name: displayName, bio }
  if (avatarUrl !== undefined) updates.avatar_url = avatarUrl
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function uploadAvatar({ userId, file }) {
  const path = `${userId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
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
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, target_type: 'author', target_id: authorId })
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

// Vitrine cross-plateforme : le même profil (même base Supabase) peut aussi
// avoir publié des séries BD, créé des communautés ou posséder des canaux
// sur les 2 autres apps Hypercube — on les affiche ici aussi.
export async function getCrossPlatformContent(userId) {
  const [seriesRes, communitiesRes, channelsRes] = await Promise.all([
    supabase.from('series').select('id, title, slug').eq('author_id', userId),
    supabase.from('communities').select('id, name').eq('creator_id', userId),
    supabase.from('channels').select('id, name').eq('owner_id', userId),
  ])
  if (seriesRes.error) throw seriesRes.error
  if (communitiesRes.error) throw communitiesRes.error
  if (channelsRes.error) throw channelsRes.error
  return { series: seriesRes.data, communities: communitiesRes.data, channels: channelsRes.data }
}
