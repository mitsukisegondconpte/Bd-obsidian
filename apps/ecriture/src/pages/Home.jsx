import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import SectionHeader from '../components/ui/SectionHeader'
import WorkCard from '../components/ui/WorkCard'
import IntroBanner from '../components/ui/IntroBanner'
import { listWorks } from '../api/works'

const POPULAR_TAGS = ['fantastique', 'romance', 'drame', 'mystère', 'lycée', 'famille', 'surnaturel']

export default function Home() {
  const [works, setWorks] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listWorks()
      .then(setWorks)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <IntroBanner>
          <h1 className="font-display max-w-md text-2xl font-extrabold text-zinc-50 sm:text-3xl">
            Écris ton roman ou ton light novel. Publie-le gratuitement.
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            N'importe qui peut créer une œuvre et la partager. Les lecteurs commentent, s'abonnent, et tu peux
            demander un accompagnement éditorial quand tu es prêt.
          </p>
        </IntroBanner>

        <section className="mt-8">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {POPULAR_TAGS.map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-full border border-white/10 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8 pb-6">
          <SectionHeader title="Dernières œuvres" subtitle="Fraîchement publiées par la communauté" to="/explorer" />

          {error && <p className="text-sm text-red-400">{error}</p>}

          {!works && !error && <p className="text-sm text-zinc-500">Chargement...</p>}

          {works && works.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              Aucune œuvre pour l'instant — sois le·la premier·ère à publier !
            </p>
          )}

          {works && works.length > 0 && (
            <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
              {works.map((w) => (
                <WorkCard key={w.id} work={w} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
