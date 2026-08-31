import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { createCommunity } from '../api/communities'
import { listMyPublishedContent } from '../api/profiles'

export default function CreateCommunity() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [linkType, setLinkType] = useState('none')
  const [linkedId, setLinkedId] = useState('')
  const [content, setContent] = useState({ series: [], works: [] })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && profile?.is_author) listMyPublishedContent(user.id).then(setContent)
  }, [user, profile])

  if (!user) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Connecte-toi pour créer une communauté.</p>
      </Layout>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const community = await createCommunity({
        creatorId: user.id,
        name: name.trim(),
        description: description.trim(),
        relatedSeriesId: linkType === 'series' ? linkedId : null,
        relatedWorkId: linkType === 'work' ? linkedId : null,
      })
      navigate(`/communaute/${community.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasOwnContent = content.series.length > 0 || content.works.length > 0

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Nouvelle communauté</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ouvert à tout le monde. Si tu es l'auteur de l'œuvre liée, ta communauté est certifiée automatiquement.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Nom de la communauté"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <textarea
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          {hasOwnContent && (
            <div className="rounded-lg border border-white/10 bg-surface-2 p-3.5">
              <p className="mb-2 text-xs font-semibold text-zinc-300">Lier à une de tes œuvres (optionnel)</p>
              <select
                value={linkType === 'none' ? 'none' : `${linkType}:${linkedId}`}
                onChange={(e) => {
                  if (e.target.value === 'none') {
                    setLinkType('none')
                    setLinkedId('')
                  } else {
                    const [type, id] = e.target.value.split(':')
                    setLinkType(type)
                    setLinkedId(id)
                  }
                }}
                className="w-full rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
              >
                <option value="none">Aucune (communauté générale)</option>
                {content.series.map((s) => (
                  <option key={s.id} value={`series:${s.id}`}>
                    {s.title} (BD)
                  </option>
                ))}
                {content.works.map((w) => (
                  <option key={w.id} value={`work:${w.id}`}>
                    {w.title} (écriture)
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? 'Création...' : 'Créer la communauté'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
