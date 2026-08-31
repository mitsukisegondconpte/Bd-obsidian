import { supabase } from '../lib/supabaseClient'

export async function listWorks({ workType, tag } = {}) {
  let query = supabase
    .from('works')
    .select('*, author:profiles!works_author_id_fkey(id, username, display_name, avatar_url), cover:platform_images(image_url)')
    .order('created_at', { ascending: false })

  if (workType) query = query.eq('work_type', workType)
  if (tag) query = query.contains('tags', [tag])

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getWork(workId) {
  const { data, error } = await supabase
    .from('works')
    .select('*, author:profiles!works_author_id_fkey(id, username, display_name, avatar_url, bio), cover:platform_images(image_url)')
    .eq('id', workId)
    .single()
  if (error) throw error
  return data
}

export async function listWorkChapters(workId) {
  const { data, error } = await supabase
    .from('work_chapters')
    .select('*')
    .eq('work_id', workId)
    .order('number', { ascending: true })
  if (error) throw error
  return data
}

export async function getWorkChapter(chapterId) {
  const { data, error } = await supabase.from('work_chapters').select('*').eq('id', chapterId).single()
  if (error) throw error
  return data
}

export async function listWorksByAuthor(authorId) {
  const { data, error } = await supabase
    .from('works')
    .select('*, cover:platform_images(image_url)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createWork({ authorId, title, synopsis, workType, tags, coverImageId }) {
  const { data, error } = await supabase
    .from('works')
    .insert({ author_id: authorId, title, synopsis, work_type: workType, tags, cover_image_id: coverImageId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addWorkChapter({ workId, number, title, content, isDraft }) {
  const { data, error } = await supabase
    .from('work_chapters')
    .insert({
      work_id: workId,
      number,
      title,
      content,
      is_draft: isDraft,
      published_at: isDraft ? null : new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function publishChapter(chapterId) {
  const { error } = await supabase
    .from('work_chapters')
    .update({ is_draft: false, published_at: new Date().toISOString() })
    .eq('id', chapterId)
  if (error) throw error
}

export async function saveReadingProgress({ userId, workId, chapterId }) {
  const { error } = await supabase
    .from('reading_progress')
    .upsert({ user_id: userId, work_id: workId, last_chapter_id: chapterId, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function listMyWorkMigrations(authorId) {
  const { data, error } = await supabase
    .from('work_migrations')
    .select('*, work:works!inner(title, author_id), new_series:series(slug)')
    .eq('work.author_id', authorId)
    .in('status', ['proposed', 'completed'])
    .order('proposed_at', { ascending: false })
  if (error) throw error
  return data
}

export async function respondToWorkMigration(migrationId, accept) {
  const { error } = await supabase
    .from('work_migrations')
    .update({ status: accept ? 'accepted' : 'declined', resolved_at: new Date().toISOString() })
    .eq('id', migrationId)
  if (error) throw error
}

export async function getReadingProgress(userId, workId) {
  const { data, error } = await supabase
    .from('reading_progress')
    .select('last_chapter_id')
    .eq('user_id', userId)
    .eq('work_id', workId)
    .maybeSingle()
  if (error) throw error
  return data?.last_chapter_id ?? null
}
