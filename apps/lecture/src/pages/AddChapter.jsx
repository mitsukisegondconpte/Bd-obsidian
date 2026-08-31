import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GripVertical, Lock, Trash2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { addSeriesChapter, getSeriesBySlug, listSeriesChapters, uploadChapterPage } from '../api/series'

export default function AddChapter() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [seriesItem, setSeriesItem] = useState(null)
  const [nextNumber, setNextNumber] = useState(1)
  const [title, setTitle] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [priceCents, setPriceCents] = useState(50)
  const [pageFiles, setPageFiles] = useState([])

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState('')

  useEffect(() => {
    getSeriesBySlug(slug)
      .then((s) => {
        setSeriesItem(s)
        listSeriesChapters(s.id).then((chapters) => {
          const max = chapters.reduce((m, c) => Math.max(m, c.number), 0)
          setNextNumber(max + 1)
        })
      })
      .catch((e) => setError(e.message))
  }, [slug])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Connecte-toi pour ajouter un chapitre.</p>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Série introuvable.</p>
      </Layout>
    )
  }

  if (!seriesItem) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  if (seriesItem.author_id !== user.id) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Seul l'auteur de cette série peut ajouter un chapitre.</p>
        </div>
      </Layout>
    )
  }

  function handleFilesSelected(e) {
    const files = Array.from(e.target.files ?? [])
    setPageFiles((prev) => [...prev, ...files])
    e.target.value = ''
  }

  function removePage(index) {
    setPageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function movePage(index, direction) {
    setPageFiles((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pageFiles.length) {
      setError('Ajoute au moins une page.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const pageUrls = []
      for (let i = 0; i < pageFiles.length; i++) {
        setProgress(`Envoi de la page ${i + 1}/${pageFiles.length}...`)
        const url = await uploadChapterPage({ ownerId: user.id, file: pageFiles[i], index: i })
        pageUrls.push(url)
      }
      setProgress('Publication du chapitre...')

      const chapter = await addSeriesChapter({
        seriesId: seriesItem.id,
        number: nextNumber,
        title: title.trim(),
        isFree,
        priceCents: Number(priceCents) || 0,
        pageUrls,
      })

      navigate(`/serie/${slug}/chapitre/${chapter.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
      setProgress('')
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Nouveau chapitre</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {seriesItem.title} — Chapitre {nextNumber}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            required
            placeholder="Titre du chapitre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">Accès</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  isFree ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                }`}
              >
                Gratuit
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  !isFree ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                }`}
              >
                Payant
              </button>
            </div>
            {!isFree && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  className="w-28 rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
                />
                <span className="text-sm text-zinc-500">centimes HTG</span>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">Pages ({pageFiles.length})</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3.5 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-200"
            />
            {pageFiles.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {pageFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-2 px-3 py-2">
                    <GripVertical size={14} className="shrink-0 text-zinc-600" />
                    <span className="min-w-[2ch] text-xs font-bold text-zinc-500">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{f.name}</span>
                    <button type="button" onClick={() => movePage(i, -1)} disabled={i === 0} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" onClick={() => movePage(i, 1)} disabled={i === pageFiles.length - 1} className="text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-30">
                      ↓
                    </button>
                    <button type="button" onClick={() => removePage(i)} aria-label="Retirer la page" className="text-zinc-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? progress || 'Publication...' : 'Publier le chapitre'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
