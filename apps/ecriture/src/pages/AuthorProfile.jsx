import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ExternalLink, Hash, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import WorkCard from '../components/ui/WorkCard'
import FollowButton from '../components/ui/FollowButton'
import StreaksAndBadges from '../components/ui/StreaksAndBadges'
import { useAuth } from '../context/AuthContext'
import { avatarPlaceholder } from '../utils/placeholders'
import { countFollowers, getCrossPlatformContent, getProfileByUsername } from '../api/profiles'
import { listWorksByAuthor } from '../api/works'

const LECTURE_URL = 'https://bd-obsidian-lecture.vercel.app'
const COMMUNAUTE_URL = 'https://bd-obsidian-communaute.vercel.app'

export default function AuthorProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [works, setWorks] = useState([])
  const [cross, setCross] = useState({ series: [], communities: [], channels: [] })
  const [followers, setFollowers] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfileByUsername(username)
      .then((p) => {
        setProfile(p)
        listWorksByAuthor(p.id).then(setWorks)
        getCrossPlatformContent(p.id).then(setCross)
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
        <p className="p-6 text-zinc-500">Chargement...</p>
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

        <h1 className="mt-3 text-xl font-extrabold text-zinc-50 sm:text-2xl">{profile.display_name}</h1>
        <p className="text-sm text-zinc-500">@{profile.username}</p>

        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{followers.toLocaleString('fr-FR')}</strong>{' '}
            <span className="text-zinc-500">abonnés</span>
          </span>
          <span className="text-zinc-300">
            <strong className="text-zinc-50">{works.length}</strong> <span className="text-zinc-500">œuvres</span>
          </span>
        </div>

        {profile.bio && <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">{profile.bio}</p>}

        <StreaksAndBadges userId={profile.id} />

        <section className="mt-6 pb-6">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight text-zinc-50">Œuvres</h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
            {works.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
            {works.length === 0 && <p className="col-span-full text-sm text-zinc-500">Aucune œuvre publiée.</p>}
          </div>
        </section>

        {(cross.series.length > 0 || cross.communities.length > 0 || cross.channels.length > 0) && (
          <section className="pb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
              Sur les autres plateformes Hypercube
            </h2>
            <div className="space-y-1.5">
              {cross.series.map((s) => (
                <a
                  key={`series-${s.id}`}
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
              {cross.communities.map((c) => (
                <a
                  key={`community-${c.id}`}
                  href={`${COMMUNAUTE_URL}/communaute/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 hover:border-accent/30"
                >
                  <span className="flex items-center gap-2 text-sm text-zinc-200">
                    <Users size={14} className="text-accent" /> {c.name}
                    <span className="text-xs text-zinc-600">— Communauté</span>
                  </span>
                  <ExternalLink size={13} className="text-zinc-600" />
                </a>
              ))}
              {cross.channels.map((c) => (
                <a
                  key={`channel-${c.id}`}
                  href={`${COMMUNAUTE_URL}/canal/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 hover:border-accent/30"
                >
                  <span className="flex items-center gap-2 text-sm text-zinc-200">
                    <Hash size={14} className="text-accent" /> {c.name}
                    <span className="text-xs text-zinc-600">— Canal</span>
                  </span>
                  <ExternalLink size={13} className="text-zinc-600" />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
