import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import FollowButton from '../components/ui/FollowButton'
import { avatarPlaceholder, bannerPlaceholder } from '../utils/placeholders'
import { countFollowers, getProfileByUsername } from '../api/profiles'
import { listSeriesByAuthor } from '../api/series'

export default function AuthorProfile() {
  const { username } = useParams()
  const [author, setAuthor] = useState(null)
  const [authorSeries, setAuthorSeries] = useState([])
  const [followers, setFollowers] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfileByUsername(username)
      .then((a) => {
        setAuthor(a)
        listSeriesByAuthor(a.id).then(setAuthorSeries)
        countFollowers(a.id).then(setFollowers)
      })
      .catch((e) => setError(e.message))
  }, [username])

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Auteur introuvable.</p>
      </Layout>
    )
  }

  if (!author) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  const avatar = author.avatar_url || avatarPlaceholder({ seed: author.id, name: author.display_name })
  const banner = bannerPlaceholder({ seed: `${author.id}-banner` })
  const totalViews = authorSeries.reduce((sum, s) => sum + s.views, 0)

  return (
    <Layout>
      <div className="relative">
        <div className="h-32 w-full overflow-hidden sm:h-44">
          <img src={banner} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 to-black/20" />
        </div>
        <Link to="/" aria-label="Retour" className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="px-4 sm:px-6">
        <div className="-mt-12 flex items-end justify-between sm:-mt-14">
          <img
            src={avatar}
            alt={author.display_name}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-surface-0 sm:h-28 sm:w-28"
          />
          <FollowButton targetType="author" targetId={author.id} className="mb-2" />
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-xl font-extrabold text-zinc-50 sm:text-2xl">{author.display_name}</h1>
          {author.is_platform_admin && (
            <BadgeCheck size={20} className="text-hypercube-500" fill="currentColor" stroke="#0b0b0e" />
          )}
        </div>
        <p className="text-sm text-zinc-500">@{author.username}</p>

        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{followers.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">abonnés</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{authorSeries.length}</strong>{' '}
            <span className="text-zinc-500">œuvres</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{totalViews.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">vues cumulées</span>
          </span>
        </div>

        {author.bio && <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">{author.bio}</p>}

        <section className="mt-6 pb-6">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight text-zinc-50">
            Œuvres de {author.display_name.split(' ')[0]}
          </h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
            {authorSeries.map((s) => (
              <SeriesCard key={s.id} item={s} />
            ))}
            {authorSeries.length === 0 && <p className="col-span-full text-sm text-zinc-500">Aucune œuvre publiée.</p>}
          </div>
        </section>
      </div>
    </Layout>
  )
}
