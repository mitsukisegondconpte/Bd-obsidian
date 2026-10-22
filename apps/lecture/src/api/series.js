import { supabase } from '../lib/supabaseClient'

const SERIES_SELECT =
  '*, author:profiles!series_author_id_fkey(id, username, display_name, avatar_url), series_genres(genre:genres(name))'

function flattenGenres(row) {
  return { ...row, genres: row.series_genres?.map((sg) => sg.genre.name) ?? [] }
}

function withComputedBadges(rows) {
  const sorted = [...rows].sort((a, b) => b.views - a.views)
  const hotIds = new Set(sorted.slice(0, 3).map((s) => s.id))
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

  return rows.map((s) => ({
    ...s,
    isHot: hotIds.has(s.id),
    isNew: new Date(s.created_at).getTime() > twoWeeksAgo,
  }))
}

export async function listSeries() {
  const { data, error } = await supabase
    .from('series')
    .select(SERIES_SELECT)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return withComputedBadges((data ?? []).map(flattenGenres))
}

export async function getSeriesBySlug(slug) {
  const { data, error } = await supabase
    .from('series')
    .select(SERIES_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) throw error
  return flattenGenres(data)
}

export async function listSeriesByAuthor(authorId) {
  const { data, error } = await supabase
    .from('series')
    .select(SERIES_SELECT)
    .eq('author_id', authorId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return withComputedBadges((data ?? []).map(flattenGenres))
}

export async function listAuthorSeries(authorId) {
  const { data, error } = await supabase
    .from('series')
    .select(SERIES_SELECT)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return withComputedBadges((data ?? []).map(flattenGenres))
}

export async function getAuthorSeriesBySlug(authorId, slug) {
  const { data, error } = await supabase
    .from('series')
    .select(SERIES_SELECT)
    .eq('author_id', authorId)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return flattenGenres(data)
}

export async function listSeriesChapters(seriesId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*, series:series!chapters_series_id_fkey(id, is_published)')
    .eq('series_id', seriesId)
    .not('published_at', 'is', null)
    .order('number', { ascending: true })
  if (error) throw error
  return (data ?? []).filter((chapter) => chapter.series?.is_published === true)
}

export async function listAuthorSeriesChapters(seriesId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', seriesId)
    .order('number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getChapter(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*, series:series!chapters_series_id_fkey(id, is_published)')
    .eq('id', chapterId)
    .not('published_at', 'is', null)
    .single()
  if (error) throw error
  if (data.series?.is_published !== true) throw new Error('Chapitre introuvable.')
  return data
}

export async function listChapterPages(chapterId) {
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*, series:series!chapters_series_id_fkey(id, is_published)')
    .eq('id', chapterId)
    .not('published_at', 'is', null)
    .maybeSingle()
  if (chapterError) throw chapterError
  if (!chapter || chapter.series?.is_published !== true) return []

  const { data, error } = await supabase
    .from('chapter_pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listAuthorChapterPages(chapterId) {
  const { data, error } = await supabase
    .from('chapter_pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function incrementSeriesViews(seriesId) {
  await supabase.rpc('increment_series_views', { p_series_id: seriesId })
}

export async function countSeriesSubscribers(seriesId) {
  const { count, error } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', 'series')
    .eq('target_id', seriesId)
  if (error) throw error
  return count ?? 0
}

export async function isFollowingSeries(userId, seriesId) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId)
    .eq('target_type', 'series')
    .eq('target_id', seriesId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function followSeries(userId, seriesId) {
  const { error } = await supabase.from('follows').insert({ follower_id: userId, target_type: 'series', target_id: seriesId })
  if (error) throw error
}

export async function unfollowSeries(userId, seriesId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', userId)
    .eq('target_type', 'series')
    .eq('target_id', seriesId)
  if (error) throw error
}

export async function reportSeries({ seriesId, reporterId, reason }) {
  const { error } = await supabase.from('series_reports').insert({ series_id: seriesId, reporter_id: reporterId, reason })
  if (error) throw error
}

export async function uploadSeriesCover({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('series-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('series-covers').getPublicUrl(path)
  return data.publicUrl
}

