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

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative">
        <Link to={`/serie/${heroSeries.slug}`} className="block">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] sm:rounded-b-2xl">
            <img
              src={heroSeries.banner}
              alt={heroSeries.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="flex gap-1.5">
                <Badge variant="hot">Série vedette</Badge>
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-white text-balance sm:text-4xl">
                {heroSeries.title}
              </h1>
              <p className="mt-1 line-clamp-2 max-w-lg text-sm text-zinc-300 sm:text-base">
                {heroSeries.summary}
              </p>
              <div className="mt-3 flex items-center gap-3 text-sm text-zinc-300">
                <span className="flex items-center gap-1 font-semibold text-brand-yellow">
                  <Star size={14} className="fill-brand-yellow" /> {heroSeries.rating}
                </span>
                <span>{heroSeries.subscribers.toLocaleString('fr-FR')} abonnés</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <div className="space-y-8 px-4 pt-6 sm:px-6">
        {/* Genres pills */}
        <section>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                className="shrink-0 rounded-full border border-white/10 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-brand-yellow/40 hover:text-brand-yellow"
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

        {/* Populaires — grille complète */}
        <section>
          <SectionHeader title="Populaires" subtitle="Sélectionnées pour toi" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
            {series.map((s) => (
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
              className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 text-center text-zinc-500 hover:text-brand-yellow"
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
