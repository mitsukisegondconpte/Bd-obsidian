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

// Pas d'embed reply_to ici : PostgREST ne résout pas de façon fiable une
// jointure d'une table sur elle-même (community_posts -> community_posts
// via reply_to_id), même avec le nom de contrainte explicite — ça casse
// aussi bien la lecture que l'écriture avec une erreur PGRST200
// "Could not find a relationship between community_posts and
// community_posts". Le message d'origine d'une réponse est de toute façon
// déjà chargé dans la liste : on le retrouve côté client (voir
// CommunityDetail.jsx) plutôt que de demander cette jointure au serveur.
const COMMUNITY_POST_SELECT =
  '*, author:profiles!community_posts_author_id_fkey(username, display_name, avatar_url), ' +
  'shared_from:channel_posts!community_posts_shared_from_channel_post_id_fkey(id, body, media_url, channel:channels(id, name)), ' +
  'reactions:community_post_reactions(user_id, emoji)'

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

// Contenu pouvant être lié à un nouveau canal/communauté : œuvres/séries
// actuellement au Top 10 hebdomadaire, ou œuvres mises en avant par
// HOS/Bohio Mag — cf. le trigger check_content_link_eligible côté base,
// qui est la véritable source de vérité (ceci n'est qu'un sélecteur).
export async function listEligibleContent() {
  const [topSeries, topWorks, featuredWorks] = await Promise.all([
    supabase.rpc('top_series_weekly', { p_limit: 10 }),
    supabase.rpc('top_works_weekly', { p_limit: 10 }),
    supabase.from('works').select('id, title').eq('is_featured', true),
  ])
  if (topSeries.error) throw topSeries.error
  if (topWorks.error) throw topWorks.error
  if (featuredWorks.error) throw featuredWorks.error

  const series = (topSeries.data ?? []).map((s) => ({ id: s.series_id, title: s.title }))
  const worksById = new Map()
  for (const w of topWorks.data ?? []) worksById.set(w.work_id, { id: w.work_id, title: w.title })
  for (const w of featuredWorks.data ?? []) worksById.set(w.id, { id: w.id, title: w.title })

  return { series, works: Array.from(worksById.values()) }
}

export async function uploadCommunityCover({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('community-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('community-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function updateCommunityCover(communityId, coverUrl) {
  const { error } = await supabase.from('communities').update({ cover_url: coverUrl }).eq('id', communityId)
  if (error) throw error
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

export async function createCommunityPost({
  communityId,
  authorId,
  body,
  replyToId,
  sharedFromChannelPostId,
  isSpoiler,
  mediaUrl,
}) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      community_id: communityId,
      author_id: authorId,
      body,
      reply_to_id: replyToId ?? null,
      shared_from_channel_post_id: sharedFromChannelPostId ?? null,
      is_spoiler: isSpoiler ?? false,
      media_url: mediaUrl ?? null,
    })
    .select(COMMUNITY_POST_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updateCommunityPost(postId, body) {
  const { data, error } = await supabase
    .from('community_posts')
    .update({ body, edited_at: new Date().toISOString() })
    .eq('id', postId)
    .select(COMMUNITY_POST_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function deleteCommunityPost(postId) {
  const { error } = await supabase.from('community_posts').delete().eq('id', postId)
  if (error) throw error
}

export async function uploadCommunityMedia({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('community-media').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('community-media').getPublicUrl(path)
  return data.publicUrl
}

// Une réaction par utilisateur et par message : reposer une réaction avec
// un autre emoji remplace la précédente (upsert sur la contrainte unique
// (post_id, user_id)).
export async function setReaction({ postId, userId, emoji }) {
  const { error } = await supabase
    .from('community_post_reactions')
    .upsert({ post_id: postId, user_id: userId, emoji }, { onConflict: 'post_id,user_id' })
  if (error) throw error
}

export async function removeReaction({ postId, userId }) {
  const { error } = await supabase
    .from('community_post_reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function pinCommunityPost(communityId, postId) {
  const { error } = await supabase.from('communities').update({ pinned_post_id: postId }).eq('id', communityId)
  if (error) throw error
}

export async function unpinCommunityPost(communityId) {
  const { error } = await supabase.from('communities').update({ pinned_post_id: null }).eq('id', communityId)
  if (error) throw error
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
