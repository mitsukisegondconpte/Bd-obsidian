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
import {
  comments as mockComments,
  currentUser,
  findSeriesBySlug,
  getChapterPages,
} from '../data/mockData'
import CommentItem from '../components/ui/CommentItem'

export default function ChapterReader() {
  const { slug, chapterId } = useParams()
  const navigate = useNavigate()
  const seriesItem = findSeriesBySlug(slug)

  const chapterIndex = seriesItem?.chapters.findIndex((c) => c.id === chapterId) ?? -1
  const chapter = seriesItem?.chapters[chapterIndex]
  const prevChapter = chapterIndex > 0 ? seriesItem.chapters[chapterIndex - 1] : null
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < (seriesItem?.chapters.length ?? 0) - 1
      ? seriesItem.chapters[chapterIndex + 1]
      : null

  const pages = useMemo(
    () => (chapter ? getChapterPages(chapter.id, chapter.pages) : []),
    [chapter],
  )

  const [liked, setLiked] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)

  // Toujours remonter en haut quand on change de chapitre.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [chapterId])

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

  if (!seriesItem || !chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-0 text-zinc-300">
        <p>Chapitre introuvable.</p>
        <Link to="/" className="text-brand-yellow underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  const isLocked = !chapter.free

  return (
    <div className="min-h-screen bg-black">
      {/* Barre supérieure — masquée quand on scrolle vers le bas */}
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

      {/* Zone de lecture — scroll vertical continu */}
      <div className="mx-auto max-w-2xl pt-14">
        {isLocked ? (
          <PaywallGate chapter={chapter} />
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
          {/* Fin de chapitre : actions + navigation */}
          <div className="mx-auto max-w-2xl border-t border-white/10 bg-surface-1 px-4 py-6">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                  liked ? 'text-pink-400' : 'text-zinc-400'
                }`}
              >
                <Heart size={22} className={liked ? 'fill-pink-400' : ''} />
                {liked ? chapter.likes + 1 : chapter.likes}
              </button>
              <a href="#comments" className="flex flex-col items-center gap-1 text-xs font-semibold text-zinc-400">
                <MessageCircle size={22} />
                {chapter.comments}
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

          {/* Commentaires */}
          <section id="comments" className="mx-auto max-w-2xl bg-surface-1 px-4 pb-24 pt-2 sm:pb-10">
            <h2 className="border-t border-white/5 pt-4 text-sm font-bold text-zinc-100">
              Commentaires ({chapter.comments})
            </h2>
            <div className="mt-1 flex items-center gap-2 border-b border-white/5 pb-4">
              <img src={currentUser.avatar} alt="Toi" className="h-8 w-8 rounded-full object-cover" />
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                className="flex-1 rounded-full border border-white/10 bg-surface-2 px-3.5 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-yellow/50 focus:outline-none"
              />
            </div>
            <div className="divide-y divide-white/5">
              {(mockComments[chapter.id] ?? mockComments.s1c1).map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
            </div>
          </section>
        </>
      )}

      {showChapterList && (
        <ChapterListSheet
          seriesItem={seriesItem}
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

function PaywallGate({ chapter }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow/10 ring-1 ring-brand-yellow/30">
        <Lock size={26} className="text-brand-yellow" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Chapitre payant</h2>
        <p className="mt-1 max-w-xs text-sm text-zinc-400">
          Débloque « {chapter.title} » pour {chapter.price} HTG et continue l'histoire.
        </p>
      </div>
      <button
        type="button"
        className="rounded-full bg-brand-yellow px-6 py-2.5 text-sm font-bold text-brand-ink hover:bg-brand-yellow-dark"
      >
        Débloquer pour {chapter.price} HTG
      </button>
      <p className="text-xs text-zinc-600">Paiement simulé — aucune transaction réelle (front-end uniquement)</p>
    </div>
  )
}

function ChapterListSheet({ seriesItem, currentChapterId, slug, onClose }) {
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
          {seriesItem.chapters.map((c) => (
            <Link
              key={c.id}
              to={`/serie/${slug}/chapitre/${c.id}`}
              onClick={onClose}
              className={`flex items-center justify-between py-3 text-sm ${
                c.id === currentChapterId ? 'text-brand-yellow' : 'text-zinc-200'
              }`}
            >
              <span>
                Ch. {c.number} — {c.title}
              </span>
              {!c.free && <Lock size={14} className="text-zinc-500" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
