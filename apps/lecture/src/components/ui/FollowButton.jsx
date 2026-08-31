import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { followAuthor, isFollowingAuthor, unfollowAuthor } from '../../api/profiles'
import { followSeries, isFollowingSeries, unfollowSeries } from '../../api/series'

const HANDLERS = {
  author: { isFollowing: isFollowingAuthor, follow: followAuthor, unfollow: unfollowAuthor },
  series: { isFollowing: isFollowingSeries, follow: followSeries, unfollow: unfollowSeries },
}

export default function FollowButton({ targetType, targetId, className = '' }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const handlers = HANDLERS[targetType]

  useEffect(() => {
    if (!user || user.id === targetId) return
    handlers.isFollowing(user.id, targetId).then(setFollowing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, targetId, targetType])

  if (!user || (targetType === 'author' && user.id === targetId)) return null

  async function toggle() {
    setBusy(true)
    try {
      if (following) {
        await handlers.unfollow(user.id, targetId)
        setFollowing(false)
      } else {
        await handlers.follow(user.id, targetId)
        setFollowing(true)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${
        following
          ? 'bg-surface-3 text-zinc-200 ring-1 ring-white/10 hover:bg-surface-2'
          : 'bg-accent text-accent-ink hover:bg-accent-dark'
      } ${className}`}
    >
      {following ? <Check size={16} /> : <Bell size={16} />}
      {following ? 'Abonné' : "S'abonner"}
    </button>
  )
}
