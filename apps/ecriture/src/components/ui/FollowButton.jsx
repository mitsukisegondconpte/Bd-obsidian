import { useEffect, useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { followAuthor, isFollowingAuthor, unfollowAuthor } from '../../api/profiles'

export default function FollowButton({ authorId, className = '' }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user || user.id === authorId) return
    isFollowingAuthor(user.id, authorId).then(setFollowing)
  }, [user, authorId])

  if (!user || user.id === authorId) return null

  async function toggle() {
    setBusy(true)
    try {
      if (following) {
        await unfollowAuthor(user.id, authorId)
        setFollowing(false)
      } else {
        await followAuthor(user.id, authorId)
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
      {following ? 'Suivi' : 'Suivre'}
    </button>
  )
}
