import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Trash2, Upload, Send, Search, ImagePlus, Check, Handshake, X } from 'lucide-react'
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
]

const PARTNER_SOURCE_LABEL = { bohio_mag: 'Bohio Mag', hypercube: 'Hypercube Obsidian' }

function PartnersTab() {
  const [profiles, setProfiles] = useState(null)

  function reload() {
    listPartnerAuthors().then(setProfiles)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleVerify(p, verified) {
    await setProfileFlags(p.id, { partnerVerified: verified })
    reload()
  }

  return (
    <div className="space-y-2">
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
                className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-red-500/20 hover:text-red-400"
              >
                <X size={13} /> Retirer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleVerify(p, true)}
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

function FlagToggle({ active, onClick, label, activeClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition ${
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

  function reload() {
    listAllProfiles({ search }).then(setProfiles)
  }
  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function toggle(p, field, key) {
    await setProfileFlags(p.id, { [key]: !p[field] })
    reload()
  }

  return (
    <div>
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
              <FlagToggle active={p.is_author} onClick={() => toggle(p, 'is_author', 'isAuthor')} label="Auteur" activeClass="bg-accent/20 text-accent" />
              <FlagToggle active={p.is_editor} onClick={() => toggle(p, 'is_editor', 'isEditor')} label="Éditeur" activeClass="bg-orange-500/20 text-orange-400" />
              <FlagToggle active={p.is_platform_admin} onClick={() => toggle(p, 'is_platform_admin', 'isPlatformAdmin')} label="Admin" activeClass="bg-hypercube-500/30 text-hypercube-400" />
              <FlagToggle active={p.is_suspended} onClick={() => toggle(p, 'is_suspended', 'isSuspended')} label="Suspendu" activeClass="bg-red-500/20 text-red-400" />
            </div>
          </div>
        ))}
        {profiles?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun résultat.</p>}
      </div>
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
        </div>
      </div>
    </Layout>
  )
}
