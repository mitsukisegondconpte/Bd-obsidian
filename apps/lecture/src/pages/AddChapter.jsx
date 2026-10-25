import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GripVertical, Lock, Trash2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { getAuthorSeriesBySlug, listAuthorChapterPages, listAuthorSeriesChapters } from '../api/series'
import { createChapterDraft, deleteAuthorChapter, deleteAuthorChapterPage, getDraftAssetUrl, publishAuthorChapter, reorderAuthorChapterPages, updateAuthorChapter, uploadAuthorChapterPage } from '../api/authorStudio'
import { createPageUploadQueue } from '../utils/pageUploadQueue'

export default function AddChapter() {
  const { slug, chapterId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const saveQueue = useRef(Promise.resolve())
  const saveVersion = useRef(0)
  const saveTimer = useRef(null)
  const uploads = useRef(createPageUploadQueue())
  const operationBusy = useRef(false)
  const [seriesItem, setSeriesItem] = useState(null)
  const [activeChapterId, setActiveChapterId] = useState(chapterId || '')
  const [title, setTitle] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [priceCents, setPriceCents] = useState('50')
  const [pages, setPages] = useState([])
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saveState, setSaveState] = useState('saved')
  const [orderDirty, setOrderDirty] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !profile?.is_lecture_author) return
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const series = await getAuthorSeriesBySlug(user.id, slug)
        if (!active) return
        setSeriesItem(series)
        const chapters = await listAuthorSeriesChapters(series.id)
        const maxNumber = chapters.reduce((max, item) => Math.max(max, item.number), 0)
        if (!chapterId) {
          const draft = await createChapterDraft({ seriesId: series.id, number: maxNumber + 1 })
          if (active) navigate('/serie/' + slug + '/ajouter-chapitre/' + draft.id, { replace: true })
          return
        }
        const chapter = chapters.find((item) => item.id === chapterId)
        if (!chapter) throw new Error('Chapitre introuvable ou inaccessible.')
        const chapterPages = await listAuthorChapterPages(chapter.id)
        const prepared = await Promise.all(chapterPages.map(async (page) => ({ ...page, preview_url: await getDraftAssetUrl(page.image_url) })))
        if (!active) return
        setActiveChapterId(chapter.id)
        setTitle(chapter.title === 'Brouillon sans titre' ? '' : chapter.title)
        setIsFree(chapter.is_free)
        setPriceCents(String(chapter.price_cents || 50))
        setPages(prepared)
        setIsPublished(Boolean(chapter.published_at))
      } catch (err) {
        if (active) setError(err.message || 'Impossible de charger le chapitre.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [slug, chapterId, user?.id, profile?.is_lecture_author, navigate])

  useEffect(() => {
    if (!activeChapterId || loading || !profile?.is_lecture_author) return
    const version = ++saveVersion.current
    const snapshot = { chapterId: activeChapterId, title, isFree, priceCents }
    setSaveState('saving')
    saveTimer.current = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.catch(() => {}).then(() => updateAuthorChapter(snapshot))
        .then(() => { if (saveVersion.current === version) setSaveState(uploads.current.pending ? 'failed' : 'saved') })
        .catch((err) => { if (saveVersion.current === version) { setSaveState('failed'); setError(err.message || 'La sauvegarde a échoué.') } })
    }, 650)
    return () => window.clearTimeout(saveTimer.current)
  }, [activeChapterId, loading, profile?.is_lecture_author, title, isFree, priceCents])

  useEffect(() => {
    if (!orderDirty || !activeChapterId || uploading) return
    const timer = window.setTimeout(() => {
      reorderAuthorChapterPages({ chapterId: activeChapterId, pageIds: pages.map((page) => page.id) })
        .then(() => setOrderDirty(false))
        .catch((err) => { setError(err.message || 'L’ordre des pages n’a pas été enregistré.'); setSaveState('failed') })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [orderDirty, pages, activeChapterId, uploading])

  useEffect(() => {
    if (!activeChapterId || (saveState !== 'saving' && saveState !== 'failed') && !uploading && !orderDirty && !uploads.current.pending) return
    const warn = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [activeChapterId, saveState, uploading, orderDirty])

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length || !activeChapterId || operationBusy.current || orderDirty) return
    const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)
    if (invalid) { setError('Chaque page doit être une image de 10 Mo ou moins.'); return }
    uploads.current.enqueue(files, pages)
    await retrySave()
  }

  async function uploadPendingPages() {
    await uploads.current.run(
      (job) => uploadAuthorChapterPage({ ...job, chapterId: activeChapterId, ownerId: user.id, isPublished }),
      async (page) => ({ ...page, preview_url: await getDraftAssetUrl(page.image_url) }),
      (page) => setPages((previous) => previous.some((item) => item.id === page.id) ? previous : [...previous, page]),
    )
  }

  async function retrySave() {
    if (operationBusy.current || !activeChapterId) return
    operationBusy.current = true
    window.clearTimeout(saveTimer.current)
    saveVersion.current += 1
    setSaveState('saving')
    setUploading(true)
    setError('')
    try {
      await saveQueue.current
      await updateAuthorChapter({ chapterId: activeChapterId, title, isFree, priceCents })
      if (orderDirty) {
        await reorderAuthorChapterPages({ chapterId: activeChapterId, pageIds: pages.map((page) => page.id) })
        setOrderDirty(false)
      }
      await uploadPendingPages()
      setSaveState('saved')
    } catch (err) {
      setError(err.message || 'La sauvegarde des pages a échoué.')
      setSaveState('failed')
    } finally {
      operationBusy.current = false
      setUploading(false)
    }
  }

  function movePage(index, direction) {
    if (operationBusy.current || uploads.current.pending) return
    setPages((previous) => {
      const next = [...previous]
      const target = index + direction
      if (target < 0 || target >= next.length) return previous
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((page, position) => ({ ...page, page_number: position + 1 }))
    })
    setOrderDirty(true)
  }

  async function removePage(page) {
    if (operationBusy.current || uploads.current.pending) return
    if (!window.confirm('Supprimer cette page ? Cette action est irréversible.')) return
    setError('')
    try {
      await deleteAuthorChapterPage({ pageId: page.id, imageUrl: page.image_url })
      setPages((previous) => previous.filter((item) => item.id !== page.id).map((item, index) => ({ ...item, page_number: index + 1 })))
      setOrderDirty(true)
    } catch (err) {
      setError(err.message || 'La suppression de la page a échoué.')
    }
  }

  async function publish() {
    if (operationBusy.current || orderDirty || uploads.current.pending) {
      setError('Termine la sauvegarde de toutes les pages avant de publier.')
      return
    }
    if (!title.trim()) { setError('Ajoute un titre avant de publier.'); return }
    if (!isFree && Number(priceCents) < 1) { setError('Le prix doit être supérieur à zéro.'); return }
    if (!pages.length) { setError('Ajoute au moins une page avant de publier.'); return }
    setError('')
    operationBusy.current = true
    setSaveState('saving')
    try {
      window.clearTimeout(saveTimer.current)
      saveVersion.current += 1
      await saveQueue.current
      await updateAuthorChapter({ chapterId: activeChapterId, title, isFree, priceCents })
      await publishAuthorChapter({ chapterId: activeChapterId, ownerId: user.id })
      setIsPublished(true)
      setSaveState('saved')
      navigate('/serie/' + slug + '/chapitre/' + activeChapterId)
    } catch (err) {
      setError(err.message || 'La publication du chapitre a échoué.')
      setSaveState('failed')
    } finally {
      operationBusy.current = false
    }
  }

  async function removeChapter() {
    if (operationBusy.current || uploading || saveState === 'saving') return
    if (!window.confirm('Supprimer définitivement ce chapitre et ses pages ?')) return
    try {
      await deleteAuthorChapter(activeChapterId)
      navigate('/mes-series')
    } catch (err) {
      setError(err.message || 'La suppression du chapitre a échoué.')
    }
  }

  if (!user) return <Layout><div className="px-4 py-16 text-center text-zinc-400">Connecte-toi pour modifier un chapitre.</div></Layout>
  if (!profile) return <Layout><Loader className="py-16" /></Layout>
  if (!profile.is_lecture_author) return <Layout><div className="flex flex-col items-center gap-3 px-4 py-16 text-center"><Lock size={28} className="text-zinc-500" /><p className="text-sm text-zinc-400">Le studio Lecture est réservé aux auteurs autorisés.</p></div></Layout>
  if (loading) return <Layout><Loader className="py-16" /></Layout>
  if (error && !seriesItem) return <Layout><p role="alert" className="p-6 text-sm text-red-500">{error}</p></Layout>

  return (
    <Layout>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-extrabold text-zinc-50">{isPublished ? 'Modifier le chapitre' : 'Brouillon de chapitre'}</h1><p className="mt-1 text-sm text-zinc-500">{seriesItem?.title || 'Série sans titre'}</p></div><button type="button" onClick={removeChapter} className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-400"><Trash2 size={14} />Supprimer</button></div>
        <p role="status" aria-live="polite" className="mt-3 text-xs text-zinc-500">{uploading ? 'Envoi des pages…' : saveState === 'saving' ? 'Enregistrement…' : saveState === 'failed' ? 'Échec de la sauvegarde' : 'Sauvegardé'}</p>
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</p>}
        {saveState === 'failed' && <button type="button" onClick={retrySave} disabled={uploading} className="mt-2 text-sm font-semibold text-accent underline">Réessayer la sauvegarde</button>}
        <fieldset disabled={uploading || (saveState === 'saving' && operationBusy.current)} className="mt-5 space-y-5 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-6">
          <div><label htmlFor="chapter-title" className="mb-1.5 block text-sm font-semibold text-zinc-200">Titre du chapitre</label><input id="chapter-title" value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-0 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-accent" placeholder="Titre du chapitre" /></div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Accès</legend><div className="flex gap-2"><button type="button" aria-pressed={isFree} onClick={() => setIsFree(true)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isFree ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-transparent text-zinc-400'}`}>Gratuit</button><button type="button" aria-pressed={!isFree} onClick={() => setIsFree(false)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!isFree ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-transparent text-zinc-400'}`}>Payant</button></div></fieldset>
          {!isFree && <div><label htmlFor="chapter-price" className="mb-1.5 block text-sm font-semibold text-zinc-200">Prix (centimes)</label><input id="chapter-price" value={priceCents} onChange={(event) => setPriceCents(event.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-0 px-3 py-2.5 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-accent" /></div>}
          <div><label htmlFor="chapter-pages" className="mb-2 block text-sm font-semibold text-zinc-200">Pages ({pages.length})</label><input id="chapter-pages" type="file" accept="image/*" multiple disabled={orderDirty || uploading} className="w-full rounded-xl border border-dashed border-white/10 bg-surface-0 p-3 text-sm text-zinc-300 disabled:opacity-50" onChange={handleFilesSelected} /></div>
          {pages.length > 0 && <div className="space-y-3">{pages.map((page, index) => <div key={page.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface-0 p-2"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-surface-2"><img src={page.preview_url || page.image_url} alt={'Page ' + page.page_number} className="h-full w-full object-cover" /></div><div className="flex-1"><p className="text-xs text-zinc-500">Page {page.page_number}</p><p className="text-sm font-semibold text-zinc-200">{page.title || 'Sans titre'}</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => movePage(index, -1)} className="rounded-full border border-white/10 bg-surface-2 px-2 py-1 text-xs text-zinc-300">↑</button><button type="button" onClick={() => movePage(index, 1)} className="rounded-full border border-white/10 bg-surface-2 px-2 py-1 text-xs text-zinc-300">↓</button><button type="button" onClick={() => removePage(page)} className="rounded-full border border-red-500/20 bg-red-500/5 p-2 text-red-400"><GripVertical size={12} className="rotate-90" /><span className="sr-only">Supprimer</span></button></div></div>)}</div>}
          {!isPublished && <button type="button" onClick={publish} disabled={uploading || orderDirty || saveState !== 'saved' || !activeChapterId} className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60">Publier le chapitre</button>}
        </fieldset>
      </main>
    </Layout>
  )
}

