import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Sparkles } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { avatarPlaceholder } from '../utils/placeholders'
import { getPantheon } from '../api/streaks'

const RANK_STYLE = ['bg-amber-400 text-amber-950', 'bg-zinc-300 text-zinc-900', 'bg-orange-500 text-orange-950']

function RankBadge({ rank }) {
  const style = RANK_STYLE[rank - 1] ?? 'bg-surface-2 text-zinc-400'
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${style}`}>
      {rank}
    </span>
  )
}

export default function Pantheon() {
  const [users, setUsers] = useState(null)

  useEffect(() => {
    getPantheon(20).then(setUsers)
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6 pb-8 sm:px-6">
        <div className="flex items-center gap-2">
          <Crown size={22} className="text-accent" />
          <h1 className="text-xl font-extrabold text-zinc-50">Panthéon</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Le classement permanent, toutes plateformes confondues — basé sur la rareté des badges obtenus, pas sur
          une période donnée.
        </p>

        <div className="mt-6 space-y-1.5">
          {users?.map((u, i) => (
            <Link
              key={u.user_id}
              to={`/profil/${u.username}`}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-2.5 hover:border-accent/30"
            >
              <RankBadge rank={i + 1} />
              <img
                src={u.avatar_url || avatarPlaceholder({ seed: u.user_id, name: u.display_name })}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-100">{u.display_name}</p>
                <p className="truncate text-xs text-zinc-500">
                  @{u.username} · {u.badge_count} badge{u.badge_count > 1 ? 's' : ''}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-accent">
                <Sparkles size={12} /> {u.prestige_score}
              </span>
            </Link>
          ))}
          {users && users.length === 0 && (
            <p className="text-sm text-zinc-500">Personne n'a encore de badge — sois le premier au Panthéon !</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
