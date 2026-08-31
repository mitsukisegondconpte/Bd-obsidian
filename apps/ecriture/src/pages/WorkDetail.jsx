import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import FollowButton from '../components/ui/FollowButton'
import { bookCoverPlaceholder } from '../utils/placeholders'
import { getReadingProgress, getWork, listWorkChapters } from '../api/works'
import { useAuth } from '../context/AuthContext'

export default function WorkDetail() {
  const { workId } = useParams()
  const { user } = useAuth()
  const [work, setWork] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [resumeChapterId, setResumeChapterId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getWork(workId)
      .then(setWork)
      .catch((e) => setError(e.message))
    listWorkChapters(workId).then(setChapters)
  }, [workId])

  useEffect(() => {
    if (user) getReadingProgress(user.id, workId).then(setResumeChapterId)
  }, [user, workId])

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
        <p className="p-6 text-zinc-500">Chargement...</p>
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
      </div>
    </Layout>
  )
}
