import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Eye, Flag, Heart, Star, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import FollowButton from '../components/ui/FollowButton'
import ChapterListItem from '../components/ui/ChapterListItem'
import { avatarPlaceholder, bannerPlaceholder, coverPlaceholder } from '../utils/placeholders'
import { countSeriesSubscribers, getSeriesBySlug, incrementSeriesViews, listSeriesChapters, reportSeries } from '../api/series'
import { countSeriesLikes, hasLikedSeries, likeSeries, unlikeSeries } from '../api/likes'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL = { ongoing: 'En cours', paused: 'En pause', completed: 'Terminé' }

export default function SeriesDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [seriesItem, setSeriesItem] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [subscribers, setSubscribers] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [sortDesc, setSortDesc] = useState(true)
  const [tab, setTab] = useState('chapters')
  const [error, setError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    getSeriesBySlug(slug)
      .then((s) => {
        setSeriesItem(s)
        incrementSeriesViews(s.id)
        countSeriesSubscribers(s.id).then(setSubscribers)
        countSeriesLikes(s.id).then(setLikeCount)
        listSeriesChapters(s.id).then(setChapters)
        if (user) hasLikedSeries(user.id, s.id).then(setLiked)
      })
      .catch((e) => setError(e.message))
  }, [slug, user])

  async function toggleLike() {
    if (!user || !seriesItem) return
    if (liked) {
      await unlikeSeries(user.id, seriesItem.id)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await likeSeries(user.id, seriesItem.id)
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Série introuvable.</p>
      </Layout>
    )
  }

  if (!seriesItem || !chapters) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportSeries({ seriesId: seriesItem.id, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  const author = seriesItem.author
  const sortedChapters = sortDesc ? [...chapters].reverse() : chapters
  const firstChapter = chapters[0]
  const cover = seriesItem.cover_url || coverPlaceholder({ seed: seriesItem.id, title: seriesItem.title })
  const banner = seriesItem.banner_url || bannerPlaceholder({ seed: `${seriesItem.id}-banner` })

  return (
    <Layout>
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden sm:h-64">
          <img src={banner} alt="" className="h-full w-full object-cover" />
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
            src={cover}
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
              <Badge variant={seriesItem.status === 'completed' ? 'free' : 'neutral'}>
                {STATUS_LABEL[seriesItem.status]}
              </Badge>
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-zinc-50 sm:text-2xl">{seriesItem.title}</h1>
            <Link to={`/profil/${author.username}`} className="text-sm text-zinc-400 hover:text-accent">
              par {author.display_name}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Star size={15} className="fill-accent text-accent" /> {seriesItem.rating}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={15} /> {subscribers.toLocaleString('fr-FR')}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={15} /> {seriesItem.views.toLocaleString('fr-FR')}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={15} /> {chapters.length} chapitres
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{seriesItem.summary}</p>

        <div className="mt-4 flex gap-2">
          {firstChapter && (
            <Link
              to={`/serie/${slug}/chapitre/${firstChapter.id}`}
              className="flex-1 rounded-full bg-white/10 px-5 py-2.5 text-center text-sm font-bold text-zinc-100 hover:bg-white/15 sm:flex-none"
            >
              Commencer la lecture
            </Link>
          )}
          <FollowButton targetType="series" targetId={seriesItem.id} />
          <button
            type="button"
            onClick={toggleLike}
            disabled={!user}
            aria-label="Aimer cette série"
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold ${
              liked ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <Heart size={15} className={liked ? 'fill-accent' : ''} />
            {likeCount}
          </button>
        </div>

        <div className="mt-6 flex gap-5 border-b border-white/5 text-sm font-semibold">
          {[
            { id: 'chapters', label: `Chapitres (${chapters.length})` },
            { id: 'about', label: 'À propos' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-2.5 ${
                tab === t.id ? 'border-accent text-accent' : 'border-transparent text-zinc-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'chapters' ? (
          <div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs text-zinc-500">Mise à jour : {seriesItem.update_day}</span>
              <button
                type="button"
                onClick={() => setSortDesc((v) => !v)}
                className="text-xs font-semibold text-zinc-400 hover:text-accent"
              >
                {sortDesc ? "Plus récent d'abord" : "Chapitre 1 d'abord"}
              </button>
            </div>
            <div>
              {sortedChapters.map((c) => (
                <ChapterListItem key={c.id} seriesSlug={slug} chapter={c} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-5">
            <Link to={`/profil/${author.username}`} className="flex items-center gap-3">
              <img
                src={author.avatar_url || avatarPlaceholder({ seed: author.id, name: author.display_name })}
                alt={author.display_name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-zinc-100">{author.display_name}</p>
              </div>
            </Link>

            {user && user.id !== author.id && (
              <div className="mt-5 border-t border-white/5 pt-3">
                {reportSent ? (
                  <p className="text-xs text-emerald-400">Signalement envoyé, merci.</p>
                ) : reportOpen ? (
                  <div className="space-y-2">
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Pourquoi signaler cette série ?"
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleReport}
                      className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400"
                    >
                      Envoyer le signalement
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-400"
                  >
                    <Flag size={13} /> Signaler cette série
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
