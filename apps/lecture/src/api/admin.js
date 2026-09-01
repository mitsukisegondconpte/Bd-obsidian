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
    new_is_lecture_author: flags.isLectureAuthor ?? null,
  })
  if (error) throw error
  return data
}

export async function deleteSeriesAdmin(seriesId) {
  const { error } = await supabase.from('series').delete().eq('id', seriesId)
  if (error) throw error
}

export async function deleteChapterAdmin(chapterId) {
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId)
  if (error) throw error
}

export async function createGenre(name) {
  const { error } = await supabase.from('genres').insert({ name })
  if (error) throw error
}

export async function deleteGenre(name) {
  const { error } = await supabase.from('genres').delete().eq('name', name)
  if (error) throw error
}

export async function listSeriesReports({ includeResolved = false } = {}) {
  let query = supabase
    .from('series_reports')
    .select('*, series:series(id, slug, title), reporter:profiles(username, display_name)')
    .order('created_at', { ascending: false })
  if (!includeResolved) query = query.is('resolved_at', null)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function resolveSeriesReport(reportId) {
  const { error } = await supabase
    .from('series_reports')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw error
}

export async function getDashboardStats() {
  const [profiles, series, chapters, purchases, unresolvedReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('series').select('id, views', { count: 'exact' }),
    supabase.from('chapters').select('id', { count: 'exact', head: true }),
    supabase.from('chapter_purchases').select('amount_cents').eq('status', 'completed'),
    supabase.from('series_reports').select('id', { count: 'exact', head: true }).is('resolved_at', null),
  ])
  if (profiles.error) throw profiles.error
  if (series.error) throw series.error
  if (chapters.error) throw chapters.error
  if (purchases.error) throw purchases.error
  if (unresolvedReports.error) throw unresolvedReports.error

  const totalViews = (series.data ?? []).reduce((sum, s) => sum + (s.views ?? 0), 0)
  const totalRevenueCents = (purchases.data ?? []).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0)

  return {
    totalProfiles: profiles.count ?? 0,
    totalSeries: series.count ?? 0,
    totalChapters: chapters.count ?? 0,
    totalViews,
    totalRevenueCents,
    unresolvedReports: unresolvedReports.count ?? 0,
  }
}
