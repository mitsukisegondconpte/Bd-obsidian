import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, ImagePlus, Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { EDITION_LEVELS, createEditionRequest, getEditionCredits, listEditionRequests } from '../api/editions'
import { listMyImageRequests } from '../api/images'
import { listWorksByAuthor } from '../api/works'

const STATUS_LABEL = {
  pending: 'En attente',
  in_discussion: 'En discussion',
  assigned: 'Assignée',
  in_progress: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export default function EditionServices() {
  const { user } = useAuth()
  const [credits, setCredits] = useState(null)
  const [works, setWorks] = useState([])
  const [requests, setRequests] = useState([])
  const [imageRequests, setImageRequests] = useState([])
  const [selectedWorkId, setSelectedWorkId] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    getEditionCredits(user.id).then(setCredits)
    listWorksByAuthor(user.id).then(setWorks)
    listEditionRequests(user.id).then(setRequests)
    listMyImageRequests(user.id).then(setImageRequests)
  }, [user])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Connecte-toi pour demander une édition.</p>
        </div>
      </Layout>
    )
  }

  async function handleRequest(e) {
    e.preventDefault()
    if (!selectedWorkId) {
      setError('Choisis une œuvre.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const usedFreeCredit = selectedLevel === 1 && credits > 0
      const created = await createEditionRequest({
        workId: selectedWorkId,
        authorId: user.id,
        level: selectedLevel,
        usedFreeCredit,
      })
      setRequests((r) => [created, ...r])
      if (usedFreeCredit) setCredits((c) => c - 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Service d'édition</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fais relire ton œuvre par un éditeur Hypercube et reçois des retours pour l'améliorer.
        </p>

        <div className="mt-5 rounded-xl bg-surface-2 p-4">
          <p className="text-sm text-zinc-300">
            Crédits gratuits niveau 1 restants : <span className="font-bold text-accent">{credits ?? '...'}</span> / 4
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {EDITION_LEVELS.map((lvl) => (
            <div key={lvl.level} className="rounded-xl border border-white/10 bg-surface-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-100">{lvl.name}</h3>
                <span className="text-xs font-semibold text-accent">{lvl.priceLabel}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{lvl.description}</p>
            </div>
          ))}
        </div>

        {works.length > 0 ? (
          <form onSubmit={handleRequest} className="mt-6 space-y-3 rounded-xl border border-white/10 bg-surface-1 p-4">
            <h3 className="text-sm font-bold text-zinc-100">Faire une demande</h3>
            <select
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
            >
              <option value="">Choisir une œuvre...</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              {EDITION_LEVELS.map((lvl) => (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => setSelectedLevel(lvl.level)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedLevel === lvl.level ? 'bg-accent text-accent-ink' : 'border border-white/10 text-zinc-300'
                  }`}
                >
                  Niveau {lvl.level}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">Publie d'abord une œuvre pour demander une édition.</p>
        )}

        <div className="mt-8 pb-6">
          <h2 className="mb-2 text-sm font-bold text-zinc-100">Mes demandes</h2>
          <div className="divide-y divide-white/5">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {r.work?.title} — Niveau {r.level}
                  </p>
                  {r.feedback && <p className="mt-0.5 text-xs text-zinc-400">{r.feedback}</p>}
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
                  {r.status === 'delivered' ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Clock size={13} />}
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
            ))}
            {requests.length === 0 && <p className="py-4 text-sm text-zinc-500">Aucune demande pour l'instant.</p>}
          </div>
        </div>

        <div className="pb-10">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-zinc-100">
            <ImagePlus size={15} /> Mes images sur mesure
          </h2>
          <p className="mb-2 text-xs text-zinc-500">
            Demandées depuis l'onglet "Sur mesure" en créant une œuvre.
          </p>
          <div className="divide-y divide-white/5">
            {imageRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-200">{r.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.delivered_image?.image_url && (
                    <img src={r.delivered_image.image_url} alt="" className="h-12 w-8 rounded object-cover" />
                  )}
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
                    {r.status === 'delivered' ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Clock size={13} />}
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
              </div>
            ))}
            {imageRequests.length === 0 && (
              <p className="py-4 text-sm text-zinc-500">Aucune demande d'image pour l'instant.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
