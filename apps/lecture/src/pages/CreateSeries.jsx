import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ImagePlus, Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { listGenres } from '../api/genres'
import { createSeriesDraft, getAuthorSeriesDraft, getDraftAssetUrl, publishSeriesDraft, updateSeriesDraft, uploadDraftCover } from '../api/authorStudio'

const STATUSES = [
  { id: 'ongoing', label: 'En cours' },
  { id: 'paused', label: 'En pause' },
  { id: 'completed', label: 'Terminée' },
]
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function CreateSeries() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDraft = useRef(searchParams.get('draft'))
  const saveQueue = useRef(Promise.resolve())
  const saveVersion = useRef(0)
  const [draftId, setDraftId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('ongoing')
  const [updateDay, setUpdateDay] = useState('')
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saveState, setSaveState] = useState('saved')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!user || !profile?.is_lecture_author) return
    let active = true
    async function initialize() {
      setLoading(true)
      setError('')
      try {
        const draft = requestedDraft.current ? await getAuthorSeriesDraft(requestedDraft.current, user.id) : await createSeriesDraft(user.id)
        const genreList = await listGenres().catch(() => [])
        if (!active) return
        setGenres(genreList)
        setDraftId(draft.id)
        if (!requestedDraft.current) setSearchParams({ draft: draft.id }, { replace: true })
        setTitle(draft.title === 'Brouillon sans titre' ? '' : draft.title)
        setSummary(draft.summary || '')
        setStatus(draft.status || 'ongoing')
        setUpdateDay(draft.update_day || '')
        setCoverUrl(draft.cover_url || '')
        setSelectedGenres((draft.series_genres || []).map((item) => item.genre?.name).filter(Boolean))
      } catch (err) {
        if (active) setError(err.message || 'Impossible de charger le brouillon.')
      } finally {
        if (active) setLoading(false)
      }
    }
    initialize()
    return () => { active = false }
  }, [user?.id, profile?.is_lecture_author, setSearchParams])

  useEffect(() => {
    let active = true
    if (!coverUrl) { setCoverPreview(''); return () => { active = false } }
    getDraftAssetUrl(coverUrl).then((url) => { if (active) setCoverPreview(url) }).catch(() => { if (active) setCoverPreview('') })
    return () => { active = false }
  }, [coverUrl])

  useEffect(() => {
    if (!draftId || loading || !profile?.is_lecture_author) return
    const version = ++saveVersion.current
    const snapshot = { seriesId: draftId, authorId: user.id, title, summary, status, updateDay, coverUrl, genreNames: selectedGenres }
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      saveQueue.current = saveQueue.current.catch(() => {}).then(() => updateSeriesDraft(snapshot))
        .then(() => { if (saveVersion.current === version) setSaveState('saved') })
        .catch((err) => { if (saveVersion.current === version) { setSaveState('failed'); setError(err.message || 'La sauvegarde a échoué.') } })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [draftId, loading, profile?.is_lecture_author, user?.id, title, summary, status, updateDay, coverUrl, selectedGenres])

  useEffect(() => {
    if (!draftId || (saveState !== 'saving' && saveState !== 'failed')) return
    const warn = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [draftId, saveState])

  async function handleCover(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choisis un fichier image.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('La couverture doit faire 5 Mo ou moins.'); return }
    if (!draftId) return
    setError('')
    setUploadingCover(true)
    try {
      const path = await uploadDraftCover({ ownerId: user.id, seriesId: draftId, file })
      setCoverUrl(path)
    } catch (err) {
      setError(err.message || 'L’envoi de la couverture a échoué.')
    } finally {
      setUploadingCover(false)
    }
  }

  function toggleGenre(name) {
    setSelectedGenres((previous) => previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name])
  }

  async function retrySave() {
    if (!draftId) return
    setSaveState('saving')
    setError('')
    try {
      await updateSeriesDraft({ seriesId: draftId, authorId: user.id, title, summary, status, updateDay, coverUrl, genreNames: selectedGenres })
      setSaveState('saved')
    } catch (err) {
      setSaveState('failed')
      setError(err.message || 'La sauvegarde a échoué.')
    }
  }

  async function handlePublish() {
    if (!title.trim() || !summary.trim()) { setError('Ajoute un titre et un résumé avant de publier.'); return }
    if (uploadingCover || saveState === 'saving') { setError('Attends la fin de la sauvegarde avant de publier.'); return }
    setPublishing(true)
    setError('')
    try {
      await saveQueue.current
      await updateSeriesDraft({ seriesId: draftId, authorId: user.id, title, summary, status, updateDay, coverUrl, genreNames: selectedGenres })
      const series = await publishSeriesDraft({ seriesId: draftId, authorId: user.id })
      setSaveState('saved')
      navigate('/serie/' + series.slug)
    } catch (err) {
      setError(err.message || 'La publication a échoué.')
      setSaveState('failed')
    } finally {
      setPublishing(false)
    }
  }

  if (!user) return <Layout><div className="px-4 py-16 text-center text-zinc-400">Connecte-toi pour accéder au studio auteur.</div></Layout>
  if (!profile) return <Layout><Loader className="py-16" /></Layout>
  if (!profile.is_lecture_author) return <Layout><div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center"><Lock size={28} className="text-zinc-500" /><p className="text-sm text-zinc-400">La publication sur Lecture est réservée aux auteurs nommés par l’équipe Hypercube.</p></div></Layout>
  if (loading) return <Layout><Loader className="py-16" /></Layout>

  return (
    <Layout>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-xl font-extrabold text-zinc-50">Brouillon de série</h1><p className="mt-1 text-sm text-zinc-500">Les modifications sont enregistrées automatiquement sur le serveur.</p></div>
          <Link to="/mes-series" className="rounded-full border border-white/10 bg-surface-2 px-3 py-2 text-xs font-semibold text-zinc-300">Mes séries</Link>
        </div>
        <p role="status" aria-live="polite" className="mt-3 text-xs text-zinc-500">{saveState === 'saving' || uploadingCover ? 'Enregistrement…' : saveState === 'failed' ? 'Échec de la sauvegarde' : 'Brouillon enregistré'}</p>
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</p>}
        {saveState === 'failed' && <button type="button" onClick={retrySave} className="mt-2 text-sm font-semibold text-accent underline">Réessayer la sauvegarde</button>}

        <div className="mt-5 space-y-5 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-6">
          <div><label htmlFor="series-title" className="mb-1.5 block text-sm font-semibold text-zinc-200">Titre</label><input id="series-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Titre de la série" className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none" /></div>
          <div><label htmlFor="series-summary" className="mb-1.5 block text-sm font-semibold text-zinc-200">Résumé</label><textarea id="series-summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} maxLength={5000} placeholder="Présente ton histoire" className="w-full resize-y rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none" /></div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Statut de la série</legend><div className="flex flex-wrap gap-2">{STATUSES.map((item) => <button key={item.id} type="button" onClick={() => setStatus(item.id)} className={status === item.id ? 'rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-4 py-1.5 text-sm font-semibold text-zinc-300'}>{item.label}</button>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Jour de mise à jour (optionnel)</legend><div className="flex flex-wrap gap-1.5">{DAYS.map((day) => <button key={day} type="button" onClick={() => setUpdateDay((value) => value === day ? '' : day)} className={updateDay === day ? 'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300'}>{day}</button>)}</div></fieldset>
          {genres.length > 0 && <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Genres</legend><div className="flex flex-wrap gap-1.5">{genres.map((genre) => <button key={genre} type="button" aria-pressed={selectedGenres.includes(genre)} onClick={() => toggleGenre(genre)} className={selectedGenres.includes(genre) ? 'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300'}>{genre}</button>)}</div></fieldset>}
          <div><label htmlFor="series-cover" className="mb-2 block text-sm font-semibold text-zinc-200">Couverture</label><div className="flex flex-col gap-3 sm:flex-row sm:items-start"><label htmlFor="series-cover" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-surface-2 px-4 py-2 text-sm font-semibold text-zinc-200"><ImagePlus size={16} aria-hidden="true" />{uploadingCover ? 'Envoi…' : 'Choisir une image'}</label><input id="series-cover" type="file" accept="image/*" onChange={handleCover} className="sr-only" />{coverPreview && <img src={coverPreview} alt="Aperçu de la couverture" className="h-36 w-28 rounded-lg border border-white/10 object-cover" />}</div><label htmlFor="series-cover-url" className="sr-only">Lien de couverture</label><input id="series-cover-url" type="url" value={coverUrl.startsWith('http') ? coverUrl : ''} onChange={(event) => setCoverUrl(event.target.value)} placeholder="Ou coller une URL d’image" className="mt-3 w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none" /><p className="mt-1 text-xs text-zinc-500">Les fichiers importés restent privés jusqu’à publication. Limite : 5 Mo.</p></div>
          <button type="button" onClick={handlePublish} disabled={publishing || uploadingCover || saveState === 'saving' || !draftId} className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">{publishing ? 'Publication…' : 'Publier la série'}</button>
        </div>
      </main>
    </Layout>
  )
}
