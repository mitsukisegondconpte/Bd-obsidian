import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { avatarPlaceholder, coverPlaceholder } from '../utils/placeholders'
import { topAuthorsWeekly, topSeriesWeekly } from '../api/leaderboards'

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
  const [series, setSeries] = useState(null)
  const [authors, setAuthors] = useState(null)

  useEffect(() => {
    topSeriesWeekly(10).then(setSeries)
    topAuthorsWeekly(10).then(setAuthors)
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Trophy size={22} className="text-accent" />
          <h1 className="text-xl font-extrabold text-zinc-50">Classement de la semaine</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-500">Basé sur les nouveaux abonnés des 7 derniers jours.</p>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Top séries</h2>
          <div className="space-y-1.5">
            {series?.map((s, i) => (
              <Link
                key={s.series_id}
                to={`/serie/${s.slug}`}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-2.5 hover:border-accent/30"
              >
                <RankBadge rank={i + 1} />
                <img
                  src={s.cover_url || coverPlaceholder({ seed: s.series_id, title: s.title })}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">{s.title}</p>
                  <p className="truncate text-xs text-zinc-500">par {s.author_display_name}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-accent">+{s.new_followers}</span>
              </Link>
            ))}
            {series && series.length === 0 && <p className="text-sm text-zinc-500">Aucune série pour l'instant.</p>}
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
