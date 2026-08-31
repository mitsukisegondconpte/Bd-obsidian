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

export async function createChannel({ ownerId, name, description }) {
  const { data, error } = await supabase.from('channels').insert({ owner_id: ownerId, name, description }).select().single()
  if (error) throw error
  return data
}

export async function createChannelPost({ channelId, body }) {
  const { data, error } = await supabase.from('channel_posts').insert({ channel_id: channelId, body }).select().single()
  if (error) throw error
  return data
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
