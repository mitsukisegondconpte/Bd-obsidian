import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { coverPlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import { listMyChapterPurchases, listMySubscribedSeries } from '../api/purchases'

export default function Library() {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(null)
  const [purchases, setPurchases] = useState(null)

  useEffect(() => {
    if (!user) return
    listMySubscribedSeries(user.id).then(setSubscribed)
    listMyChapterPurchases(user.id).then(setPurchases)
  }, [user])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <p className="text-zinc-400">
            <Link to="/connexion" className="font-semibold text-accent">
              Connecte-toi
            </Link>{' '}
            pour voir tes abonnements.
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Mes abonnements</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Les séries auxquelles tu es abonné apparaissent ici.
        </p>

        {subscribed && subscribed.length > 0 ? (
          <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 pb-6 sm:grid-cols-4 md:grid-cols-5">
            {subscribed.map((s) => (
              <SeriesCard key={s.id} item={s} />
            ))}
          </div>
        ) : (
          subscribed && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-zinc-500">
              <p>Tu n'es abonné à aucune série pour le moment.</p>
            </div>
          )
        )}

        <h2 className="mt-8 flex items-center gap-1.5 text-lg font-extrabold text-zinc-50">
          <ShoppingBag size={18} className="text-accent" /> Mes chapitres achetés
        </h2>

        <div className="mt-4 divide-y divide-white/5 pb-10">
          {purchases?.map((p) => (
            <Link
              key={p.id}
              to={`/serie/${p.chapter.series.slug}/chapitre/${p.chapter.id}`}
              className="flex items-center gap-3 py-3 hover:opacity-80"
            >
              <img
                src={p.chapter.series.cover_url || coverPlaceholder({ seed: p.chapter.id, title: p.chapter.series.title })}
                alt=""
                className="h-14 w-10 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-100">{p.chapter.series.title}</p>
                <p className="truncate text-xs text-zinc-500">
                  Chapitre {p.chapter.number} — {p.chapter.title}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold text-accent">{(p.amount_cents / 100).toFixed(0)} HTG</span>
            </Link>
          ))}
          {purchases?.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">Aucun chapitre acheté pour l'instant.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
