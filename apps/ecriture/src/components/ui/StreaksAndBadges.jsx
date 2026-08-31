import { useEffect, useState } from 'react'
import { Award, BookOpen, Flame, PenLine, Sparkles, Trophy } from 'lucide-react'
import { getUserBadges, getUserStreaks } from '../../api/streaks'

const BADGE_ICONS = { BookOpen, Flame, Trophy, PenLine, Sparkles }

const STREAK_LABELS = { reading: 'Lecture', writing: 'Publication', community: 'Communauté' }

export default function StreaksAndBadges({ userId }) {
  const [streaks, setStreaks] = useState(null)
  const [badges, setBadges] = useState(null)

  useEffect(() => {
    if (!userId) return
    getUserStreaks(userId).then(setStreaks)
    getUserBadges(userId).then(setBadges)
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
            return (
              <span
                key={ub.badge.code}
                title={ub.badge.description}
                className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
              >
                <Icon size={13} />
                {ub.badge.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
