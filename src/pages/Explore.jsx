import { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import { genres, series } from '../data/mockData'

export default function Explore() {
  const [activeGenre, setActiveGenre] = useState('Tout')

  const filtered = useMemo(() => {
    if (activeGenre === 'Tout') return series
    return series.filter((s) => s.genres.includes(activeGenre))
  }, [activeGenre])

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Explorer</h1>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {['Tout', ...genres].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setActiveGenre(g)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                activeGenre === g
                  ? 'bg-brand-yellow text-brand-ink'
                  : 'border border-white/10 bg-surface-2 text-zinc-300 hover:border-brand-yellow/40'
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
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">
              Aucune série dans ce genre pour le moment.
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
