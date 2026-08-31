import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, List } from 'lucide-react'
import Layout from '../components/layout/Layout'
import CommentItem from '../components/ui/CommentItem'
import { getWork, getWorkChapter, listWorkChapters, saveReadingProgress } from '../api/works'
import { createComment, listComments } from '../api/comments'
import { recordStreakActivity } from '../api/streaks'
import { useAuth } from '../context/AuthContext'

export default function ChapterReader() {
  const { workId, chapterId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [work, setWork] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    getWork(workId).then(setWork)
    listWorkChapters(workId).then(setChapters)
  }, [workId])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    getWorkChapter(chapterId).then(setChapter)
    listComments(chapterId).then(setComments)
    if (user) {
      saveReadingProgress({ userId: user.id, workId, chapterId })
      recordStreakActivity('reading').catch(() => {})
    }
  }, [chapterId, workId, user])

  async function handleComment(e) {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    const created = await createComment({ userId: user.id, targetId: chapterId, body: newComment.trim() })
    setComments((c) => [created, ...c])
    setNewComment('')
  }

  if (!work || !chapter || !chapters) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  const visible = chapters.filter((c) => !c.is_draft || c.id === chapter.id)
  const index = visible.findIndex((c) => c.id === chapter.id)
  const prev = index > 0 ? visible[index - 1] : null
  const next = index >= 0 && index < visible.length - 1 ? visible[index + 1] : null

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-surface-0/95 px-3 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(`/oeuvre/${workId}`)}
          aria-label="Retour à l'oeuvre"
          className="rounded-full p-1.5 text-zinc-300 hover:bg-surface-2"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-zinc-100">{work.title}</p>
          <p className="truncate text-xs text-zinc-500">
            Chapitre {chapter.number} — {chapter.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowList(true)}
          aria-label="Liste des chapitres"
          className="rounded-full p-1.5 text-zinc-300 hover:bg-surface-2"
        >
          <List size={20} />
        </button>
      </header>

      <article className="prose-reader mx-auto max-w-2xl whitespace-pre-line px-5 py-8 text-[17px] text-zinc-200 sm:px-0 sm:text-lg">
        {chapter.content}
      </article>

      <div className="mx-auto max-w-2xl px-5 pb-6 sm:px-0">
        <div className="grid grid-cols-2 gap-3">
          <NavButton to={prev && `/oeuvre/${workId}/chapitre/${prev.id}`} label="Précédent" chapter={prev} direction="prev" />
          <NavButton to={next && `/oeuvre/${workId}/chapitre/${next.id}`} label="Suivant" chapter={next} direction="next" />
        </div>
      </div>

      <section className="mx-auto max-w-2xl border-t border-white/5 px-5 pb-24 pt-4 sm:px-0 sm:pb-10">
        <h2 className="text-sm font-bold text-zinc-100">Commentaires ({comments.length})</h2>
        {user ? (
          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="flex-1 rounded-full border border-white/10 bg-surface-2 px-3.5 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink">
              Publier
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            <Link to="/connexion" className="font-semibold text-accent">
              Connecte-toi
            </Link>{' '}
            pour commenter.
          </p>
        )}
        <div className="mt-2 divide-y divide-white/5">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      </section>

      {showList && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setShowList(false)}
        >
          <div
            className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface-1 p-4 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-zinc-100">Chapitres</h3>
              <button type="button" onClick={() => setShowList(false)} className="text-sm text-zinc-400">
                Fermer
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {visible.map((c) => (
                <Link
                  key={c.id}
                  to={`/oeuvre/${workId}/chapitre/${c.id}`}
                  onClick={() => setShowList(false)}
                  className={`block py-3 text-sm ${c.id === chapter.id ? 'text-accent' : 'text-zinc-200'}`}
                >
                  Ch. {c.number} — {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavButton({ to, chapter, direction }) {
  const isPrev = direction === 'prev'
  if (!to) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-surface-2/50 px-3 py-3 text-sm font-semibold text-zinc-600">
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
