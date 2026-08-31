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
    .select('earned_at, badge:badges(code, label, description, icon)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  if (error) throw error
  return data
}
