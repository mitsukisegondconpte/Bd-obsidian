import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, MessageCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { createWork } from '../api/works'
import { createImageRequest, listCatalogImages, uploadCoverFile, uploadExternalImage } from '../api/images'

const COVER_TABS = [
  { id: 'catalog', label: 'Catalogue' },
  { id: 'upload', label: 'Depuis mon appareil' },
  { id: 'url', label: 'Coller un lien' },
  { id: 'custom', label: 'Sur mesure' },
]

export default function CreateWork() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [workType, setWorkType] = useState('novel')
  const [tagsInput, setTagsInput] = useState('')

  const [coverTab, setCoverTab] = useState('catalog')
  const [catalogImages, setCatalogImages] = useState([])
  const [selectedImageId, setSelectedImageId] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customRequestSent, setCustomRequestSent] = useState(false)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listCatalogImages().then(setCatalogImages)
  }, [])

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <Lock size={28} className="text-zinc-600" />
          <p className="text-zinc-400">Connecte-toi pour créer une œuvre.</p>
        </div>
      </Layout>
    )
  }

  async function handleCustomRequest() {
    if (!customDescription.trim()) return
    await createImageRequest({ requesterId: user.id, description: customDescription.trim() })
    setCustomRequestSent(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      let coverImageId = selectedImageId

      if (coverTab === 'upload' && uploadedFile) {
        const img = await uploadCoverFile({ ownerId: user.id, file: uploadedFile })
        coverImageId = img.id
      } else if (coverTab === 'url' && externalUrl.trim()) {
        const img = await uploadExternalImage({ ownerId: user.id, imageUrl: externalUrl.trim() })
        coverImageId = img.id
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)

      const work = await createWork({
        authorId: user.id,
        title: title.trim(),
        synopsis: synopsis.trim(),
        workType,
        tags,
        coverImageId: coverTab === 'custom' ? null : coverImageId,
      })

      navigate(`/oeuvre/${work.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Nouvelle œuvre</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gratuit et ouvert à tous. Tu pourras ajouter des chapitres juste après.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex gap-2">
            {[
              { id: 'novel', label: 'Roman' },
              { id: 'light_novel', label: 'Light novel' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setWorkType(t.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  workType === t.id ? 'bg-accent text-accent-ink' : 'border border-white/10 bg-surface-2 text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            required
            placeholder="Titre de l'œuvre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          <textarea
            required
            rows={4}
            placeholder="Résumé"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

          <input
            placeholder="Tags séparés par des virgules (ex: fantastique, lycée)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />

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
              {coverTab === 'catalog' && (
                <div className="grid grid-cols-4 gap-2">
                  {catalogImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImageId(img.id)}
                      className={`relative aspect-2/3 overflow-hidden rounded-lg ring-2 ${
                        selectedImageId === img.id ? 'ring-accent' : 'ring-transparent'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 left-1">
                        {img.is_free ? (
                          <Badge variant="free">Gratuit</Badge>
                        ) : (
                          <Badge variant="paid">{(img.price_cents / 100).toFixed(0)} HTG</Badge>
                        )}
                      </span>
                      {selectedImageId === img.id && (
                        <span className="absolute right-1 top-1 rounded-full bg-accent p-0.5 text-accent-ink">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {coverTab === 'upload' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3.5 file:py-1.5 file:text-sm file:font-semibold file:text-zinc-200"
                />
              )}

              {coverTab === 'url' && (
                <input
                  type="url"
                  placeholder="https://..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                />
              )}

              {coverTab === 'custom' && (
                <div className="rounded-lg border border-white/10 bg-surface-2 p-3.5">
                  {customRequestSent ? (
                    <p className="flex items-center gap-2 text-sm text-emerald-400">
                      <Check size={16} /> Demande envoyée. On te contacte pour la suite.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500">
                        Décris l'image souhaitée. Un membre Hypercube te contactera sur WhatsApp pour finaliser
                        (image payante, prix discuté directement).
                      </p>
                      <textarea
                        rows={3}
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Ex: Une jeune fille sur un toit à Jacmel, au coucher du soleil..."
                        className="mt-2 w-full rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCustomRequest}
                        className="mt-2 flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-ink"
                      >
                        <MessageCircle size={13} /> Envoyer la demande
                      </button>
                    </>
                  )}
                  <p className="mt-2 text-[11px] text-zinc-600">
                    L'œuvre sera créée sans couverture pour l'instant — tu pourras l'ajouter une fois l'image reçue.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? 'Création...' : "Créer l'œuvre"}
          </button>
        </form>
      </div>
    </Layout>
  )
}
