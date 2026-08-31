import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { series } from '../data/mockData'

// Front-end only : on simule une bibliothèque avec un sous-ensemble des séries.
const subscribed = series.slice(0, 4)

export default function Library() {
  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Mes abonnements</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Les séries auxquelles tu es abonné apparaissent ici, avec les nouveaux chapitres en premier.
        </p>

        {subscribed.length > 0 ? (
          <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 pb-6 sm:grid-cols-4 md:grid-cols-5">
            {subscribed.map((s) => (
              <SeriesCard key={s.id} item={s} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-20 text-center text-zinc-500">
            <p>Tu n'es abonné à aucune série pour le moment.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
