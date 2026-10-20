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
    new_partner_verified: flags.partnerVerified ?? null,
  })
  if (error) throw error
  return data
}

// Inscriptions via /rejoindre-auteur (lien envoyé par un partenaire comme
// Bohio Mag) : la source est déclarée par la personne elle-même, à valider
// manuellement avant d'accorder le badge auteur partenaire.
export async function listPartnerAuthors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .not('author_source', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listAllWorks() {
  const { data, error } = await supabase
    .from('works')
    .select('*, author:profiles!works_author_id_fkey(username)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteWorkAdmin(workId) {
  const { error } = await supabase.from('works').delete().eq('id', workId)
  if (error) throw error
}

// "Mise en avant HOS/Bohio Mag" : rend l'œuvre éligible aux canaux/communautés
// du site 3 même hors Top 10 hebdomadaire (cf. check_content_link_eligible).
export async function setWorkFeatured(workId, isFeatured) {
  const { error } = await supabase.from('works').update({ is_featured: isFeatured }).eq('id', workId)
  if (error) throw error
}

// Catalogue d'images en vente : réservé aux admins côté RLS (policy insert
// vérifie is_platform_admin quand owner_id est vide).
export async function listCatalogImagesAdmin() {
  const { data, error } = await supabase
    .from('platform_images')
    .select('*')
    .eq('source', 'platform_catalog')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadCatalogImage({ file, isFree, priceCents }) {
  const path = `catalog/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('work-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data: publicUrlData } = supabase.storage.from('work-covers').getPublicUrl(path)

  const { data, error } = await supabase
    .from('platform_images')
    .insert({ owner_id: null, source: 'platform_catalog', image_url: publicUrlData.publicUrl, is_free: isFree, price_cents: priceCents })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCatalogImage(imageId) {
  const { error } = await supabase.from('platform_images').delete().eq('id', imageId)
  if (error) throw error
}

export async function listAllImageRequests() {
  const { data, error } = await supabase
    .from('image_requests')
    .select(
      '*, requester:profiles!image_requests_requester_id_fkey(username, display_name), delivered_image:platform_images(image_url)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateImageRequestStatus(requestId, status) {
  const { error } = await supabase.from('image_requests').update({ status }).eq('id', requestId)
  if (error) throw error
}

// Livraison de l'image sur mesure : upload par l'admin (le dossier de
// stockage doit être celui de l'admin — policy Storage — mais la ligne
// platform_images appartient au demandeur pour qu'il puisse s'en servir),
// puis reliée à sa demande. Déclenche la notification de livraison côté base.
export async function deliverImageRequest({ requestId, requesterId, adminId, file }) {
  const path = `${adminId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('work-covers').upload(path, file)
  if (uploadError) throw uploadError
  const { data: publicUrlData } = supabase.storage.from('work-covers').getPublicUrl(path)

  const { data: image, error: imageError } = await supabase
    .from('platform_images')
    .insert({ owner_id: requesterId, source: 'user_upload', image_url: publicUrlData.publicUrl, is_free: true, price_cents: 0 })
    .select()
    .single()
  if (imageError) throw imageError

  const { error: updateError } = await supabase
    .from('image_requests')
    .update({ delivered_image_id: image.id, status: 'delivered' })
    .eq('id', requestId)
  if (updateError) throw updateError

  return image
}

export async function listAllEditionRequests() {
  const { data, error } = await supabase
    .from('edition_requests')
    .select(
      '*, author:profiles!edition_requests_author_id_fkey(username, display_name), editor:profiles!edition_requests_editor_id_fkey(username, display_name), work:works(title)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function assignEditionRequest(requestId, editorId) {
  const { error } = await supabase
    .from('edition_requests')
    .update({ editor_id: editorId, status: 'assigned' })
    .eq('id', requestId)
  if (error) throw error
}

export async function updateEditionRequestStatus(requestId, status) {
  const updates = { status }
  if (status === 'delivered') updates.delivered_at = new Date().toISOString()
  const { error } = await supabase.from('edition_requests').update(updates).eq('id', requestId)
  if (error) throw error
}

// Livraison du retour d'édition : le texte de feedback est ce que l'auteur
// verra sur /edition — déclenche la notification de livraison côté base.
export async function deliverEditionFeedback(requestId, feedback) {
  const { error } = await supabase
    .from('edition_requests')
    .update({ feedback, status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', requestId)
  if (error) throw error
}

export async function listEditors() {
  const { data, error } = await supabase.from('profiles').select('id, username, display_name').eq('is_editor', true)
  if (error) throw error
  return data
}

export async function createWorkMigrationOffer(workId) {
  const { error } = await supabase
    .from('work_migrations')
    .insert({ work_id: workId, target_platform: 'reading_publishing' })
  if (error) throw error
}

export async function listAllWorkMigrations() {
  const { data, error } = await supabase
    .from('work_migrations')
    .select('*, work:works(title, author:profiles!works_author_id_fkey(username))')
    .order('proposed_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listWorkReports({ includeResolved = false } = {}) {
  let query = supabase
    .from('work_reports')
    .select('*, work:works(id, title), reporter:profiles(username, display_name)')
    .order('created_at', { ascending: false })
  if (!includeResolved) query = query.is('resolved_at', null)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function resolveWorkReport(reportId) {
  const { error } = await supabase.from('work_reports').update({ resolved_at: new Date().toISOString() }).eq('id', reportId)
  if (error) throw error
}

export async function getDashboardStats() {
  const [profiles, works, chapters, imageRequests, editionRequests, unresolvedReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('works').select('id', { count: 'exact', head: true }),
    supabase.from('work_chapters').select('id', { count: 'exact', head: true }),
    supabase.from('image_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('edition_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('work_reports').select('id', { count: 'exact', head: true }).is('resolved_at', null),
  ])
  if (profiles.error) throw profiles.error
  if (works.error) throw works.error
  if (chapters.error) throw chapters.error
  if (imageRequests.error) throw imageRequests.error
  if (editionRequests.error) throw editionRequests.error
  if (unresolvedReports.error) throw unresolvedReports.error

  return {
    totalProfiles: profiles.count ?? 0,
    totalWorks: works.count ?? 0,
    totalChapters: chapters.count ?? 0,
    pendingImageRequests: imageRequests.count ?? 0,
    pendingEditionRequests: editionRequests.count ?? 0,
    unresolvedReports: unresolvedReports.count ?? 0,
  }
}
