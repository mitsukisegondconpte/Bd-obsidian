import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { useAuth } from '../context/AuthContext'
import { listSeriesByAuthor } from '../api/series'

export default function MySeries() {
  const { user } = useAuth()
  const [series, setSeries] = useState(null)

  useEffect(() => {
    if (!user) return
    listSeriesByAuthor(user.id).then(setSeries)
  }, [user])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Connecte-toi pour accéder à ton panel auteur.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-zinc-50">Mes séries</h1>
          <Link
            to="/creer-serie"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink hover:bg-accent-dark"
          >
            <Plus size={15} /> Nouvelle série
          </Link>
        </div>

        {series === null ? (
          <p className="mt-8 text-sm text-zinc-500">Chargement...</p>
        ) : series.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <p className="text-zinc-500">Tu n'as pas encore publié de série.</p>
            <Link to="/creer-serie" className="text-sm font-semibold text-accent">
              Créer ta première série
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 pb-10 sm:grid-cols-3 md:grid-cols-4">
            {series.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <SeriesCard item={s} />
                <Link
                  to={`/serie/${s.slug}/ajouter-chapitre`}
                  className="block rounded-full border border-white/10 bg-surface-2 px-2.5 py-1 text-center text-xs font-semibold text-zinc-300 hover:border-accent/40 hover:text-accent"
                >
                  + Chapitre
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
