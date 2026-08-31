import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import SectionHeader from '../components/ui/SectionHeader'
import HeroCarousel from '../components/ui/HeroCarousel'
import Badge from '../components/ui/Badge'
import { listSeries } from '../api/series'
import { listGenres } from '../api/genres'
import { avatarPlaceholder, coverPlaceholder } from '../utils/placeholders'

export default function Home() {
  const [series, setSeries] = useState(null)
  const [genres, setGenres] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    listSeries().then(setSeries).catch((e) => setError(e.message))
    listGenres().then(setGenres)
  }, [])

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Erreur : {error}</p>
      </Layout>
    )
  }

  if (!series) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  if (series.length === 0) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Aucune série publiée pour l'instant.</p>
      </Layout>
    )
  }

  const trending = [...series].sort((a, b) => b.views - a.views)
  const newest = series.filter((s) => s.isNew)
  const featured = trending.slice(0, 5)
  const [bigTile, ...restTiles] = series
  const authors = series
    .map((s) => s.author)
    .filter((a, i, arr) => a && arr.findIndex((x) => x.id === a.id) === i)

  return (
    <Layout>
      <HeroCarousel items={featured} />

      <div className="space-y-8 px-4 pt-2 sm:px-6">
        <section>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                className="shrink-0 rounded-full border border-white/10 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-accent/40 hover:text-accent"
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="En tendance" subtitle="Les séries les plus lues" to="/explorer" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {trending.map((s) => (
              <SeriesCard key={s.id} item={s} size="sm" />
            ))}
          </div>
        </section>

        {newest.length > 0 && (
          <section>
            <SectionHeader title="Nouveautés" subtitle="Fraîchement publiées" to="/explorer" />
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {newest.map((s) => (
                <SeriesCard key={`new-${s.id}`} item={s} size="sm" />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader title="Populaires" subtitle="Sélectionnées pour toi" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            <Link
              to={`/serie/${bigTile.slug}`}
              className="group relative col-span-2 row-span-2 aspect-2/3 overflow-hidden bg-surface-2 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-1deg]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)' }}
            >
              <img
                src={bigTile.cover_url || coverPlaceholder({ seed: bigTile.id, title: bigTile.title })}
                alt={bigTile.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                <Badge variant="hot">Coup de cœur</Badge>
                <h3 className="mt-1.5 text-base font-extrabold text-white sm:text-lg">{bigTile.title}</h3>
                <p className="line-clamp-1 text-xs text-zinc-300">{bigTile.genres.join(' · ')}</p>
              </div>
            </Link>

            {restTiles.map((s) => (
              <SeriesCard key={`grid-${s.id}`} item={s} />
            ))}
          </div>
        </section>

        <section className="pb-4">
          <SectionHeader title="Auteurs à suivre" />
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
            {authors.map((author) => (
              <Link
                key={author.id}
                to={`/profil/${author.username}`}
                className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
              >
                <img
                  src={author.avatar_url || avatarPlaceholder({ seed: author.id, name: author.display_name })}
                  alt={author.display_name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-surface-2"
                />
                <span className="line-clamp-1 text-xs font-semibold text-zinc-200">{author.display_name}</span>
              </Link>
            ))}
            <Link
              to="/explorer"
              className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 text-center text-zinc-500 hover:text-accent"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
                <ChevronRight size={20} />
              </div>
              <span className="text-xs font-semibold">Voir tous</span>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
