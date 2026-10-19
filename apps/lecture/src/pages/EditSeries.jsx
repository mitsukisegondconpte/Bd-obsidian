import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { getSeriesBySlug, uploadSeriesCover } from '../api/series'
import { listGenres } from '../api/genres'
import { updatePublishedSeries } from '../api/authorStudio'

export default function EditSeries() {
  const { slug } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [series, setSeries] = useState(null)
  const [genres, setGenres] = useState([])
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('ongoing')
  const [updateDay, setUpdateDay] = useState('')
  const [selectedGenres, setSelectedGenres] = useState([])
  const [coverUrl, setCoverUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !profile?.is_lecture_author) return
    let active = true
    Promise.all([getSeriesBySlug(slug), listGenres().catch(() => [])]).then(([item, genreList]) => {
      if (!active) return
      if (item.author_id !== user.id || !item.is_published) throw new Error('Cette série ne peut pas être modifiée depuis ce compte.')
      setSeries(item)
      setGenres(genreList)
      setTitle(item.title || '')
      setSummary(item.summary || '')
      setStatus(item.status || 'ongoing')
      setUpdateDay(item.update_day || '')
      setSelectedGenres(item.genres || [])
      setCoverUrl(item.cover_url || '')
      setPreview(item.cover_url || '')
    }).catch((err) => { if (active) setError(err.message || 'Impossible de charger la série.') })
    return () => { active = false }
  }, [slug, user?.id, profile?.is_lecture_author])

  function toggleGenre(name) {
    setSelectedGenres((previous) => previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name])
  }

  function chooseCover(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { setError('Choisis une image de 5 Mo ou moins.'); return }
    setError('')
    setCoverFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function save(event) {
    event.preventDefault()
    if (!title.trim() || !summary.trim()) { setError('Le titre et le résumé sont obligatoires.'); return }
    setSaving(true)
    setError('')
    try {
      const nextCover = coverFile ? await uploadSeriesCover({ ownerId: user.id, file: coverFile }) : coverUrl
      await updatePublishedSeries({ seriesId: series.id, authorId: user.id, title, summary, status, updateDay, coverUrl: nextCover, genreNames: selectedGenres })
      navigate('/serie/' + slug)
    } catch (err) {
      setError(err.message || 'La modification n’a pas pu être enregistrée.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <Layout><div className="px-4 py-16 text-center text-zinc-400">Connecte-toi pour modifier la série.</div></Layout>
  if (!profile) return <Layout><Loader className="py-16" /></Layout>
  if (!profile.is_lecture_author) return <Layout><div className="flex flex-col items-center gap-3 px-4 py-16 text-center"><Lock size={28} className="text-zinc-500" /><p className="text-sm text-zinc-400">Le studio Lecture est réservé aux auteurs autorisés.</p></div></Layout>
  if (!series && !error) return <Layout><Loader className="py-16" /></Layout>

  return (
    <Layout>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3"><h1 className="text-xl font-extrabold text-zinc-50">Modifier la série</h1><Link to="/mes-series" className="rounded-full border border-white/10 bg-surface-2 px-3 py-2 text-xs font-semibold text-zinc-300">Mes séries</Link></div>
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</p>}
        {series && <form onSubmit={save} className="mt-5 space-y-5 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-6">
          <div><label htmlFor="edit-series-title" className="mb-1.5 block text-sm font-semibold text-zinc-200">Titre</label><input id="edit-series-title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100" /></div>
          <div><label htmlFor="edit-series-summary" className="mb-1.5 block text-sm font-semibold text-zinc-200">Résumé</label><textarea id="edit-series-summary" required maxLength={5000} rows={5} value={summary} onChange={(event) => setSummary(event.target.value)} className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100" /></div>
          <div><label htmlFor="edit-series-status" className="mb-1.5 block text-sm font-semibold text-zinc-200">Statut</label><select id="edit-series-status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-zinc-100"><option value="ongoing">En cours</option><option value="paused">En pause</option><option value="completed">Terminée</option></select></div>
          <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Jour de mise à jour (optionnel)</legend><div className="flex flex-wrap gap-1.5">{['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => <button key={day} type="button" aria-pressed={updateDay === day} onClick={() => setUpdateDay((value) => value === day ? '' : day)} className={updateDay === day ? 'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300'}>{day}</button>)}</div></fieldset>
          {genres.length > 0 && <fieldset><legend className="mb-2 text-sm font-semibold text-zinc-200">Genres</legend><div className="flex flex-wrap gap-1.5">{genres.map((genre) => <button key={genre} type="button" aria-pressed={selectedGenres.includes(genre)} onClick={() => toggleGenre(genre)} className={selectedGenres.includes(genre) ? 'rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink' : 'rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300'}>{genre}</button>)}</div></fieldset>}
          <div><label htmlFor="edit-series-cover" className="mb-2 block text-sm font-semibold text-zinc-200">Couverture</label><input id="edit-series-cover" type="file" accept="image/*" onChange={chooseCover} className="block w-full text-sm text-zinc-400" />{preview && <img src={preview} alt="Aperçu de la couverture" className="mt-3 h-36 w-28 rounded-lg border border-white/10 object-cover" />}</div>
          <button type="submit" disabled={saving} className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink disabled:opacity-50">{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
        </form>}
      </main>
    </Layout>
  )
}
