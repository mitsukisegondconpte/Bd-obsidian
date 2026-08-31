import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Eye, Star, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import SubscribeButton from '../components/ui/SubscribeButton'
import ChapterListItem from '../components/ui/ChapterListItem'
import { findAuthorById, findSeriesBySlug } from '../data/mockData'

export default function SeriesDetail() {
  const { slug } = useParams()
  const seriesItem = findSeriesBySlug(slug)
  const [sortDesc, setSortDesc] = useState(true)
  const [tab, setTab] = useState('chapters')

  if (!seriesItem) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Série introuvable.</p>
      </Layout>
    )
  }

  const author = findAuthorById(seriesItem.authorId)
  const chapters = sortDesc ? [...seriesItem.chapters].reverse() : seriesItem.chapters
  const firstChapter = seriesItem.chapters[0]

  return (
    <Layout>
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <img src={seriesItem.banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/60 to-black/30" />
        </div>
        <Link
          to="/"
          aria-label="Retour"
          className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="relative -mt-20 flex gap-4 px-4 sm:-mt-24 sm:px-6">
          <img
            src={seriesItem.cover}
            alt={seriesItem.title}
            className="h-36 w-24 shrink-0 rounded-lg object-cover ring-2 ring-surface-0 sm:h-44 sm:w-32"
          />
          <div className="min-w-0 flex-1 pt-16 sm:pt-20">
            <div className="flex flex-wrap gap-1.5">
              {seriesItem.genres.map((g) => (
                <Badge key={g} variant="neutral">
                  {g}
                </Badge>
              ))}
              <Badge variant={seriesItem.status === 'Terminé' ? 'free' : 'neutral'}>{seriesItem.status}</Badge>
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-zinc-50 sm:text-2xl">{seriesItem.title}</h1>
            <Link to={`/profil/${author.id}`} className="text-sm text-zinc-400 hover:text-brand-yellow">
              par {author.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Star size={15} className="fill-brand-yellow text-brand-yellow" /> {seriesItem.rating}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} /> {seriesItem.subscribers.toLocaleString('fr-FR')}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={15} /> {seriesItem.views.toLocaleString('fr-FR')}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} /> {seriesItem.chapters.length} chapitres
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{seriesItem.summary}</p>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/serie/${slug}/chapitre/${firstChapter.id}`}
            className="flex-1 rounded-full bg-white/10 px-5 py-2.5 text-center text-sm font-bold text-zinc-100 hover:bg-white/15 sm:flex-none"
          >
            Commencer la lecture
          </Link>
          <SubscribeButton />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-5 border-b border-white/5 text-sm font-semibold">
          {[
            { id: 'chapters', label: `Chapitres (${seriesItem.chapters.length})` },
            { id: 'about', label: "À propos" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-2.5 ${
                tab === t.id ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-zinc-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'chapters' ? (
          <div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs text-zinc-500">Mise à jour : {seriesItem.updateDay}</span>
              <button
                type="button"
                onClick={() => setSortDesc((v) => !v)}
                className="text-xs font-semibold text-zinc-400 hover:text-brand-yellow"
              >
                {sortDesc ? 'Plus récent d\'abord' : 'Chapitre 1 d\'abord'}
              </button>
            </div>
            <div>
              {chapters.map((c) => (
                <ChapterListItem key={c.id} seriesSlug={slug} chapter={c} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-5">
            <Link to={`/profil/${author.id}`} className="flex items-center gap-3">
              <img src={author.avatar} alt={author.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-zinc-100">{author.name}</p>
                <p className="text-xs text-zinc-500">{author.followers.toLocaleString('fr-FR')} abonnés</p>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">{author.bio}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
