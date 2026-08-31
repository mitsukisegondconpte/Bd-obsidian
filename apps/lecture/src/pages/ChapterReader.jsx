import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  List,
  Lock,
  MessageCircle,
  Share2,
} from 'lucide-react'
import CommentItem from '../components/ui/CommentItem'
import { pagePlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import { getChapter, getSeriesBySlug, listChapterPages, listSeriesChapters } from '../api/series'
import { countCommentLikes, createComment, hasLikedComment, likeComment, listComments, unlikeComment } from '../api/comments'
import { countChapterLikes, hasLikedChapter, likeChapter, unlikeChapter } from '../api/likes'
import { hasPurchasedChapter, purchaseChapter } from '../api/purchases'
import { recordStreakActivity } from '../api/streaks'

export default function ChapterReader() {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [seriesItem, setSeriesItem] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [chapterPages, setChapterPages] = useState(null)
  const [purchased, setPurchased] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLikes, setCommentLikes] = useState({})
  const [replyTarget, setReplyTarget] = useState(null)

  const [showChapterList, setShowChapterList] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSeriesBySlug(slug)
      .then((s) => {
        setSeriesItem(s)
        listSeriesChapters(s.id).then(setChapters)
      })
      .catch((e) => setError(e.message))
  }, [slug])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    getChapter(chapterId)
      .then(setChapter)
      .catch((e) => setError(e.message))
    listChapterPages(chapterId).then(setChapterPages)
    countChapterLikes(chapterId).then(setLikeCount)
  }, [chapterId])

  useEffect(() => {
    let cancelled = false
    listComments(chapterId).then(async (data) => {
      if (cancelled) return
      setComments(data)
      const entries = await Promise.all(
        data.map(async (c) => {
          const count = await countCommentLikes(c.id)
          const liked = user ? await hasLikedComment(user.id, c.id) : false
          return [c.id, { count, liked }]
        })
      )
      if (!cancelled) setCommentLikes(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [chapterId, user])

  useEffect(() => {
    if (!user || !chapter) return
    if (!chapter.is_free) hasPurchasedChapter(user.id, chapter.id).then(setPurchased)
    hasLikedChapter(user.id, chapter.id).then(setLiked)
    recordStreakActivity('reading').catch(() => {})
  }, [user, chapter])

  useEffect(() => {
    let lastY = window.scrollY
    function onScroll() {
      const y = window.scrollY
      setChromeVisible(y < lastY || y < 40)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const pages = useMemo(() => {
    if (!chapter) return []
    if (chapterPages?.length) {
      return chapterPages.map((p) => ({ id: p.id, url: p.image_url }))
    }
    return Array.from({ length: chapter.page_count }, (_, i) => ({
      id: `${chapter.id}-p${i + 1}`,
      url: pagePlaceholder({ seed: chapter.id, page: i + 1, total: chapter.page_count }),
    }))
  }, [chapter, chapterPages])

  async function toggleLike() {
    if (!user) return navigate('/connexion')
    if (liked) {
      await unlikeChapter(user.id, chapter.id)
      setLiked(false)
      setLikeCount((n) => n - 1)
    } else {
      await likeChapter(user.id, chapter.id)
      setLiked(true)
      setLikeCount((n) => n + 1)
    }
  }

  async function handleUnlock() {
    if (!user) return navigate('/connexion')
    setUnlocking(true)
    try {
      await purchaseChapter({ userId: user.id, chapterId: chapter.id, amountCents: chapter.price_cents })
      setPurchased(true)
    } finally {
      setUnlocking(false)
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!user) return navigate('/connexion')
    if (!newComment.trim()) return
    const created = await createComment({
      userId: user.id,
      chapterId: chapter.id,
      body: newComment.trim(),
      parentCommentId: replyTarget?.id ?? null,
    })
    setComments((c) => [created, ...c])
    setCommentLikes((s) => ({ ...s, [created.id]: { count: 0, liked: false } }))
    setNewComment('')
    setReplyTarget(null)
  }

  async function toggleCommentLike(commentId) {
    if (!user) return navigate('/connexion')
    const current = commentLikes[commentId] ?? { count: 0, liked: false }
    if (current.liked) {
      await unlikeComment(user.id, commentId)
      setCommentLikes((s) => ({ ...s, [commentId]: { count: current.count - 1, liked: false } }))
    } else {
      await likeComment(user.id, commentId)
      setCommentLikes((s) => ({ ...s, [commentId]: { count: current.count + 1, liked: true } }))
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-0 text-zinc-300">
        <p>Chapitre introuvable.</p>
        <Link to="/" className="text-accent underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  if (!seriesItem || !chapters || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0 text-zinc-500">Chargement...</div>
    )
  }

  const topLevelComments = comments.filter((c) => !c.parent_comment_id)
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_comment_id) {
      if (!acc[c.parent_comment_id]) acc[c.parent_comment_id] = []
      acc[c.parent_comment_id].push(c)
    }
    return acc
  }, {})

  const chapterIndex = chapters.findIndex((c) => c.id === chapter.id)
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null
  const isLocked = !chapter.is_free && !purchased

  return (
    <div className="min-h-screen bg-black">
      <header
        className={`fixed inset-x-0 top-0 z-30 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent px-3 py-3 transition-transform duration-300 ${
          chromeVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate(`/serie/${slug}`)}
          aria-label="Retour à la série"
          className="rounded-full bg-black/40 p-1.5 text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 text-white">
          <p className="truncate text-sm font-bold">{seriesItem.title}</p>
          <p className="truncate text-xs text-zinc-300">
            Chapitre {chapter.number} — {chapter.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowChapterList(true)}
          aria-label="Liste des chapitres"
          className="rounded-full bg-black/40 p-1.5 text-white"
        >
          <List size={20} />
        </button>
      </header>

      <div className="mx-auto max-w-2xl pt-14">
        {isLocked ? (
          <PaywallGate chapter={chapter} onUnlock={handleUnlock} unlocking={unlocking} loggedIn={Boolean(user)} />
        ) : (
          <div className="flex flex-col">
            {pages.map((page, i) => (
              <img
                key={page.id}
                src={page.url}
                alt={`${seriesItem.title} — chapitre ${chapter.number}, page ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                className="w-full"
              />
            ))}
          </div>
        )}
      </div>

      {!isLocked && (
        <>
          <div className="mx-auto max-w-2xl border-t border-white/10 bg-surface-1 px-4 py-6">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={toggleLike}
                aria-label={liked ? 'Retirer le like' : 'Aimer ce chapitre'}
                className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                  liked ? 'text-pink-400' : 'text-zinc-400'
                }`}
              >
                <Heart size={22} className={liked ? 'fill-pink-400' : ''} />
                {likeCount}
              </button>
              <a
                href="#comments"
                aria-label="Voir les commentaires"
                className="flex flex-col items-center gap-1 text-xs font-semibold text-zinc-400"
              >
                <MessageCircle size={22} />
                {comments.length}
              </a>
              <button type="button" className="flex flex-col items-center gap-1 text-xs font-semibold text-zinc-400">
                <Share2 size={22} />
                Partager
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <NavButton to={prevChapter && `/serie/${slug}/chapitre/${prevChapter.id}`} direction="prev" chapter={prevChapter} />
              <NavButton to={nextChapter && `/serie/${slug}/chapitre/${nextChapter.id}`} direction="next" chapter={nextChapter} />
            </div>
          </div>

          <section id="comments" className="mx-auto max-w-2xl bg-surface-1 px-4 pb-24 pt-2 sm:pb-10">
            <h2 className="border-t border-white/5 pt-4 text-sm font-bold text-zinc-100">
              Commentaires ({comments.length})
            </h2>
            {user ? (
              <form onSubmit={handleComment} className="mt-1 border-b border-white/5 pb-4">
                {replyTarget && (
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      Réponse à <span className="font-semibold text-zinc-300">{replyTarget.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      Annuler
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTarget ? `Répondre à ${replyTarget.name}...` : 'Ajouter un commentaire...'}
                    className="flex-1 rounded-full border border-white/10 bg-surface-2 px-3.5 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                  />
                  <button type="submit" className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-ink">
                    Publier
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-2 border-b border-white/5 pb-4 text-sm text-zinc-500">
                <Link to="/connexion" className="font-semibold text-accent">
                  Connecte-toi
                </Link>{' '}
                pour commenter.
              </p>
            )}
            <div className="divide-y divide-white/5">
              {topLevelComments.map((c) => (
                <div key={c.id}>
                  <CommentItem
                    comment={c}
                    liked={commentLikes[c.id]?.liked}
                    likeCount={commentLikes[c.id]?.count ?? 0}
                    onToggleLike={() => toggleCommentLike(c.id)}
                    onReply={
                      user
                        ? () => setReplyTarget({ id: c.id, name: c.user?.display_name ?? 'Lecteur' })
                        : undefined
                    }
                  />
                  {repliesByParent[c.id]
                    ?.slice()
                    .reverse()
                    .map((r) => (
                      <CommentItem
                        key={r.id}
                        comment={r}
                        isReply
                        liked={commentLikes[r.id]?.liked}
                        likeCount={commentLikes[r.id]?.count ?? 0}
                        onToggleLike={() => toggleCommentLike(r.id)}
                      />
                    ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {showChapterList && (
        <ChapterListSheet
          chapters={chapters}
          currentChapterId={chapter.id}
          slug={slug}
          onClose={() => setShowChapterList(false)}
        />
      )}
    </div>
  )
}

function NavButton({ to, direction, chapter }) {
  const isPrev = direction === 'prev'
  if (!to) {
    return (
      <div className="flex items-center justify-center gap-1 rounded-xl bg-surface-2/50 px-3 py-3 text-sm font-semibold text-zinc-600">
        {isPrev ? 'Premier chapitre' : 'Dernier chapitre'}
      </div>
    )
  }
  return (
    <Link
      to={to}
      className={`flex items-center gap-1 rounded-xl bg-surface-2 px-3 py-3 text-sm font-semibold text-zinc-100 hover:bg-surface-3 ${
        isPrev ? 'justify-start' : 'justify-end'
      }`}
    >
      {isPrev && <ChevronLeft size={18} />}
      <span className="truncate">
        {isPrev ? 'Précédent' : 'Suivant'} · Ch. {chapter.number}
      </span>
      {!isPrev && <ChevronRight size={18} />}
    </Link>
  )
}

function PaywallGate({ chapter, onUnlock, unlocking, loggedIn }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/30">
        <Lock size={26} className="text-accent" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Chapitre payant</h2>
        <p className="mt-1 max-w-xs text-sm text-zinc-400">
          Débloque « {chapter.title} » pour {chapter.price_cents / 100} HTG et continue l'histoire.
        </p>
      </div>
      <button
        type="button"
        onClick={onUnlock}
        disabled={unlocking}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
      >
        {!loggedIn
          ? 'Se connecter pour débloquer'
          : unlocking
            ? 'Déblocage...'
            : `Débloquer pour ${chapter.price_cents / 100} HTG`}
      </button>
      <p className="text-xs text-zinc-600">Paiement simulé — aucune transaction réelle</p>
    </div>
  )
}

function ChapterListSheet({ chapters, currentChapterId, slug, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface-1 p-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-zinc-100">Chapitres</h3>
          <button type="button" onClick={onClose} className="text-sm text-zinc-400">
            Fermer
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {chapters.map((c) => (
            <Link
              key={c.id}
              to={`/serie/${slug}/chapitre/${c.id}`}
              onClick={onClose}
              className={`flex items-center justify-between py-3 text-sm ${
                c.id === currentChapterId ? 'text-accent' : 'text-zinc-200'
              }`}
            >
              <span>
                Ch. {c.number} — {c.title}
              </span>
              {!c.is_free && <Lock size={14} className="text-zinc-500" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
