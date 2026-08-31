import { Link } from 'react-router-dom'
import { Star, ChevronRight } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import SectionHeader from '../components/ui/SectionHeader'
import Badge from '../components/ui/Badge'
import { series, genres, findAuthorById } from '../data/mockData'

const featured = series.filter((s) => s.isHot).slice(0, 5)
const newest = [...series].filter((s) => s.isNew).concat(series.slice(0, 3))
const trending = [...series].sort((a, b) => b.views - a.views)
const heroSeries = featured[0]
const [bigTile, ...restTiles] = series

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pb-16 sm:pb-20">
        <Link to={`/serie/${heroSeries.slug}`} className="block">
          <div
            className="relative h-[300px] w-full overflow-hidden sm:h-[400px]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)' }}
          >
            <img src={heroSeries.banner} alt={heroSeries.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/30 to-transparent" />
          </div>

          {/* Carte flottante qui chevauche le bas du visuel */}
          <div className="relative -mt-14 px-4 sm:-mt-16 sm:px-6">
            <div className="max-w-xl rotate-[-0.6deg] rounded-xl border-l-4 border-accent bg-surface-1 p-4 shadow-2xl shadow-black/50 sm:p-6">
              <Badge variant="hot">Série vedette</Badge>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-white text-balance sm:text-4xl">
                {heroSeries.title}
              </h1>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300 sm:text-base">{heroSeries.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex items-center gap-1 font-semibold text-accent">
                  <Star size={14} className="fill-accent" /> {heroSeries.rating}
                </span>
                <span>{heroSeries.subscribers.toLocaleString('fr-FR')} abonnés</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <div className="space-y-8 px-4 pt-2 sm:px-6">
        {/* Genres pills */}
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

        {/* En tendance */}
        <section>
          <SectionHeader title="En tendance" subtitle="Les séries les plus lues cette semaine" to="/explorer" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {trending.map((s) => (
              <SeriesCard key={s.id} item={s} size="sm" />
            ))}
          </div>
        </section>

        {/* Nouveautés */}
        <section>
          <SectionHeader title="Nouveautés" subtitle="Fraîchement publiées" to="/explorer" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {newest.map((s) => (
              <SeriesCard key={`new-${s.id}`} item={s} size="sm" />
            ))}
          </div>
        </section>

        {/* Populaires — bento : une grande tuile + le reste en grille */}
        <section>
          <SectionHeader title="Populaires" subtitle="Sélectionnées pour toi" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            <Link
              to={`/serie/${bigTile.slug}`}
              className="group relative col-span-2 row-span-2 aspect-2/3 overflow-hidden bg-surface-2 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-1deg]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)' }}
            >
              <img
                src={bigTile.cover}
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

        {/* Auteurs à suivre */}
        <section className="pb-4">
          <SectionHeader title="Auteurs à suivre" />
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
            {series
              .map((s) => findAuthorById(s.authorId))
              .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
              .map((author) => (
                <Link
                  key={author.id}
                  to={`/profil/${author.id}`}
                  className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
                >
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-surface-2"
                  />
                  <span className="line-clamp-1 text-xs font-semibold text-zinc-200">{author.name}</span>
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
