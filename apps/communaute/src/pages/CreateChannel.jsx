import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { createChannel } from '../api/channels'
import { listEligibleContent } from '../api/communities'

export default function CreateChannel() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [channelType, setChannelType] = useState('hypercube_world')
  const [contentType, setContentType] = useState('')
  const [linkedId, setLinkedId] = useState('')
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    setContentType('')
    setLinkedId('')
    listEligibleContent(channelType).then(setContent)
  }, [user, channelType])

  if (!user) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Connecte-toi pour créer un canal.</p>
      </Layout>
    )
  }

  if (profile && !profile.is_author) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="max-w-xs text-sm text-zinc-400">
            Les canaux sont réservés aux auteurs. Publie une série (plateforme lecture) ou une œuvre (plateforme
            écriture) pour en débloquer un — ton compte est le même partout.
          </p>
        </div>
      </Layout>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!contentType || !linkedId) return
    setError('')
    setSubmitting(true)
    try {
      const channel = await createChannel({
        ownerId: user.id,
        name: name.trim(),
        description: description.trim(),
        linkType: channelType,
        relatedSeriesId: contentType === 'series' ? linkedId : null,
        relatedWorkId: contentType === 'work' ? linkedId : null,
      })
      navigate(`/canal/${channel.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasEligibleContent = content && (content.series.length > 0 || content.works.length > 0)

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Nouveau canal</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Comme une chaîne WhatsApp : tes abonnés reçoivent tes annonces, ils ne peuvent pas te répondre
          publiquement. Réservé aux 5 œuvres les plus populaires du moment, ou aux œuvres officiellement mises
          en avant HOS/Bohio Mag.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setChannelType('hypercube_world')}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
              channelType === 'hypercube_world'
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
            }`}
          >
            Hypercube World
            <span className="mt-0.5 block text-xs font-normal opacity-70">Top 5 œuvres du moment</span>
          </button>
          <button
            type="button"
            onClick={() => setChannelType('officiel')}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
              channelType === 'officiel'
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
            }`}
          >
            Officiel
            <span className="mt-0.5 block text-xs font-normal opacity-70">HOS / Bohio Mag</span>
          </button>
        </div>

        {content && !hasEligibleContent ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-14 text-center">
            <Lock size={26} className="text-zinc-600" />
            <p className="max-w-xs text-sm text-zinc-500">
              {channelType === 'officiel'
                ? "Aucune œuvre n'est actuellement mise en avant HOS/Bohio Mag."
                : "Aucune œuvre n'est actuellement dans le Top 5 hebdomadaire."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              required
              placeholder="Nom du canal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Description (optionnelle)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />

            <div className="rounded-lg border border-white/10 bg-surface-2 p-3.5">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Œuvre liée (obligatoire)</p>
              <select
                required
                value={contentType ? `${contentType}:${linkedId}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split(':')
                  setContentType(type)
                  setLinkedId(id)
                }}
                className="w-full rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
              >
                <option value="" disabled>
                  Choisir une œuvre éligible...
                </option>
                {content?.series.map((s) => (
                  <option key={s.id} value={`series:${s.id}`}>
                    {s.title} (BD)
                  </option>
                ))}
                {content?.works.map((w) => (
                  <option key={w.id} value={`work:${w.id}`}>
                    {w.title} (écriture)
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !contentType}
              className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
            >
              {submitting ? 'Création...' : 'Créer le canal'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
