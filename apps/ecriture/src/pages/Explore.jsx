import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import WorkCard from '../components/ui/WorkCard'
import { listWorks } from '../api/works'

const TYPES = [
  { id: null, label: 'Tout' },
  { id: 'novel', label: 'Romans' },
  { id: 'light_novel', label: 'Light novels' },
]

export default function Explore() {
  const [activeType, setActiveType] = useState(null)
  const [works, setWorks] = useState(null)

  useEffect(() => {
    listWorks({ workType: activeType }).then(setWorks)
  }, [activeType])

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Explorer</h1>

        <div className="mt-4 flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setActiveType(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                activeType === t.id
                  ? 'bg-accent text-accent-ink'
                  : 'border border-white/10 bg-surface-2 text-zinc-300 hover:border-accent/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 pb-6 sm:grid-cols-4 md:grid-cols-5">
          {works?.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
          {works && works.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">Aucune œuvre dans cette catégorie.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
