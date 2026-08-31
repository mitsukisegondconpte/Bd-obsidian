import { supabase } from '../lib/supabaseClient'

const SERIES_SELECT =
  '*, author:profiles!series_author_id_fkey(id, username, display_name, avatar_url), series_genres(genre:genres(name))'

function flattenGenres(row) {
  return { ...row, genres: row.series_genres?.map((sg) => sg.genre.name) ?? [] }
}

// isNew / isHot ne sont pas des colonnes : calculés depuis des champs réels
// (récence de publication, classement par vues) plutôt que stockés en dur.
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
  const { data, error } = await supabase.from('series').select(SERIES_SELECT).order('created_at', { ascending: false })
  if (error) throw error
  return withComputedBadges(data.map(flattenGenres))
}

export async function getSeriesBySlug(slug) {
  const { data, error } = await supabase.from('series').select(SERIES_SELECT).eq('slug', slug).single()
  if (error) throw error
  return flattenGenres(data)
}

export async function listSeriesByAuthor(authorId) {
  const { data, error } = await supabase.from('series').select(SERIES_SELECT).eq('author_id', authorId)
  if (error) throw error
  return withComputedBadges(data.map(flattenGenres))
}

export async function listSeriesChapters(seriesId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', seriesId)
    .order('number', { ascending: true })
  if (error) throw error
  return data
}

export async function getChapter(chapterId) {
  const { data, error } = await supabase.from('chapters').select('*').eq('id', chapterId).single()
  if (error) throw error
  return data
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

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createSeries({ authorId, title, summary, status, updateDay, coverUrl, genreNames }) {
  const base = slugify(title) || 'serie'
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`

  const { data, error } = await supabase
    .from('series')
    .insert({
      author_id: authorId,
      title,
      summary,
      status,
      update_day: updateDay || null,
      cover_url: coverUrl || null,
      slug,
    })
    .select()
    .single()
  if (error) throw error

  if (genreNames?.length) {
    const { data: genreRows, error: genreErr } = await supabase.from('genres').select('id, name').in('name', genreNames)
    if (genreErr) throw genreErr
    if (genreRows.length) {
      const { error: tagErr } = await supabase
        .from('series_genres')
        .insert(genreRows.map((g) => ({ series_id: data.id, genre_id: g.id })))
      if (tagErr) throw tagErr
    }
  }

  return data
}

export async function uploadSeriesCover({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('series-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('series-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadChapterPage({ ownerId, file, index }) {
  const path = `${ownerId}/${Date.now()}-${index}-${file.name}`
  const { error } = await supabase.storage.from('chapter-pages').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('chapter-pages').getPublicUrl(path)
  return data.publicUrl
}

export async function listChapterPages(chapterId) {
  const { data, error } = await supabase
    .from('chapter_pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true })
  if (error) throw error
  return data
}

export async function addSeriesChapter({ seriesId, number, title, isFree, priceCents, pageUrls }) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      series_id: seriesId,
      number,
      title,
      is_free: isFree,
      price_cents: isFree ? 0 : priceCents,
      page_count: pageUrls.length,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  if (pageUrls.length) {
    const { error: pagesErr } = await supabase
      .from('chapter_pages')
      .insert(pageUrls.map((url, i) => ({ chapter_id: data.id, page_number: i + 1, image_url: url })))
    if (pagesErr) throw pagesErr
  }

  return data
}
