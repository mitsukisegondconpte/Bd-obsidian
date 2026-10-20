import { useEffect, useState } from 'react'
import { Award, BookOpen, Flame, PenLine, Sparkles, Trophy } from 'lucide-react'
import { getBadgeStats, getUserBadges, getUserStreaks } from '../../api/streaks'

const BADGE_ICONS = { BookOpen, Flame, Trophy, PenLine, Sparkles, Award }

const STREAK_LABELS = { reading: 'Lecture', writing: 'Publication', community: 'Communauté' }

const RARITY_STYLES = {
  common: 'border-zinc-500/25 bg-zinc-500/10 text-zinc-300',
  rare: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
  super_rare: 'border-purple-500/25 bg-purple-500/10 text-purple-400',
  legendary: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

const RARITY_LABELS = { common: 'Commun', rare: 'Rare', super_rare: 'Super rare', legendary: 'Légendaire' }

export default function StreaksAndBadges({ userId }) {
  const [streaks, setStreaks] = useState(null)
  const [badges, setBadges] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!userId) return
    getUserStreaks(userId).then(setStreaks)
    getUserBadges(userId).then(setBadges)
    getBadgeStats().then((rows) => setStats(Object.fromEntries(rows.map((r) => [r.badge_id, r.holder_percent]))))
  }, [userId])

  const activeStreaks = streaks?.filter((s) => s.current_count > 0) ?? []

  if (streaks === null && badges === null) return null
  if (activeStreaks.length === 0 && badges?.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      {activeStreaks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeStreaks.map((s) => (
            <span
              key={s.streak_type}
              className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400"
            >
              <Flame size={13} className="fill-orange-400" />
              {s.current_count}j · {STREAK_LABELS[s.streak_type]}
            </span>
          ))}
        </div>
      )}

      {badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((ub) => {
            const Icon = BADGE_ICONS[ub.badge.icon] ?? Award
            const percent = stats?.[ub.badge.id]
            const title = `${ub.badge.description} — ${RARITY_LABELS[ub.badge.rarity]}${
              percent != null ? ` · ${percent}% des utilisateurs l'ont` : ''
            }`
            return (
              <span
                key={ub.badge.code}
                title={title}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  RARITY_STYLES[ub.badge.rarity] ?? RARITY_STYLES.common
                }`}
              >
                <Icon size={13} />
                {ub.badge.label}
                {percent != null && <span className="opacity-60">· {percent}%</span>}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
