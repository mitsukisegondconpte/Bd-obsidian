import { supabase } from '../lib/supabaseClient'

export async function recordStreakActivity(streakType) {
  const { error } = await supabase.rpc('record_streak_activity', { p_streak_type: streakType })
  if (error) throw error
}

export async function getUserStreaks(userId) {
  const { data, error } = await supabase.from('user_streaks').select('*').eq('user_id', userId)
  if (error) throw error
  return data
}

export async function getUserBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('earned_at, badge:badges(id, code, label, description, icon, rarity)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getBadgeStats() {
  const { data, error } = await supabase.rpc('badge_stats')
  if (error) throw error
  return data
}

export async function getPantheon(limit = 20) {
  const { data, error } = await supabase.rpc('pantheon_top_users', { p_limit: limit })
  if (error) throw error
  return data
}
