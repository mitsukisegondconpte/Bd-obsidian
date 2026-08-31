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
  const [linkType, setLinkType] = useState('')
  const [linkedId, setLinkedId] = useState('')
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) listEligibleContent().then(setContent)
  }, [user])

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
    if (!linkType || !linkedId) return
    setError('')
    setSubmitting(true)
    try {
      const channel = await createChannel({
        ownerId: user.id,
        name: name.trim(),
        description: description.trim(),
        relatedSeriesId: linkType === 'series' ? linkedId : null,
        relatedWorkId: linkType === 'work' ? linkedId : null,
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
          publiquement. Réservé aux œuvres HOS/Bohio Mag et aux œuvres actuellement dans le Top 10 hebdomadaire.
        </p>

        {content && !hasEligibleContent ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-14 text-center">
            <Lock size={26} className="text-zinc-600" />
            <p className="max-w-xs text-sm text-zinc-500">
              Aucune œuvre n'est actuellement éligible (Top 10 hebdomadaire ou mise en avant HOS/Bohio Mag).
              Reviens quand une œuvre que tu suis y figure.
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
                value={linkType ? `${linkType}:${linkedId}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split(':')
                  setLinkType(type)
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
              disabled={submitting || !linkType}
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
