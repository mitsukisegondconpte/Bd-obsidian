import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Hash, Trophy, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { avatarPlaceholder } from '../utils/placeholders'
import { topAuthorsWeekly, topChannelsWeekly, topCommunitiesWeekly } from '../api/leaderboards'

const RANK_STYLE = ['bg-amber-400 text-amber-950', 'bg-zinc-300 text-zinc-900', 'bg-orange-500 text-orange-950']

function RankBadge({ rank }) {
  const style = RANK_STYLE[rank - 1] ?? 'bg-surface-2 text-zinc-400'
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${style}`}>
      {rank}
    </span>
  )
}

export default function Classement() {
  const [communities, setCommunities] = useState(null)
  const [channels, setChannels] = useState(null)
  const [authors, setAuthors] = useState(null)

  useEffect(() => {
    topCommunitiesWeekly(10).then(setCommunities)
    topChannelsWeekly(10).then(setChannels)
    topAuthorsWeekly(10).then(setAuthors)
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-accent" />
          <h1 className="text-xl font-extrabold text-zinc-50">Classement de la semaine</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Basé sur les nouveaux membres/abonnés des 7 derniers jours.</p>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Top communautés</h2>
          <div className="space-y-1.5">
            {communities?.map((c, i) => (
              <Link
                key={c.community_id}
                to={`/communaute/${c.community_id}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-2.5 hover:border-accent/30"
              >
                <RankBadge rank={i + 1} />
                <Users size={16} className="shrink-0 text-zinc-500" />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">{c.name}</p>
                <span className="shrink-0 text-xs font-bold text-accent">+{c.new_members}</span>
              </Link>
            ))}
            {communities && communities.length === 0 && <p className="text-sm text-zinc-500">Aucune communauté pour l'instant.</p>}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Top canaux</h2>
          <div className="space-y-1.5">
            {channels?.map((c, i) => (
              <Link
                key={c.channel_id}
                to={`/canal/${c.channel_id}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-2.5 hover:border-accent/30"
              >
                <RankBadge rank={i + 1} />
                <Hash size={16} className="shrink-0 text-zinc-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">{c.name}</p>
                  <p className="truncate text-xs text-zinc-500">@{c.owner_username}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-accent">+{c.new_followers}</span>
              </Link>
            ))}
            {channels && channels.length === 0 && <p className="text-sm text-zinc-500">Aucun canal pour l'instant.</p>}
          </div>
        </section>

        <section className="mt-8 pb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
            Top créateurs Hypercube
          </h2>
          <p className="-mt-2 mb-3 text-xs text-zinc-600">BD et écriture confondues — même compte, un seul classement.</p>
          <div className="space-y-1.5">
            {authors?.map((a, i) => (
              <Link
                key={a.author_id}
                to={`/profil/${a.username}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-2.5 hover:border-accent/30"
              >
                <RankBadge rank={i + 1} />
                <img
                  src={a.avatar_url || avatarPlaceholder({ seed: a.author_id, name: a.display_name })}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">{a.display_name}</p>
                  <p className="truncate text-xs text-zinc-500">@{a.username}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-accent">+{a.new_followers}</span>
              </Link>
            ))}
            {authors && authors.length === 0 && <p className="text-sm text-zinc-500">Aucun créateur pour l'instant.</p>}
          </div>
        </section>
      </div>
    </Layout>
  )
}
