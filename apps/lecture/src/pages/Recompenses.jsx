import { useEffect, useState } from 'react'
import { Award, BookOpen, Flame, Gift, Lock, PenLine, Sparkles, Trophy } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { getAllBadges, getBadgeStats, getUserBadges, getUserCounters } from '../api/streaks'
import Loader from '../components/ui/Loader'

const BADGE_ICONS = { BookOpen, Flame, Trophy, PenLine, Sparkles, Award }

const RARITY_ORDER = ['common', 'rare', 'super_rare', 'legendary']
const RARITY_LABELS = { common: 'Commun', rare: 'Rare', super_rare: 'Super rare', legendary: 'Légendaire' }
const RARITY_STYLES = {
  common: 'border-zinc-500/25 text-zinc-300',
  rare: 'border-sky-500/25 text-sky-400',
  super_rare: 'border-purple-500/25 text-purple-400',
  legendary: 'border-amber-500/30 text-amber-400',
}
const RARITY_BAR = {
  common: 'bg-zinc-400',
  rare: 'bg-sky-400',
  super_rare: 'bg-purple-400',
  legendary: 'bg-amber-400',
}

export default function Recompenses() {
  const { user } = useAuth()
  const [allBadges, setAllBadges] = useState(null)
  const [earnedIds, setEarnedIds] = useState(new Set())
  const [counters, setCounters] = useState({})
  const [stats, setStats] = useState({})

  useEffect(() => {
    getAllBadges().then(setAllBadges)
    getBadgeStats().then((rows) => setStats(Object.fromEntries(rows.map((r) => [r.badge_id, r.holder_percent]))))
  }, [])

  useEffect(() => {
    if (!user) return
    getUserBadges(user.id).then((rows) => setEarnedIds(new Set(rows.map((r) => r.badge.id))))
    getUserCounters(user.id).then((rows) => setCounters(Object.fromEntries(rows.map((r) => [r.counter_type, r.count]))))
  }, [user])

  if (!allBadges) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  const byRarity = RARITY_ORDER.map((rarity) => ({
    rarity,
    badges: allBadges.filter((b) => b.rarity === rarity),
  }))

  return (
    <Layout>
      <div className="px-4 pt-6 pb-8 sm:px-6">
        <div className="flex items-center gap-2">
          <Gift size={22} className="text-accent" />
          <h1 className="text-xl font-extrabold text-zinc-50">Récompenses</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {earnedIds.size} / {allBadges.length} badges obtenus — même compte sur les 3 plateformes Hypercube.
        </p>

        {byRarity.map(({ rarity, badges }) => (
          <section key={rarity} className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">{RARITY_LABELS[rarity]}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {badges.map((b) => {
                const Icon = BADGE_ICONS[b.icon] ?? Award
                const earned = earnedIds.has(b.id)
                const progress =
                  !earned && b.threshold_counter_type && b.threshold_counter_type !== 'badges_collected'
                    ? Math.min(100, Math.round(((counters[b.threshold_counter_type] ?? 0) / b.threshold_count) * 100))
                    : null
                return (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3.5 ${
                      earned ? RARITY_STYLES[b.rarity] + ' bg-surface-1' : 'border-white/5 bg-surface-1/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${earned ? 'bg-white/10' : 'bg-white/5'}`}>
                        {earned ? <Icon size={16} /> : <Lock size={14} className="text-zinc-600" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-100">{b.label}</p>
                        <p className="truncate text-xs text-zinc-500">{b.description}</p>
                      </div>
                    </div>
                    {progress != null && (
                      <div className="mt-2.5">
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className={`h-full ${RARITY_BAR[b.rarity]}`} style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-600">
                          {counters[b.threshold_counter_type] ?? 0} / {b.threshold_count}
                        </p>
                      </div>
                    )}
                    {stats[b.id] != null && (
                      <p className="mt-2 text-[11px] text-zinc-600">{stats[b.id]}% des utilisateurs l'ont</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  )
}
