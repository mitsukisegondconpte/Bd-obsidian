import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import SubscribeButton from '../components/ui/SubscribeButton'
import { findAuthorById, series as allSeries } from '../data/mockData'

export default function AuthorProfile() {
  const { authorId } = useParams()
  const author = findAuthorById(authorId)

  if (!author) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Auteur introuvable.</p>
      </Layout>
    )
  }

  const authorSeries = allSeries.filter((s) => author.seriesIds.includes(s.id))
  const totalSubscribers = authorSeries.reduce((sum, s) => sum + s.subscribers, 0)

  return (
    <Layout>
      <div className="relative">
        <div className="h-32 w-full overflow-hidden sm:h-44">
          <img src={author.banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 to-black/20" />
        </div>
        <Link to="/" aria-label="Retour" className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="px-4 sm:px-6">
        <div className="-mt-12 flex items-end justify-between sm:-mt-14">
          <img
            src={author.avatar}
            alt={author.name}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-surface-0 sm:h-28 sm:w-28"
          />
          <SubscribeButton className="mb-2" />
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-xl font-extrabold text-zinc-50 sm:text-2xl">{author.name}</h1>
          {author.verified && <BadgeCheck size={20} className="text-hypercube-500" fill="currentColor" stroke="#0b0b0e" />}
        </div>
        <p className="text-sm text-zinc-500">{author.handle}</p>

        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{author.followers.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">abonnés</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{authorSeries.length}</strong>{' '}
            <span className="text-zinc-500">œuvres</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{totalSubscribers.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">lecteurs cumulés</span>
          </span>
        </div>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">{author.bio}</p>

        <section className="mt-6 pb-6">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight text-zinc-50">
            Œuvres de {author.name.split(' ')[0]}
          </h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
            {authorSeries.map((s) => (
              <SeriesCard key={s.id} item={s} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
