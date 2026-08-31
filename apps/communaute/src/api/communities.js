import { supabase } from '../lib/supabaseClient'

export async function listCommunities() {
  const { data, error } = await supabase
    .from('communities')
    .select('*, creator:profiles!communities_creator_id_fkey(username, display_name, avatar_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCommunity(communityId) {
  const { data, error } = await supabase
    .from('communities')
    .select('*, creator:profiles!communities_creator_id_fkey(id, username, display_name, avatar_url)')
    .eq('id', communityId)
    .single()
  if (error) throw error
  return data
}

const COMMUNITY_POST_SELECT =
  '*, author:profiles!community_posts_author_id_fkey(username, display_name, avatar_url), ' +
  'reply_to:community_posts!community_posts_reply_to_id_fkey(id, body, author:profiles!community_posts_author_id_fkey(display_name)), ' +
  'shared_from:channel_posts!community_posts_shared_from_channel_post_id_fkey(id, body, media_url, channel:channels(id, name))'

export async function listCommunityPosts(communityId) {
  const { data, error } = await supabase
    .from('community_posts')
    .select(COMMUNITY_POST_SELECT)
    .eq('community_id', communityId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function listCommunityMembers(communityId) {
  const { data, error } = await supabase
    .from('community_members')
    .select('user:profiles(id, username, display_name, avatar_url)')
    .eq('community_id', communityId)
  if (error) throw error
  return data.map((row) => row.user)
}

export async function createCommunity({ creatorId, name, description, relatedSeriesId, relatedWorkId }) {
  const { data, error } = await supabase
    .from('communities')
    .insert({ creator_id: creatorId, name, description, related_series_id: relatedSeriesId, related_work_id: relatedWorkId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createCommunityPost({ communityId, authorId, body, replyToId, sharedFromChannelPostId }) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      community_id: communityId,
      author_id: authorId,
      body,
      reply_to_id: replyToId ?? null,
      shared_from_channel_post_id: sharedFromChannelPostId ?? null,
    })
    .select(COMMUNITY_POST_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function countCommunityMembers(communityId) {
  const { count, error } = await supabase
    .from('community_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('community_id', communityId)
  if (error) throw error
  return count ?? 0
}

export async function isCommunityMember(userId, communityId) {
  const { data, error } = await supabase
    .from('community_members')
    .select('user_id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function joinCommunity(userId, communityId) {
  const { error } = await supabase.from('community_members').insert({ user_id: userId, community_id: communityId })
  if (error) throw error
}

export async function leaveCommunity(userId, communityId) {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('user_id', userId)
    .eq('community_id', communityId)
  if (error) throw error
}

export async function reportCommunity({ communityId, reporterId, reason }) {
  const { error } = await supabase.from('community_reports').insert({ community_id: communityId, reporter_id: reporterId, reason })
  if (error) throw error
}

export async function listReports({ includeResolved = false } = {}) {
  let query = supabase
    .from('community_reports')
    .select('*, community:communities(id, name, is_validated), reporter:profiles(username, display_name)')
    .order('created_at', { ascending: false })
  if (!includeResolved) query = query.is('resolved_at', null)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function resolveReport(reportId) {
  const { error } = await supabase
    .from('community_reports')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw error
}

export async function listMyCommunities(userId) {
  const { data, error } = await supabase
    .from('community_members')
    .select('community:communities(*)')
    .eq('user_id', userId)
  if (error) throw error
  return data.map((row) => row.community)
}
