import { supabase } from '../lib/supabaseClient'

export async function hasPurchasedChapter(userId, chapterId) {
  const { data, error } = await supabase
    .from('chapter_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

// Paiement simulé : aucune passerelle réelle n'est branchée, on enregistre
// directement l'achat comme "completed".
export async function purchaseChapter({ userId, chapterId, amountCents }) {
  const { error } = await supabase
    .from('chapter_purchases')
    .insert({ user_id: userId, chapter_id: chapterId, amount_cents: amountCents, currency: 'HTG', status: 'completed' })
  if (error) throw error
}

// `follows.target_id` est polymorphe (author | series | work | channel), donc
// pas de vraie clé étrangère vers `series` — on récupère les ids suivis puis
// on va chercher les séries correspondantes en 2 requêtes plutôt qu'un join.
export async function listMySubscribedSeries(userId) {
  const { data: follows, error: followsError } = await supabase
    .from('follows')
    .select('target_id')
    .eq('follower_id', userId)
    .eq('target_type', 'series')
  if (followsError) throw followsError
  if (follows.length === 0) return []

  const { data, error } = await supabase
    .from('series')
    .select('*, author:profiles!series_author_id_fkey(id, username, display_name, avatar_url), series_genres(genre:genres(name))')
    .in('id', follows.map((f) => f.target_id))
  if (error) throw error
  return data.map((s) => ({ ...s, genres: s.series_genres?.map((sg) => sg.genre.name) ?? [] }))
}
