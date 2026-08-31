import { supabase } from '../lib/supabaseClient'

export const EDITION_LEVELS = [
  {
    level: 1,
    name: 'Édition niveau 1',
    description:
      "L'œuvre est lue entièrement, et l'écrivain reçoit des commentaires (ce qu'il faut corriger, ajouter).",
    priceLabel: '4 essais gratuits, puis payant',
  },
  {
    level: 2,
    name: 'Édition niveau 2',
    description:
      "1 essai gratuit pour 1 chapitre. L'éditeur accompagne étape par étape : liste de corrections, puis discussion et conseils personnalisés.",
    priceLabel: 'Plus cher que le niveau 1',
  },
  {
    level: 3,
    name: 'Édition niveau 3',
    description:
      "Réservée aux membres Hypercube Obsidian / Bohio Mag : pas besoin de payer à chaque édition, mais les œuvres produites deviennent payantes.",
    priceLabel: 'Rejoindre Hypercube Obsidian ou Bohio Mag',
  },
]

export async function getEditionCredits(userId) {
  const { data, error } = await supabase
    .from('edition_credits')
    .select('free_level1_credits_left')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.free_level1_credits_left ?? 0
}

export async function listEditionRequests(userId) {
  const { data, error } = await supabase
    .from('edition_requests')
    .select('*, work:works(title)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createEditionRequest({ workId, workChapterId, authorId, level, usedFreeCredit }) {
  const { data, error } = await supabase
    .from('edition_requests')
    .insert({
      work_id: workId,
      work_chapter_id: workChapterId,
      author_id: authorId,
      level,
      used_free_credit: usedFreeCredit,
    })
    .select()
    .single()
  if (error) throw error

  if (usedFreeCredit) {
    await supabase.rpc('decrement_edition_credit', { p_user_id: authorId })
  }

  return data
}
