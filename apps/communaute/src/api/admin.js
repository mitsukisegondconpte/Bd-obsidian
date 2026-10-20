import { supabase } from '../lib/supabaseClient'

export async function listAllProfiles({ search = '' } = {}) {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (search.trim()) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function setProfileFlags(targetUserId, flags) {
  const { data, error } = await supabase.rpc('admin_set_profile_flags', {
    target_user_id: targetUserId,
    new_is_author: flags.isAuthor ?? null,
    new_is_editor: flags.isEditor ?? null,
    new_is_platform_admin: flags.isPlatformAdmin ?? null,
    new_is_suspended: flags.isSuspended ?? null,
  })
  if (error) throw error
  return data
}

export async function deleteCommunityAdmin(communityId) {
  const { error } = await supabase.from('communities').delete().eq('id', communityId)
  if (error) throw error
}

export async function deleteChannelAdmin(channelId) {
  const { error } = await supabase.from('channels').delete().eq('id', channelId)
  if (error) throw error
}

export async function getDashboardStats() {
  const [profiles, channels, communities, unresolvedCommunityReports, unresolvedChannelReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('channels').select('id', { count: 'exact', head: true }),
    supabase.from('communities').select('id', { count: 'exact', head: true }),
    supabase.from('community_reports').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    supabase.from('channel_reports').select('id', { count: 'exact', head: true }).is('resolved_at', null),
  ])
  if (profiles.error) throw profiles.error
  if (channels.error) throw channels.error
  if (communities.error) throw communities.error
  if (unresolvedCommunityReports.error) throw unresolvedCommunityReports.error
  if (unresolvedChannelReports.error) throw unresolvedChannelReports.error

  return {
    totalProfiles: profiles.count ?? 0,
    totalChannels: channels.count ?? 0,
    totalCommunities: communities.count ?? 0,
    unresolvedReports: (unresolvedCommunityReports.count ?? 0) + (unresolvedChannelReports.count ?? 0),
  }
}
