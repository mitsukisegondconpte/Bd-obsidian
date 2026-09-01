import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { createSeries, uploadSeriesCover } from '../api/series'
import { listGenres } from '../api/genres'

const STATUS_OPTIONS = [
  { id: 'ongoing', label: 'En cours' },
  { id: 'paused', label: 'En pause' },
  { id: 'completed', label: 'Terminée' },
]

const DAY_OPTIONS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const COVER_TABS = [
  { id: 'upload', label: 'Depuis mon appareil' },
  { id: 'url', label: 'Coller un lien' },
]

export default function CreateSeries() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('ongoing')
  const [updateDay, setUpdateDay] = useState('')
  const [allGenres, setAllGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])

  const [coverTab, setCoverTab] = useState('upload')
  const [coverFile, setCoverFile] = useState(null)
  const [coverUrl, setCoverUrl] = useState('')

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listGenres().then(setAllGenres)
  }, [])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Connecte-toi pour créer une série.</p>
        </div>
      </Layout>
    )
  }

  if (profile && !profile.is_lecture_author) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="max-w-xs text-sm text-zinc-400">
            La publication sur la plateforme lecture est réservée aux auteurs nommés par l'équipe Hypercube.
            Publie sur Hypercube World (écriture) pour te faire remarquer.
          </p>
        </div>
      </Layout>
    )
  }

  function toggleGenre(name) {
    setSelectedGenres((prev) => (prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      let finalCoverUrl = ''
      if (coverTab === 'upload' && coverFile) {
        finalCoverUrl = await uploadSeriesCover({ ownerId: user.id, file: coverFile })
      } else if (coverTab === 'url' && coverUrl.trim()) {
        finalCoverUrl = coverUrl.trim()
      }

      const series = await createSeries({
        authorId: user.id,
        title: title.trim(),
        summary: summary.trim(),
        status,
        updateDay,
        coverUrl: finalCoverUrl,
        genreNames: selectedGenres,
      })

      navigate(`/serie/${series.slug}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Nouvelle série</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gratuit et ouvert à tous. Tu pourras ajouter des chapitres juste après.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            required
            placeholder="Titre de la série"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          <textarea
            required
            rows={4}
            placeholder="Résumé"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">Statut</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    status === s.id ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">Jour de mise à jour (optionnel)</p>
            <div className="flex flex-wrap gap-1.5">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setUpdateDay((v) => (v === d ? '' : d))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    updateDay === d ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {allGenres.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-zinc-200">Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {allGenres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedGenres.includes(g)
                        ? 'bg-accent text-accent-ink'
                        : 'border border-white/10 bg-surface-2 text-zinc-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">Couverture</p>
            <div className="flex flex-wrap gap-1.5">
              {COVER_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCoverTab(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    coverTab === t.id ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-3">
              {coverTab === 'upload' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3.5 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-200"
                />
              )}
              {coverTab === 'url' && (
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                />
              )}
            </div>
            <p className="mt-2 text-[11px] text-zinc-600">
              Optionnel — une couverture générée sera utilisée si tu ne fournis rien.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? 'Création...' : 'Créer la série'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
