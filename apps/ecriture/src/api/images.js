import { supabase } from '../lib/supabaseClient'

export async function listCatalogImages() {
  const { data, error } = await supabase
    .from('platform_images')
    .select('*')
    .eq('source', 'platform_catalog')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadCoverFile({ ownerId, file }) {
  const path = `${ownerId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('work-covers').upload(path, file)
  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage.from('work-covers').getPublicUrl(path)

  const { data, error } = await supabase
    .from('platform_images')
    .insert({ owner_id: ownerId, source: 'user_upload', image_url: publicUrlData.publicUrl, is_free: true, price_cents: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadExternalImage({ ownerId, imageUrl }) {
  const { data, error } = await supabase
    .from('platform_images')
    .insert({ owner_id: ownerId, source: 'external_url', image_url: imageUrl, is_free: true, price_cents: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createImageRequest({ requesterId, description, priceCents }) {
  const { data, error } = await supabase
    .from('image_requests')
    .insert({ requester_id: requesterId, description, price_cents: priceCents ?? null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listMyImageRequests(requesterId) {
  const { data, error } = await supabase
    .from('image_requests')
    .select('*, delivered_image:platform_images(image_url)')
    .eq('requester_id', requesterId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
