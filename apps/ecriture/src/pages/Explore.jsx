import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    listWorks({ workType: activeType }).then(setWorks)
  }, [activeType])

  const filtered = useMemo(() => {
    if (!works) return []
    const q = query.trim().toLowerCase()
    if (!q) return works
    return works.filter(
      (w) => w.title.toLowerCase().includes(q) || w.author?.display_name?.toLowerCase().includes(q),
    )
  }, [works, query])

  function handleQueryChange(value) {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Explorer</h1>

        <div className="relative mt-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Chercher une oeuvre, un auteur..."
            className="w-full rounded-full border border-white/10 bg-surface-2 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
        </div>

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
          {filtered.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
          {works && filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">
              {query ? `Aucun résultat pour "${query}".` : 'Aucune œuvre dans cette catégorie.'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
