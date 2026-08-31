import { supabase } from '../lib/supabaseClient'

export async function listChannels() {
  const { data, error } = await supabase
    .from('channels')
    .select('*, owner:profiles!channels_owner_id_fkey(username, display_name, avatar_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getChannel(channelId) {
  const { data, error } = await supabase
    .from('channels')
    .select('*, owner:profiles!channels_owner_id_fkey(id, username, display_name, avatar_url)')
    .eq('id', channelId)
    .single()
  if (error) throw error
  return data
}

export async function listChannelPosts(channelId) {
  const { data, error } = await supabase
    .from('channel_posts')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createChannel({ ownerId, name, description, relatedSeriesId, relatedWorkId }) {
  const { data, error } = await supabase
    .from('channels')
    .insert({
      owner_id: ownerId,
      name,
      description,
      related_series_id: relatedSeriesId ?? null,
      related_work_id: relatedWorkId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createChannelPost({ channelId, body, mediaUrl }) {
  const { data, error } = await supabase
    .from('channel_posts')
    .insert({ channel_id: channelId, body, media_url: mediaUrl ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadChannelCover({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('community-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('community-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function updateChannelCover(channelId, coverUrl) {
  const { error } = await supabase.from('channels').update({ cover_url: coverUrl }).eq('id', channelId)
  if (error) throw error
}

export async function uploadChannelMedia({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('channel-media').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('channel-media').getPublicUrl(path)
  return data.publicUrl
}

export async function countChannelPostLikes(postId) {
  const { count, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'channel_post')
    .eq('target_id', postId)
  if (error) throw error
  return count ?? 0
}

export async function hasLikedChannelPost(userId, postId) {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'channel_post')
    .eq('target_id', postId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function likeChannelPost(userId, postId) {
  const { error } = await supabase.from('likes').insert({ user_id: userId, target_type: 'channel_post', target_id: postId })
  if (error) throw error
}

export async function unlikeChannelPost(userId, postId) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('target_type', 'channel_post')
    .eq('target_id', postId)
  if (error) throw error
}

export async function listMyChannels(ownerId) {
  const { data, error } = await supabase.from('channels').select('*').eq('owner_id', ownerId)
  if (error) throw error
  return data
}

export async function countChannelSubscribers(channelId) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'channel')
    .eq('target_id', channelId)
  if (error) throw error
  return count ?? 0
}

export async function isSubscribedToChannel(userId, channelId) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId)
    .eq('target_type', 'channel')
    .eq('target_id', channelId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function subscribeToChannel(userId, channelId) {
  const { error } = await supabase.from('follows').insert({ follower_id: userId, target_type: 'channel', target_id: channelId })
  if (error) throw error
}

export async function unsubscribeFromChannel(userId, channelId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('target_type', 'channel')
    .eq('target_id', channelId)
  if (error) throw error
}

export async function reportChannel({ channelId, reporterId, reason }) {
  const { error } = await supabase.from('channel_reports').insert({ channel_id: channelId, reporter_id: reporterId, reason })
  if (error) throw error
}

export async function listChannelReports({ includeResolved = false } = {}) {
  let query = supabase
    .from('channel_reports')
    .select('*, channel:channels(id, name), reporter:profiles(username, display_name)')
    .order('created_at', { ascending: false })
  if (!includeResolved) query = query.is('resolved_at', null)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function resolveChannelReport(reportId) {
  const { error } = await supabase
    .from('channel_reports')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw error
}
