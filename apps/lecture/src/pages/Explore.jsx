import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { listSeries } from '../api/series'
import { listGenres } from '../api/genres'

export default function Explore() {
  const [series, setSeries] = useState(null)
  const [genres, setGenres] = useState([])
  const [activeGenre, setActiveGenre] = useState('Tout')
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    listSeries().then(setSeries)
    listGenres().then(setGenres)
  }, [])

  const filtered = useMemo(() => {
    if (!series) return []
    let result = activeGenre === 'Tout' ? series : series.filter((s) => s.genres.includes(activeGenre))
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.author?.display_name?.toLowerCase().includes(q),
      )
    }
    return result
  }, [series, activeGenre, query])

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
            placeholder="Chercher une série, un auteur..."
            className="w-full rounded-full border border-white/10 bg-surface-2 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {['Tout', ...genres].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGenre(g)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                activeGenre === g
                  ? 'bg-accent text-accent-ink'
                  : 'border border-white/10 bg-surface-2 text-zinc-300 hover:border-accent/40'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 pb-6 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((s) => (
            <SeriesCard key={s.id} item={s} />
          ))}
          {series && filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">
              {query ? `Aucun résultat pour "${query}".` : 'Aucune série dans ce genre pour le moment.'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
