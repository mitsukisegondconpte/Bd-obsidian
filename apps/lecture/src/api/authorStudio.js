import { supabase } from '../lib/supabaseClient'
import { chapterPageUploadDestination } from '../utils/chapterPageUploadDestination'

const pendingSeriesDraftCreates = new Map()
const pendingChapterDraftCreates = new Map()

function safeName(name) {
  return String(name ?? '').replace(/[^a-zA-Z0-9._-]/g, '_')
}

function isPublicUrl(value) {
  return typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))
}

function objectPathFromPublicUrl(url, bucket) {
  const marker = '/storage/v1/object/public/' + bucket + '/'
  const offset = url.indexOf(marker)
  return offset < 0 ? null : decodeURIComponent(url.slice(offset + marker.length))
}

function createPendingDraftGuard(map, keyFactory) {
  return async function runWithPendingGuard(pendingKey, operation) {
    const key = keyFactory(pendingKey)
    const existing = map.get(key)
    if (existing) return existing

    const promise = Promise.resolve().then(operation)
    map.set(key, promise)
    try {
      return await promise
    } finally {
      map.delete(key)
    }
  }
}

const withPendingSeriesDraft = createPendingDraftGuard(pendingSeriesDraftCreates, (key) => `series:${key}`)
const withPendingChapterDraft = createPendingDraftGuard(pendingChapterDraftCreates, (key) => `chapter:${key}`)

function createUuidV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (letter) => {
    const random = Math.random() * 16 | 0
    const value = letter === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export async function createSeriesDraft(authorId, creationKey = null) {
  const key = creationKey || createUuidV4()
  return withPendingSeriesDraft(`${authorId}:${key}`, async () => {
    const { data, error } = await supabase.rpc('create_series_draft', { p_creation_key: key })
    if (error) throw error

    const draftId = Array.isArray(data) ? data[0] : data
    if (!draftId) {
      throw new Error('Le brouillon n’a pas été créé correctement.')
    }

    const draft = await getAuthorSeriesDraft(draftId, authorId)
    return draft
  })
}

export async function getAuthorSeriesDraft(seriesId, authorId) {
  const { data, error } = await supabase
    .from('series')
    .select('*, series_genres(genre:genres(name))')
    .eq('id', seriesId)
    .eq('author_id', authorId)
    .eq('is_published', false)
    .single()
  if (error) throw error
  return data
}

export async function updateSeriesDraft({ seriesId, authorId, title, summary, status, updateDay, coverUrl, genreNames }) {
  const { data, error } = await supabase
    .from('series')
    .update({
      title: title.trim() || 'Brouillon sans titre',
      summary: summary.trim(),
      status,
      update_day: updateDay || null,
      cover_url: coverUrl || null,
    })
    .eq('id', seriesId)
    .eq('author_id', authorId)
    .eq('is_published', false)
    .select('id, slug, title, is_published')
    .single()
  if (error) throw error

  let genres = []
  if (genreNames?.length) {
    const { data: genreRows, error: genreError } = await supabase.from('genres').select('id, name').in('name', genreNames)
    if (genreError) throw genreError
    genres = genreRows
  }
  const { error: removeError } = await supabase.from('series_genres').delete().eq('series_id', seriesId)
  if (removeError) throw removeError
  if (genres.length) {
    const { error: insertError } = await supabase.from('series_genres').insert(genres.map((genre) => ({ series_id: seriesId, genre_id: genre.id })))
    if (insertError) throw insertError
  }
  return data
}

async function uploadOnce(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  // A retry uses the same operation-specific path, including after a lost response.
  if (error && String(error.statusCode) !== '409') throw error
}

export async function uploadDraftCover({ ownerId, seriesId, file, uploadId = createUuidV4() }) {
  const path = ownerId + '/series/' + seriesId + '/cover-' + uploadId + '-' + safeName(file.name)
  await uploadOnce('author-drafts', path, file)
  return path
}

export async function getDraftAssetUrl(path) {
  if (!path || isPublicUrl(path)) return path || ''
  const { data, error } = await supabase.storage.from('author-drafts').createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function publishSeriesDraft({ seriesId, authorId }) {
  const { data: series, error: readError } = await supabase
    .from('series')
    .select('id, author_id, slug, cover_url, title, summary')
    .eq('id', seriesId)
    .eq('author_id', authorId)
    .eq('is_published', false)
    .single()
  if (readError) throw readError
  if (!series.title?.trim() || !series.summary?.trim()) throw new Error('Ajoute un titre et un résumé avant de publier.')

  let coverUrl = series.cover_url
  if (coverUrl && !isPublicUrl(coverUrl)) {
    const { data: file, error: downloadError } = await supabase.storage.from('author-drafts').download(coverUrl)
    if (downloadError) throw downloadError
    const publicPath = authorId + '/' + seriesId + '-' + safeName(coverUrl.split('/').pop() || 'cover')
    await uploadOnce('series-covers', publicPath, file)
    coverUrl = supabase.storage.from('series-covers').getPublicUrl(publicPath).data.publicUrl
    const { error: coverError } = await supabase.from('series').update({ cover_url: coverUrl }).eq('id', seriesId).eq('author_id', authorId)
    if (coverError) throw coverError
    await supabase.storage.from('author-drafts').remove([series.cover_url])
  }

  const { data, error } = await supabase
    .from('series')
    .update({ is_published: true })
    .eq('id', seriesId)
    .eq('author_id', authorId)
    .eq('is_published', false)
    .select('id, slug, title, is_published')
    .single()
  if (error) throw error
  return data
}

export async function createChapterDraft({ seriesId, number }) {
  return withPendingChapterDraft(`${seriesId}:${number}`, async () => {
    const { data, error } = await supabase
      .from('chapters')
      .insert({ series_id: seriesId, number, title: 'Brouillon sans titre', is_free: true, price_cents: 0, page_count: 0, published_at: null })
      .select('*')
      .single()
    if (error) throw error
    return data
  })
}

export async function updateAuthorChapter({ chapterId, title, isFree, priceCents }) {
  const { data, error } = await supabase
    .from('chapters')
    .update({ title: title.trim() || 'Brouillon sans titre', is_free: isFree, price_cents: isFree ? 0 : Math.max(0, Number(priceCents) || 0) })
    .eq('id', chapterId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function uploadAuthorChapterPage({ chapterId, ownerId, file, pageNumber, isPublished, pageId = createUuidV4() }) {
  const { bucket, path } = chapterPageUploadDestination({ chapterId, ownerId, pageId, fileName: file.name, isPublished })
  const findPage = () => supabase.from('chapter_pages').select('*').eq('id', pageId).eq('chapter_id', chapterId).maybeSingle()
  let { data, error } = await findPage()
  if (error) throw error
  if (!data) {
    await uploadOnce(bucket, path, file)
    const imageUrl = isPublished ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path
    const result = await supabase
      .from('chapter_pages')
      .insert({ id: pageId, chapter_id: chapterId, page_number: pageNumber, image_url: imageUrl })
      .select('*')
      .single()
    data = result.data
    if (result.error) {
      // The insert may have committed even if its response was lost.
      const recovered = await findPage()
      if (recovered.error || !recovered.data) throw result.error
      data = recovered.data
    }
  }
  const { count, error: countError } = await supabase.from('chapter_pages').select('id', { count: 'exact', head: true }).eq('chapter_id', chapterId)
  if (countError) throw countError
  const { error: pageCountError } = await supabase.from('chapters').update({ page_count: count || 0 }).eq('id', chapterId)
  if (pageCountError) throw pageCountError
  return data
}

export async function deleteAuthorChapterPage({ pageId, imageUrl }) {
  const { data: page, error: readError } = await supabase.from('chapter_pages').select('chapter_id, image_url').eq('id', pageId).single()
  if (readError) throw readError
  const { data: chapter, error: chapterError } = await supabase.from('chapters').select('published_at').eq('id', page.chapter_id).single()
  if (chapterError) throw chapterError
  if (chapter.published_at) throw new Error('Les pages d’un chapitre publié ne peuvent pas être supprimées.')
  const storedUrl = page.image_url || imageUrl
  if (isPublicUrl(storedUrl)) {
    const path = objectPathFromPublicUrl(storedUrl, 'chapter-pages')
    if (path) {
      const { error } = await supabase.storage.from('chapter-pages').remove([path])
      if (error) throw error
    }
  } else if (storedUrl) {
    const { error } = await supabase.storage.from('author-drafts').remove([storedUrl])
    if (error) throw error
  }
  const { error: deleteError } = await supabase.from('chapter_pages').delete().eq('id', pageId).select('id').single()
  if (deleteError) throw deleteError
  const { count, error: countError } = await supabase.from('chapter_pages').select('id', { count: 'exact', head: true }).eq('chapter_id', page.chapter_id)
  if (countError) throw countError
  const { error: updateError } = await supabase.from('chapters').update({ page_count: count || 0 }).eq('id', page.chapter_id)
  if (updateError) throw updateError
}

export async function reorderAuthorChapterPages({ chapterId, pageIds }) {
  const { error } = await supabase.rpc('reorder_author_chapter_pages', { p_chapter_id: chapterId, p_page_ids: pageIds })
  if (error) throw error
}

export async function publishAuthorChapter({ chapterId, ownerId }) {
  const { data: chapter, error: chapterError } = await supabase.from('chapters').select('title, is_free, price_cents, published_at').eq('id', chapterId).single()
  if (chapterError) throw chapterError
  if (chapter.published_at) throw new Error('Ce chapitre est déjà publié.')
  if (!chapter.title?.trim() || chapter.title === 'Brouillon sans titre') throw new Error('Ajoute un titre avant de publier.')
  if (!chapter.is_free && Number(chapter.price_cents) < 1) throw new Error('Le prix doit être supérieur à zéro.')
  const { data: pages, error: readError } = await supabase.from('chapter_pages').select('*').eq('chapter_id', chapterId).order('page_number', { ascending: true })
  if (readError) throw readError
  if (!pages.length) throw new Error('Ajoute au moins une page avant de publier.')
  for (const page of pages) {
    if (isPublicUrl(page.image_url)) continue
    const { data: file, error: downloadError } = await supabase.storage.from('author-drafts').download(page.image_url)
    if (downloadError) throw downloadError
    const publicPath = ownerId + '/' + chapterId + '-' + page.id + '-' + safeName(page.image_url.split('/').pop() || 'page')
    await uploadOnce('chapter-pages', publicPath, file)
    const publicUrl = supabase.storage.from('chapter-pages').getPublicUrl(publicPath).data.publicUrl
    const { error: updateError } = await supabase.from('chapter_pages').update({ image_url: publicUrl }).eq('id', page.id)
    if (updateError) throw updateError
    await supabase.storage.from('author-drafts').remove([page.image_url])
  }
  const { data, error } = await supabase
    .from('chapters')
    .update({ published_at: new Date().toISOString(), page_count: pages.length })
    .eq('id', chapterId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteAuthorChapter(chapterId) {
  const { data: chapter, error: chapterError } = await supabase.from('chapters').select('published_at').eq('id', chapterId).single()
  if (chapterError) throw chapterError
  if (chapter.published_at) throw new Error('Un chapitre publié ne peut pas être supprimé ici.')
  const { data: pages, error: readError } = await supabase.from('chapter_pages').select('id, image_url').eq('chapter_id', chapterId)
  if (readError) throw readError
  for (const page of pages) await deleteAuthorChapterPage({ pageId: page.id, imageUrl: page.image_url })
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId).select('id').single()
  if (error) throw error
}

export async function updatePublishedSeries({ seriesId, authorId, title, summary, status, updateDay, coverUrl, genreNames }) {
  const { error } = await supabase
    .from('series')
    .update({ title: title.trim(), summary: summary.trim(), status, update_day: updateDay || null, cover_url: coverUrl || null })
    .eq('id', seriesId)
    .eq('author_id', authorId)
    .eq('is_published', true)
    .select('id')
    .single()
  if (error) throw error
  let genres = []
  if (genreNames?.length) {
    const { data: genreRows, error: genreError } = await supabase.from('genres').select('id, name').in('name', genreNames)
    if (genreError) throw genreError
    genres = genreRows
  }
  const { error: removeError } = await supabase.from('series_genres').delete().eq('series_id', seriesId)
  if (removeError) throw removeError
  if (genres.length) {
    const { error: insertError } = await supabase.from('series_genres').insert(genres.map((genre) => ({ series_id: seriesId, genre_id: genre.id })))
    if (insertError) throw insertError
  }
}

