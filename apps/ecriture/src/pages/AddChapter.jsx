import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { addWorkChapter, getWork, listWorkChapters } from '../api/works'

export default function AddChapter() {
  const { workId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [work, setWork] = useState(null)
  const [nextNumber, setNextNumber] = useState(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getWork(workId).then(setWork)
    listWorkChapters(workId).then((chapters) => setNextNumber(chapters.length + 1))
  }, [workId])

  if (work && user && work.author_id !== user.id) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Seul l'auteur de cette œuvre peut y ajouter un chapitre.</p>
      </Layout>
    )
  }

  async function submit(isDraft) {
    setError('')
    setSubmitting(true)
    try {
      const chapter = await addWorkChapter({ workId, number: nextNumber, title: title.trim(), content, isDraft })
      navigate(isDraft ? `/oeuvre/${workId}` : `/oeuvre/${workId}/chapitre/${chapter.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">
          Chapitre {nextNumber} {work && `— ${work.title}`}
        </h1>

        <div className="mt-6 space-y-4">
          <input
            required
            placeholder="Titre du chapitre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <textarea
            required
            rows={16}
            placeholder="Écris ton chapitre ici..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="prose-reader w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-3 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting || !title || !content}
              onClick={() => submit(true)}
              className="flex-1 rounded-full border border-white/10 bg-surface-2 px-5 py-2.5 text-sm font-bold text-zinc-200 hover:bg-surface-3 disabled:opacity-60"
            >
              Enregistrer en brouillon
            </button>
            <button
              type="button"
              disabled={submitting || !title || !content}
              onClick={() => submit(false)}
              className="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
            >
              Publier
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
