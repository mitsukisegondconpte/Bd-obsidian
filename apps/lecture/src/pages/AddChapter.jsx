import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GripVertical, Lock, Trash2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { getSeriesBySlug, listChapterPages, listSeriesChapters } from '../api/series'
import { createChapterDraft, deleteAuthorChapter, deleteAuthorChapterPage, getDraftAssetUrl, publishAuthorChapter, reorderAuthorChapterPages, updateAuthorChapter, uploadAuthorChapterPage } from '../api/authorStudio'

export default function AddChapter() {
  const { slug, chapterId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const saveQueue = useRef(Promise.resolve())
  const saveVersion = useRef(0)
  const saveTimer = useRef(null)
  const [seriesItem, setSeriesItem] = useState(null)
  const [activeChapterId, setActiveChapterId] = useState(chapterId || '')
  const [nextNumber, setNextNumber] = useState(1)
  const [chapterNumber, setChapterNumber] = useState(1)
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
        const series = await getSeriesBySlug(slug)
        if (!active) return
        if (series.author_id !== user.id) throw new Error('Seul l’auteur de cette série peut la modifier.')
        setSeriesItem(series)
        const chapters = await listSeriesChapters(series.id)
        const maxNumber = chapters.reduce((max, item) => Math.max(max, item.number), 0)
        setNextNumber(maxNumber + 1)
        if (!chapterId) {
          const draft = await createChapterDraft({ seriesId: series.id, number: maxNumber + 1 })
          if (active) navigate('/serie/' + slug + '/ajouter-chapitre/' + draft.id, { replace: true })
          return
        }
        const chapter = chapters.find((item) => item.id === chapterId)
        if (!chapter) throw new Error('Chapitre introuvable ou inaccessible.')
        const chapterPages = await listChapterPages(chapter.id)
        const prepared = await Promise.all(chapterPages.map(async (page) => ({ ...page, preview_url: await getDraftAssetUrl(page.image_url) })))
        if (!active) return
        setActiveChapterId(chapter.id)
        setChapterNumber(chapter.number)
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
        .then(() => { if (saveVersion.current === version) setSaveState('saved') })
        .catch((err) => { if (saveVersion.current === version) { setSaveState('failed'); setError(err.message || 'La sauvegarde a échoué.') } })
    }, 650)
    return () => window.clearTimeout(saveTimer.current)
  }, [activeChapterId, loading, profile?.is_lecture_author, title, isFree, priceCents])

  useEffect(() => {
    if (!orderDirty || !activeChapterId) return
    const timer = window.setTimeout(() => {
      reorderAuthorChapterPages({ chapterId: activeChapterId, pageIds: pages.map((page) => page.id) })
        .then(() => setOrderDirty(false))
        .catch((err) => { setError(err.message || 'L’ordre des pages n’a pas été enregistré.'); setSaveState('failed') })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [orderDirty, pages, activeChapterId])

  useEffect(() => {
    if (!activeChapterId || (saveState !== 'saving' && saveState !== 'failed') && !uploading && !orderDirty) return
    const warn = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [activeChapterId, saveState, uploading, orderDirty])

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length || !activeChapterId) return
    const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)
    if (invalid) { setError('Chaque page doit être une image de 10 Mo ou moins.'); return }
    setError('')
    setUploading(true)
    try {
      let pageNumber = pages.length + 1
      for (const file of files) {
        const page = await uploadAuthorChapterPage({ chapterId: activeChapterId, ownerId: user.id, file, pageNumber, isPublished })
        pageNumber += 1
        const preview = await getDraftAssetUrl(page.image_url)
        setPages((previous) => [...previous, { ...page, preview_url: preview }])
      }
    } catch (err) {
      setError(err.message || 'L’envoi des pages a échoué.')
      setSaveState('failed')
    } finally {
      setUploading(false)
    }
  }

  function movePage(index, direction) {
    setPages((previous) => {
      const next = [...previous]
      const target = index + direction
      if (target < 0 || target >= next.length) return previous
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setOrderDirty(true)
  }

  async function removePage(page) {
    if (!window.confirm('Supprimer cette page ? Cette action est irréversible.')) return
    setError('')
    try {
      await deleteAuthorChapterPage({ pageId: page.id, imageUrl: page.image_url })
      setPages((previous) => previous.filter((item) => item.id !== page.id))
      setOrderDirty(true)
    } catch (err) {
      setError(err.message || 'La suppression de la page a échoué.')
    }
  }

  async function retrySave() {
    setSaveState('saving')
    try {
      await updateAuthorChapter({ chapterId: activeChapterId, title, isFree, priceCents })
      if (orderDirty) {
        await reorderAuthorChapterPages({ chapterId: activeChapterId, pageIds: pages.map((page) => page.id) })
        setOrderDirty(false)
      }
      setSaveState('saved')
      setError('')
    } catch (err) {
      setSaveState('failed')
      setError(err.message || 'La sauvegarde a échoué.')
    }
  }

  async function publish() {
    if (!title.trim()) { setError('Ajoute un titre avant de publier.'); return }
    if (!isFree && Number(priceCents) < 1) { setError('Le prix doit être supérieur à zéro.'); return }
    if (!pages.length) { setError('Ajoute au moins une page avant de publier.'); return }
    setError('')
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
    }
  }

  async function removeChapter() {
    if (uploading || saveState === 'saving') return
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
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-extrabold text-zinc-50">{isPublished ? 'Modifier le chapitre' : 'Brouillon de chapitre'}</h1><p className="mt-1 text-sm text-zinc-500">{seriesItem?.title} · Chapitre {chapterNumber}</p></div><Link to="/mes-series" className="rounded-full border border-white/10 bg-surface-2 px-3 py-2 text-xs font-semibold text-zinc-300">Mes séries</Link></div>
        <p role="status" aria-live="polite" className="mt-3 text-xs text-zinc-500">{uploading ? 'Envoi des pages…' : saveState === 'saving' ? 'Enregistrement…' : saveState === 'failed' ? 'Échec de la sauvegarde' : isPublished ? 'Modifications enregistrées automatiquement' : 'Brouillon enregistré'}</p>
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</p>}
        {saveState === 'failed' && <button type="button" onClick={retrySave} className="mt-2 text-sm font-semibold text-accent underline">Réessayer la sauvegarde</button>}
        <div className="mt-5 space-y-5 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-6">
          <div><label htmlFor="chapter-title" className="mb-1.5 block text-sm font-semibold text-zinc-200">Titre du chapitre</label><input id="chapter-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Titre du chapitre" className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none" /></div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Accès</legend><div className="flex gap-2"><button type="button" aria-pressed={isFree} onClick={() => setIsFree(true)} className={isFree ? 'rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-4 py-1.5 text-sm font-semibold text-zinc-300'}>Gratuit</button><button type="button" aria-pressed={!isFree} onClick={() => setIsFree(false)} className={!isFree ? 'rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-4 py-1.5 text-sm font-semibold text-zinc-300'}>Payant</button></div>{!isFree && <div className="mt-3 flex items-center gap-2"><label htmlFor="chapter-price" className="sr-only">Prix en centimes HTG</label><input id="chapter-price" type="number" min={1} value={priceCents} onChange={(event) => setPriceCents(event.target.value)} className="w-32 rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100" /><span className="text-sm text-zinc-500">centimes HTG</span></div>}</fieldset>
          <div><label htmlFor="chapter-pages" className="mb-2 block text-sm font-semibold text-zinc-200">Pages ({pages.length})</label><input id="chapter-pages" type="file" accept="image/*" multiple onChange={handleFilesSelected} disabled={uploading} className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3.5 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-200" /><p className="mt-1 text-xs text-zinc-500">Images jusqu’à 10 Mo chacune. Les pages d’un brouillon restent privées.</p><div className="mt-3 space-y-2">{pages.map((page, index) => <div key={page.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-2 p-2"><GripVertical size={14} className="shrink-0 text-zinc-500" aria-hidden="true" /><span className="w-5 text-center text-xs font-bold text-zinc-500">{index + 1}</span>{page.preview_url && <img src={page.preview_url} alt={'Aperçu page ' + (index + 1)} className="h-14 w-10 shrink-0 rounded object-cover" />}<span className="min-w-0 flex-1 truncate text-xs text-zinc-300">Page {index + 1}</span><button type="button" onClick={() => movePage(index, -1)} disabled={index === 0} aria-label="Monter la page" className="rounded px-2 py-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30">↑</button><button type="button" onClick={() => movePage(index, 1)} disabled={index === pages.length - 1} aria-label="Descendre la page" className="rounded px-2 py-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30">↓</button><button type="button" onClick={() => removePage(page)} disabled={isPublished} title={isPublished ? 'Les pages publiées sont conservées' : undefined} aria-label="Supprimer la page" className="rounded p-1 text-zinc-500 hover:text-red-500"><Trash2 size={14} /></button></div>)}</div></div>
          <div className="flex flex-col gap-2 sm:flex-row">{!isPublished && <button type="button" onClick={publish} disabled={uploading || orderDirty || saveState === 'saving' || !activeChapterId} className="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">Publier le chapitre</button>}<button type="button" onClick={removeChapter} disabled={!activeChapterId || isPublished || uploading || saveState === 'saving'} className="rounded-full border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/5">{isPublished ? 'Chapitre publié — suppression verrouillée' : 'Supprimer le brouillon'}</button></div>
        </div>
      </main>
    </Layout>
  )
}
