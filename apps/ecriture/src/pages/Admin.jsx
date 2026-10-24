import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Trash2, Upload, Send, Search, ImagePlus, Check, Handshake, X, Copy } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import {
  listAllProfiles,
  setProfileFlags,
  listAllWorks,
  deleteWorkAdmin,
  listCatalogImagesAdmin,
  uploadCatalogImage,
  deleteCatalogImage,
  listAllImageRequests,
  updateImageRequestStatus,
  deliverImageRequest,
  listAllEditionRequests,
  assignEditionRequest,
  updateEditionRequestStatus,
  deliverEditionFeedback,
  createWorkMigrationOffer,
  listAllWorkMigrations,
  getDashboardStats,
  listWorkReports,
  resolveWorkReport,
  setWorkFeatured,
  listPartnerAuthors,
  issueSignupAccessCode,
  listSignupAccessCodes,
  revokeSignupAccessCode,
} from '../api/admin'
import Loader from '../components/ui/Loader'

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'works', label: 'Œuvres' },
  { id: 'catalog', label: 'Catalogue' },
  { id: 'imageRequests', label: 'Demandes images' },
  { id: 'editionRequests', label: "Demandes d'édition" },
  { id: 'migrations', label: 'Repêchages' },
  { id: 'reports', label: 'Signalements' },
  { id: 'partners', label: 'Auteurs partenaires' },
  { id: 'accessCodes', label: "Codes d'accès" },
]

const PARTNER_SOURCE_LABEL = { bohio_mag: 'Bohio Mag', hypercube: 'Hypercube Obsidian' }

function PartnersTab() {
  const [profiles, setProfiles] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [message, setMessage] = useState(null)

  function reload() {
    return listPartnerAuthors().then(setProfiles)
  }
  useEffect(() => {
    reload().catch((error) => setMessage({ error: true, text: error.message }))
  }, [])

  async function handleVerify(p, verified) {
    setSavingId(p.id)
    setMessage(null)
    try {
      await setProfileFlags(p.id, { partnerVerified: verified })
      await reload()
      setMessage({ error: false, text: 'Vérification enregistrée.' })
    } catch (error) {
      setMessage({ error: true, text: error.message || "La modification n'a pas été enregistrée." })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-2">
      {message && (
        <p role="status" aria-live="polite" className={`text-sm ${message.error ? 'text-red-400' : 'text-emerald-400'}`}>
          {message.text}
        </p>
      )}
      {profiles?.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          Aucune inscription partenaire pour le moment.
        </p>
      )}
      {profiles?.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
          <div>
            <p className="text-sm font-semibold text-zinc-100">
              {p.display_name} <span className="font-normal text-zinc-500">@{p.username}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
              <Handshake size={12} /> {PARTNER_SOURCE_LABEL[p.author_source] ?? p.author_source}
              {p.partner_verified_at ? (
                <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-400">Vérifié</span>
              ) : (
                <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 font-semibold text-amber-400">En attente</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {p.partner_verified_at ? (
              <button
                type="button"
                onClick={() => handleVerify(p, false)}
                disabled={savingId === p.id}
                className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-red-500/20 hover:text-red-400"
              >
                <X size={13} /> Retirer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleVerify(p, true)}
                disabled={savingId === p.id}
                className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink hover:bg-accent-dark"
              >
                <Check size={13} /> Valider
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function FlagToggle({ active, onClick, label, activeClass, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition disabled:cursor-wait disabled:opacity-50 ${
        active ? activeClass : 'bg-surface-3 text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}

function DashboardTab() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])
  if (!stats) return <Loader className="p-6" />
  const cards = [
    { label: 'Utilisateurs', value: stats.totalProfiles },
    { label: 'Œuvres', value: stats.totalWorks },
    { label: 'Chapitres', value: stats.totalChapters },
    { label: 'Demandes images en attente', value: stats.pendingImageRequests },
    { label: "Demandes d'édition en attente", value: stats.pendingEditionRequests },
    { label: 'Signalements en attente', value: stats.unresolvedReports },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-white/5 bg-surface-1 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{c.label}</p>
          <p className="mt-1 text-2xl font-extrabold text-zinc-50">{c.value}</p>
        </div>
      ))}
    </div>
  )
}

function UsersTab({ currentUserId }) {
  const [profiles, setProfiles] = useState(null)
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [message, setMessage] = useState(null)

  function reload() {
    return listAllProfiles({ search }).then(setProfiles)
  }
  useEffect(() => {
    reload().catch((error) => setMessage({ error: true, text: error.message }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function toggle(p, field, key) {
    setSavingId(p.id)
    setMessage(null)
    try {
      await setProfileFlags(p.id, { [key]: !p[field] })
      await reload()
      setMessage({ error: false, text: 'Modification enregistrée.' })
    } catch (error) {
      setMessage({ error: true, text: error.message || "La modification n'a pas été enregistrée." })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      {message && (
        <p role="status" aria-live="polite" className={`mb-3 text-sm ${message.error ? 'text-red-400' : 'text-emerald-400'}`}>
          {message.text}
        </p>
      )}
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Chercher un utilisateur..."
          className="w-full rounded-full border border-white/10 bg-surface-2 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
        />
      </div>
      <div className="mt-4 space-y-2">
        {profiles?.map((p) => (
          <div key={p.id} className="rounded-lg border border-white/5 bg-surface-1 p-3">
            <p className="text-sm font-semibold text-zinc-100">
              {p.display_name} <span className="font-normal text-zinc-500">@{p.username}</span>{' '}
              {p.id === currentUserId && <span className="text-xs text-accent">(toi)</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <FlagToggle disabled={savingId === p.id} active={p.is_author} onClick={() => toggle(p, 'is_author', 'isAuthor')} label="Auteur" activeClass="bg-accent/20 text-accent" />
              <FlagToggle disabled={savingId === p.id} active={p.is_lecture_author} onClick={() => toggle(p, 'is_lecture_author', 'isLectureAuthor')} label="Auteur BD (site 1)" activeClass="bg-emerald-500/20 text-emerald-400" />
              <FlagToggle disabled={savingId === p.id} active={p.is_editor} onClick={() => toggle(p, 'is_editor', 'isEditor')} label="Éditeur" activeClass="bg-orange-500/20 text-orange-400" />
              <FlagToggle disabled={savingId === p.id} active={p.is_platform_admin} onClick={() => toggle(p, 'is_platform_admin', 'isPlatformAdmin')} label="Admin" activeClass="bg-hypercube-500/30 text-hypercube-400" />
              <FlagToggle disabled={savingId === p.id} active={p.is_suspended} onClick={() => toggle(p, 'is_suspended', 'isSuspended')} label="Suspendu" activeClass="bg-red-500/20 text-red-400" />
            </div>
          </div>
        ))}
        {profiles?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun résultat.</p>}
      </div>
    </div>
  )
}

function AccessCodesTab() {
  const [codeType, setCodeType] = useState('guest')
  const [validDays, setValidDays] = useState(7)
  const [issued, setIssued] = useState(null)
  const [codes, setCodes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [revokingId, setRevokingId] = useState(null)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  function reloadCodes() {
    return listSignupAccessCodes().then(setCodes)
  }

  useEffect(() => {
    reloadCodes().catch((error) => setMessage(error.message || 'Impossible de charger la liste des codes.'))
  }, [])

  async function handleIssue(e) {
    e.preventDefault()
    setBusy(true)
    setIssued(null)
    setCopied(false)
    setMessage('')
    try {
      setIssued(await issueSignupAccessCode({ codeType, validDays }))
      setMessage('Code créé. Copie-le avant de quitter cette page.')
      reloadCodes().catch(() => setMessage("Code créé, mais la liste n'a pas pu être actualisée."))
    } catch (error) {
      setMessage(error.message || "Le code n'a pas pu être créé.")
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(issued.access_code)
      setCopied(true)
      setMessage('Code copié.')
    } catch {
      setMessage('Copie automatique indisponible; sélectionne le code affiché.')
    }
  }

  async function handleRevoke(codeId) {
    setRevokingId(codeId)
    setMessage('')
    try {
      const revoked = await revokeSignupAccessCode(codeId)
      await reloadCodes()
      setMessage(revoked ? 'Code invalidé immédiatement.' : 'Ce code est déjà utilisé ou invalidé.')
    } catch (error) {
      setMessage(error.message || "Le code n'a pas pu être invalidé.")
    } finally {
      setRevokingId(null)
    }
  }

  function codeStatus(code) {
    if (code.revoked_at) return 'Invalidé'
    if (code.consumed_at) return 'Utilisé'
    if (new Date(code.expires_at).getTime() <= Date.now()) return 'Expiré'
    return 'Actif'
  }

  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-zinc-400">
        Chaque code est utilisable une seule fois et n'est affiché qu'à sa création. Le serveur conserve uniquement son
        empreinte.
      </p>
      <form onSubmit={handleIssue} className="flex flex-wrap items-end gap-3 rounded-xl border border-white/5 bg-surface-1 p-4">
        <label className="min-w-44 flex-1 text-xs font-semibold text-zinc-400">
          Type de code
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="guest">Compte invité</option>
            <option value="lecture_author">Auteur BD (site 1)</option>
          </select>
        </label>
        <label className="w-32 text-xs font-semibold text-zinc-400">
          Expiration
          <select
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100"
          >
            {[1, 7, 30, 90].map((days) => (
              <option key={days} value={days}>{days} jour{days > 1 ? 's' : ''}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:opacity-60"
        >
          {busy ? 'Création...' : 'Créer un code'}
        </button>
      </form>
      {issued && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs text-zinc-400">
            Expire le {new Date(issued.expires_at).toLocaleString('fr-FR')}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm text-zinc-100">
              {issued.access_code}
            </code>
            <button
              type="button"
              onClick={copyCode}
              aria-label="Copier le code"
              className="shrink-0 rounded-full border border-white/10 p-2 text-zinc-300 hover:text-accent"
            >
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-emerald-400">Code copié.</p>}
        </div>
      )}
      {message && <p role="status" aria-live="polite" className="text-sm text-zinc-300">{message}</p>}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-zinc-200">Codes récents</h2>
        {codes?.map((code) => {
          const active = codeStatus(code) === 'Actif'
          return (
            <div key={code.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 bg-surface-1 p-3">
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {code.code_type === 'guest' ? 'Compte invité' : 'Auteur BD (site 1)'}
                  <span className="ml-2 text-xs font-normal text-zinc-500">{codeStatus(code)}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Créé le {new Date(code.created_at).toLocaleString('fr-FR')} · expire le {new Date(code.expires_at).toLocaleString('fr-FR')}
                </p>
              </div>
              {active && (
                <button
                  type="button"
                  onClick={() => handleRevoke(code.id)}
                  disabled={revokingId === code.id}
                  className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {revokingId === code.id ? 'Invalidation...' : 'Invalider'}
                </button>
              )}
            </div>
          )
        })}
        {codes?.length === 0 && <p className="text-sm text-zinc-500">Aucun code généré.</p>}
      </section>
    </div>
  )
}

function WorksTab() {
  const [works, setWorks] = useState(null)
  function reload() {
    listAllWorks().then(setWorks)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleDelete(w) {
    if (!confirm(`Supprimer « ${w.title} » et tous ses chapitres ?`)) return
    await deleteWorkAdmin(w.id)
    reload()
  }

  async function handleOfferMigration(w) {
    if (!confirm(`Proposer un repêchage (vers la plateforme lecture) pour « ${w.title} » ?`)) return
    await createWorkMigrationOffer(w.id)
    alert('Offre envoyée.')
  }

  async function toggleFeatured(w) {
    await setWorkFeatured(w.id, !w.is_featured)
    reload()
  }

  return (
    <div className="space-y-2">
      {works?.map((w) => (
        <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
          <div className="min-w-0">
            <Link to={`/oeuvre/${w.id}`} className="truncate text-sm font-semibold text-zinc-100 hover:text-accent">
              {w.title}
            </Link>
            <p className="text-xs text-zinc-500">@{w.author?.username}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <FlagToggle
              active={w.is_featured}
              onClick={() => toggleFeatured(w)}
              label="HOS/Bohio Mag"
              activeClass="bg-hypercube-500/30 text-hypercube-400"
            />
            <button
              type="button"
              onClick={() => handleOfferMigration(w)}
              aria-label={`Proposer un repêchage pour ${w.title}`}
              className="rounded-full p-2 text-zinc-500 hover:bg-accent/10 hover:text-accent"
            >
              <Send size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(w)}
              aria-label={`Supprimer ${w.title}`}
              className="rounded-full p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {works?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucune œuvre.</p>}
    </div>
  )
}

function CatalogTab() {
  const [images, setImages] = useState(null)
  const [isFree, setIsFree] = useState(true)
  const [priceCents, setPriceCents] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  function reload() {
    listCatalogImagesAdmin().then(setImages)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadCatalogImage({ file, isFree, priceCents: isFree ? 0 : priceCents })
      reload()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id) {
    if (!confirm('Retirer cette image du catalogue ?')) return
    await deleteCatalogImage(id)
    reload()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} /> Gratuite
        </label>
        {!isFree && (
          <input
            type="number"
            min={0}
            value={priceCents / 100}
            onChange={(e) => setPriceCents(Math.round(Number(e.target.value) * 100))}
            placeholder="Prix (HTG)"
            className="w-24 rounded-lg border border-white/10 bg-surface-2 px-2 py-1 text-sm text-zinc-100"
          />
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
        >
          <Upload size={14} /> {uploading ? 'Envoi...' : 'Ajouter une image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images?.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg bg-surface-2">
            <img src={img.image_url} alt="" className="aspect-2/3 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1 text-[10px] font-semibold text-white">
              {img.is_free ? 'Gratuite' : `${(img.price_cents / 100).toLocaleString('fr-FR')} HTG`}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              aria-label="Retirer du catalogue"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {images?.length === 0 && <p className="col-span-full py-6 text-center text-sm text-zinc-500">Catalogue vide.</p>}
      </div>
    </div>
  )
}

function ImageRequestsTab({ currentUserId }) {
  const [requests, setRequests] = useState(null)
  const [uploadingId, setUploadingId] = useState(null)
  function reload() {
    listAllImageRequests().then(setRequests)
  }
  useEffect(() => {
    reload()
  }, [])

  async function updateStatus(id, status) {
    await updateImageRequestStatus(id, status)
    reload()
  }

  async function handleDeliver(request, file) {
    if (!file) return
    setUploadingId(request.id)
    try {
      await deliverImageRequest({ requestId: request.id, requesterId: request.requester_id, adminId: currentUserId, file })
      reload()
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="space-y-2">
      {requests?.map((r) => (
        <div key={r.id} className="rounded-lg border border-white/5 bg-surface-1 p-3">
          <p className="text-sm font-semibold text-zinc-100">@{r.requester?.username}</p>
          <p className="mt-1 text-sm text-zinc-400">{r.description}</p>

          {r.delivered_image?.image_url && (
            <img src={r.delivered_image.image_url} alt="Livrée" className="mt-2 h-24 w-16 rounded-lg object-cover" />
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={r.status}
              onChange={(e) => updateStatus(r.id, e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-2 px-2 py-1 text-xs text-zinc-200"
            >
              <option value="pending">En attente</option>
              <option value="in_discussion">En discussion</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>

            <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/30">
              <ImagePlus size={13} />
              {uploadingId === r.id ? 'Envoi...' : r.delivered_image ? "Remplacer l'image" : "Livrer l'image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingId === r.id}
                onChange={(e) => handleDeliver(r, e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      ))}
      {requests?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucune demande.</p>}
    </div>
  )
}

function EditionRequestsTab({ currentUserId }) {
  const [requests, setRequests] = useState(null)
  const [feedbackDrafts, setFeedbackDrafts] = useState({})
  const [sendingId, setSendingId] = useState(null)
  function reload() {
    listAllEditionRequests().then(setRequests)
  }
  useEffect(() => {
    reload()
  }, [])

  async function claim(r) {
    await assignEditionRequest(r.id, currentUserId)
    reload()
  }
  async function updateStatus(id, status) {
    await updateEditionRequestStatus(id, status)
    reload()
  }
  async function handleDeliverFeedback(r) {
    const feedback = (feedbackDrafts[r.id] ?? '').trim()
    if (!feedback) return
    setSendingId(r.id)
    try {
      await deliverEditionFeedback(r.id, feedback)
      setFeedbackDrafts((d) => ({ ...d, [r.id]: '' }))
      reload()
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="space-y-2">
      {requests?.map((r) => (
        <div key={r.id} className="rounded-lg border border-white/5 bg-surface-1 p-3">
          <p className="text-sm font-semibold text-zinc-100">
            {r.work?.title} <span className="font-normal text-zinc-500">— niveau {r.level}</span>
          </p>
          <p className="text-xs text-zinc-500">
            Auteur @{r.author?.username} · Éditeur {r.editor ? `@${r.editor.username}` : 'non assigné'}
          </p>

          {r.feedback && (
            <p className="mt-2 rounded-lg bg-surface-2 p-2 text-xs text-zinc-300">
              <span className="font-semibold text-accent">Retour envoyé : </span>
              {r.feedback}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!r.editor_id && (
              <button
                type="button"
                onClick={() => claim(r)}
                className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink hover:bg-accent-dark"
              >
                M'assigner
              </button>
            )}
            <select
              value={r.status}
              onChange={(e) => updateStatus(r.id, e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-2 px-2 py-1 text-xs text-zinc-200"
            >
              <option value="pending">En attente</option>
              <option value="assigned">Assignée</option>
              <option value="in_progress">En cours</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          <div className="mt-2 flex items-end gap-2">
            <textarea
              value={feedbackDrafts[r.id] ?? ''}
              onChange={(e) => setFeedbackDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
              placeholder="Écris le retour d'édition pour l'auteur..."
              rows={2}
              className="flex-1 rounded-lg border border-white/10 bg-surface-2 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleDeliverFeedback(r)}
              disabled={sendingId === r.id || !(feedbackDrafts[r.id] ?? '').trim()}
              className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink disabled:opacity-40"
            >
              <Send size={12} /> Envoyer
            </button>
          </div>
        </div>
      ))}
      {requests?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucune demande.</p>}
    </div>
  )
}

function MigrationsTab() {
  const [migrations, setMigrations] = useState(null)
  useEffect(() => {
    listAllWorkMigrations().then(setMigrations)
  }, [])

  const STATUS_LABEL = { proposed: 'Proposé', accepted: 'Accepté', declined: 'Refusé', completed: 'Terminé' }

  return (
    <div className="space-y-2">
      {migrations?.map((m) => (
        <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-1 p-3">
          <div>
            <p className="text-sm font-semibold text-zinc-100">{m.work?.title}</p>
            <p className="text-xs text-zinc-500">@{m.work?.author?.username}</p>
          </div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold uppercase text-zinc-300">
            {STATUS_LABEL[m.status] ?? m.status}
          </span>
        </div>
      ))}
      {migrations?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun repêchage proposé.</p>}
    </div>
  )
}

function ReportsTab() {
  const [reports, setReports] = useState(null)
  function reload() {
    listWorkReports().then(setReports)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleResolve(id) {
    await resolveWorkReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-3">
      {reports?.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          Aucun signalement en attente.
        </p>
      )}
      {reports?.map((r) => (
        <div key={r.id} className="rounded-lg border border-white/5 bg-surface-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link to={`/oeuvre/${r.work?.id}`} className="font-semibold text-zinc-100 hover:text-accent">
                {r.work?.title ?? 'Œuvre supprimée'}
              </Link>
              <p className="mt-1 text-sm text-zinc-400">{r.reason}</p>
              <p className="mt-1 text-xs text-zinc-600">
                Signalé par @{r.reporter?.username} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleResolve(r.id)}
              aria-label="Marquer comme résolu"
              className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-accent hover:text-accent-ink"
            >
              <Check size={14} /> Résolu
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Admin() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('dashboard')

  if (!user || !profile) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  if (!profile.is_platform_admin) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <ShieldAlert className="mx-auto mb-3 text-zinc-600" size={32} />
          <p className="text-sm text-zinc-500">Réservé aux administrateurs.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Administration</h1>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                tab === t.id
                  ? 'bg-accent text-accent-ink'
                  : 'border border-white/10 bg-surface-2 text-zinc-300 hover:border-accent/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 pb-8">
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'users' && <UsersTab currentUserId={user.id} />}
          {tab === 'works' && <WorksTab />}
          {tab === 'catalog' && <CatalogTab />}
          {tab === 'imageRequests' && <ImageRequestsTab currentUserId={user.id} />}
          {tab === 'editionRequests' && <EditionRequestsTab currentUserId={user.id} />}
          {tab === 'migrations' && <MigrationsTab />}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'partners' && <PartnersTab />}
          {tab === 'accessCodes' && <AccessCodesTab />}
        </div>
      </div>
    </Layout>
  )
}
