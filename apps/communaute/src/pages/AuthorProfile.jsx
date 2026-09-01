import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, BookOpen, ExternalLink, Feather } from 'lucide-react'
import Layout from '../components/layout/Layout'
import FollowButton from '../components/ui/FollowButton'
import StreaksAndBadges from '../components/ui/StreaksAndBadges'
import { useAuth } from '../context/AuthContext'
import { avatarPlaceholder } from '../utils/placeholders'
import { countFollowers, getCrossPlatformWorks, getProfileByUsername } from '../api/profiles'
import { listMyChannels } from '../api/channels'
import Loader from '../components/ui/Loader'

const LECTURE_URL = 'https://bd-obsidian-lecture.vercel.app'
const ECRITURE_URL = 'https://bd-obsidian-ecriture.vercel.app'

export default function AuthorProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [cross, setCross] = useState({ series: [], works: [], communities: [] })
  const [channels, setChannels] = useState([])
  const [followers, setFollowers] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfileByUsername(username)
      .then((p) => {
        setProfile(p)
        getCrossPlatformWorks(p.id).then(setCross)
        listMyChannels(p.id).then(setChannels)
        countFollowers(p.id).then(setFollowers)
      })
      .catch((e) => setError(e.message))
  }, [username])

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Profil introuvable.</p>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  const avatar = profile.avatar_url || avatarPlaceholder({ seed: profile.id, name: profile.display_name })

  return (
    <Layout>
      <div className="px-4 pt-8 sm:px-6">
        <div className="flex items-end justify-between">
          <img src={avatar} alt={profile.display_name} className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28" />
          {user?.id === profile.id ? (
            <Link
              to="/profil/modifier"
              className="mb-2 rounded-full border border-white/10 bg-surface-2 px-4 py-1.5 text-sm font-bold text-zinc-200 hover:border-accent/40"
            >
              Modifier le profil
            </Link>
          ) : (
            <FollowButton authorId={profile.id} className="mb-2" />
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h1 className="text-xl font-extrabold text-zinc-50 sm:text-2xl">{profile.display_name}</h1>
          {profile.is_author && <BadgeCheck size={19} className="text-accent" fill="currentColor" stroke="#0c0709" />}
        </div>
        <p className="text-sm text-zinc-500">@{profile.username}</p>

        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{followers.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">abonnés</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{cross.series.length + cross.works.length}</strong>{' '}
            <span className="text-zinc-500">œuvres</span>
          </span>
        </div>

        {profile.bio && <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">{profile.bio}</p>}

        <StreaksAndBadges userId={profile.id} />

        {/* Vitrine cross-plateforme : même compte, même base, contenu des 2 autres apps affiché ici */}
        {(cross.series.length > 0 || cross.works.length > 0) && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Œuvres sur Hypercube</h2>
            <div className="space-y-2">
              {cross.series.map((s) => (
                <a
                  key={s.id}
                  href={`${LECTURE_URL}/serie/${s.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 hover:border-accent/30"
                >
                  <span className="flex items-center gap-2 text-sm text-zinc-200">
                    <BookOpen size={14} className="text-accent" /> {s.title}
                    <span className="text-xs text-zinc-600">— BD/webtoon</span>
                  </span>
                  <ExternalLink size={13} className="text-zinc-600" />
                </a>
              ))}
              {cross.works.map((w) => (
                <a
                  key={w.id}
                  href={`${ECRITURE_URL}/oeuvre/${w.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 hover:border-accent/30"
                >
                  <span className="flex items-center gap-2 text-sm text-zinc-200">
                    <Feather size={14} className="text-accent" /> {w.title}
                    <span className="text-xs text-zinc-600">— {w.work_type === 'light_novel' ? 'Light novel' : 'Roman'}</span>
                  </span>
                  <ExternalLink size={13} className="text-zinc-600" />
                </a>
              ))}
            </div>
          </section>
        )}

        {cross.communities.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Communautés créées</h2>
            <div className="space-y-2">
              {cross.communities.map((c) => (
                <Link
                  key={c.id}
                  to={`/communaute/${c.id}`}
                  className="block rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 text-sm text-zinc-200 hover:border-accent/30"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {channels.length > 0 && (
          <section className="mt-6 pb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Canaux</h2>
            {channels.map((c) => (
              <a
                key={c.id}
                href={`/canal/${c.id}`}
                className="block rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 text-sm text-zinc-200 hover:border-accent/30"
              >
                {c.name}
              </a>
            ))}
          </section>
        )}
      </div>
    </Layout>
  )
}
