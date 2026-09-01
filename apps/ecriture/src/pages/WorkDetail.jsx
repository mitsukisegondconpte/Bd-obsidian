import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Bookmark, Flag, Heart, Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import FollowButton from '../components/ui/FollowButton'
import { bookCoverPlaceholder } from '../utils/placeholders'
import { getReadingProgress, getWork, listWorkChapters, reportWork } from '../api/works'
import { addWorkToList, listMyReadingLists, removeWorkFromList } from '../api/readingLists'
import { countWorkLikes, hasLikedWork, likeWork, unlikeWork } from '../api/likes'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'

export default function WorkDetail() {
  const { workId } = useParams()
  const { user } = useAuth()
  const [work, setWork] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [resumeChapterId, setResumeChapterId] = useState(null)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [error, setError] = useState('')
  const [lists, setLists] = useState(null)
  const [showListMenu, setShowListMenu] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    getWork(workId)
      .then(setWork)
      .catch((e) => setError(e.message))
    listWorkChapters(workId).then(setChapters)
    countWorkLikes(workId).then(setLikeCount)
  }, [workId])

  useEffect(() => {
    if (user) getReadingProgress(user.id, workId).then(setResumeChapterId)
    if (user) listMyReadingLists(user.id).then(setLists)
    if (user) hasLikedWork(user.id, workId).then(setLiked)
  }, [user, workId])

  async function toggleLike() {
    if (!user) return
    if (liked) {
      await unlikeWork(user.id, workId)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await likeWork(user.id, workId)
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  async function toggleInList(list) {
    const inList = list.reading_list_items.some((it) => it.work_id === workId)
    if (inList) {
      await removeWorkFromList({ listId: list.id, workId })
    } else {
      await addWorkToList({ listId: list.id, workId })
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === list.id
          ? {
              ...l,
              reading_list_items: inList
                ? l.reading_list_items.filter((it) => it.work_id !== workId)
                : [...l.reading_list_items, { work_id: workId, work }],
            }
          : l
      )
    )
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportWork({ workId: work.id, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Œuvre introuvable.</p>
      </Layout>
    )
  }

  if (!work) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  const cover = work.cover?.image_url || bookCoverPlaceholder({ seed: work.id, title: work.title })
  const firstChapter = chapters?.[0]
  const isOwner = user?.id === work.author_id

  return (
    <Layout>
      <div className="relative">
        <div className="relative h-40 w-full overflow-hidden sm:h-56">
          <img src={cover} alt="" className="h-full w-full scale-110 object-cover blur-2xl brightness-50" />
        </div>
        <Link to="/" aria-label="Retour" className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white">
          <ArrowLeft size={20} />
        </Link>

        <div className="relative -mt-20 flex gap-4 px-4 sm:-mt-24 sm:px-6">
          <img
            src={cover}
            alt={work.title}
            className="h-36 w-24 shrink-0 rounded-lg object-cover ring-2 ring-surface-0 sm:h-44 sm:w-32"
          />
          <div className="min-w-0 flex-1 pt-16 sm:pt-20">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="neutral">{work.work_type === 'light_novel' ? 'Light novel' : 'Roman'}</Badge>
              <Badge variant="free">Gratuit</Badge>
              {work.tags?.map((t) => (
                <Badge key={t} variant="neutral">
                  #{t}
                </Badge>
              ))}
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold text-zinc-50 sm:text-2xl">{work.title}</h1>
            <Link to={`/profil/${work.author?.username}`} className="text-sm text-zinc-400 hover:text-accent">
              par {work.author?.display_name}
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{work.synopsis}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {firstChapter && (
            <Link
              to={`/oeuvre/${work.id}/chapitre/${resumeChapterId ?? firstChapter.id}`}
              className="flex-1 rounded-full bg-white/10 px-5 py-2.5 text-center text-sm font-bold text-zinc-100 hover:bg-white/15 sm:flex-none"
            >
              {resumeChapterId ? 'Reprendre la lecture' : 'Commencer la lecture'}
            </Link>
          )}
          <FollowButton authorId={work.author_id} />
          <button
            type="button"
            onClick={toggleLike}
            disabled={!user}
            aria-label="Aimer cette œuvre"
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold ${
              liked ? 'border-accent/40 bg-accent/10 text-accent' : 'border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <Heart size={15} className={liked ? 'fill-accent' : ''} />
            {likeCount}
          </button>
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowListMenu((v) => !v)}
                aria-label="Ajouter à une liste de lecture"
                className={`rounded-full border px-4 py-2.5 text-sm font-bold ${
                  lists?.some((l) => l.reading_list_items.some((it) => it.work_id === workId))
                    ? 'border-accent/40 text-accent'
                    : 'border-white/10 text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Bookmark size={16} />
              </button>
              {showListMenu && (
                <div
                  className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-surface-1 p-2 shadow-xl"
                  onMouseLeave={() => setShowListMenu(false)}
                >
                  {lists?.length ? (
                    lists.map((l) => {
                      const inList = l.reading_list_items.some((it) => it.work_id === workId)
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => toggleInList(l)}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-zinc-200 hover:bg-surface-2"
                        >
                          <span className="truncate">{l.name}</span>
                          {inList && <span className="text-accent">✓</span>}
                        </button>
                      )
                    })
                  ) : (
                    <p className="px-2.5 py-2 text-xs text-zinc-500">Aucune liste pour l'instant.</p>
                  )}
                  <Link
                    to="/mes-listes"
                    onClick={() => setShowListMenu(false)}
                    className="mt-1 block rounded-lg px-2.5 py-2 text-sm font-semibold text-accent hover:bg-surface-2"
                  >
                    + Créer une liste
                  </Link>
                </div>
              )}
            </div>
          )}
          {isOwner && (
            <Link
              to={`/oeuvre/${work.id}/nouveau-chapitre`}
              className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-bold text-accent hover:bg-accent/10"
            >
              + Chapitre
            </Link>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-b border-white/5 pb-2">
          <h2 className="text-sm font-bold text-zinc-100">Chapitres ({chapters?.filter((c) => !c.is_draft).length ?? 0})</h2>
        </div>

        <div>
          {chapters
            ?.filter((c) => !c.is_draft || isOwner)
            .map((c) => (
              <Link
                key={c.id}
                to={`/oeuvre/${work.id}/chapitre/${c.id}`}
                className="flex items-center justify-between gap-3 border-b border-white/5 px-1 py-3.5 hover:bg-surface-2/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">Chapitre {c.number}</span>
                    {c.is_draft && <Badge variant="draft">Brouillon</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-zinc-400">{c.title}</p>
                </div>
                <BookOpen size={16} className="shrink-0 text-zinc-600" />
              </Link>
            ))}
          {chapters && chapters.filter((c) => !c.is_draft || isOwner).length === 0 && (
            <p className="flex items-center gap-2 py-6 text-sm text-zinc-500">
              <Lock size={14} /> Aucun chapitre publié pour l'instant.
            </p>
          )}
        </div>

        {user && !isOwner && (
          <div className="border-t border-white/5 pb-6 pt-3">
            {reportSent ? (
              <p className="text-xs text-emerald-400">Signalement envoyé, merci.</p>
            ) : reportOpen ? (
              <div className="space-y-2">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Pourquoi signaler cette œuvre ?"
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
                <Flag size={13} /> Signaler cette œuvre
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
