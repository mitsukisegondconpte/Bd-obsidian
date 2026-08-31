import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { useAuth } from '../context/AuthContext'
import { listMySubscribedSeries } from '../api/purchases'

export default function Library() {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(null)

  useEffect(() => {
    if (user) listMySubscribedSeries(user.id).then(setSubscribed)
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
            <div className="flex flex-col items-center gap-2 py-20 text-center text-zinc-500">
              <p>Tu n'es abonné à aucune série pour le moment.</p>
            </div>
          )
        )}
      </div>
    </Layout>
  )
}
