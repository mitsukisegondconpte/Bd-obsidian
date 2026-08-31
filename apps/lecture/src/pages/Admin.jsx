import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Trash2, Plus, Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Badge from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { listSeries } from '../api/series'
import { listGenres } from '../api/genres'
import {
  listAllProfiles,
  setProfileFlags,
  deleteSeriesAdmin,
  createGenre,
  deleteGenre,
  getDashboardStats,
} from '../api/admin'

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'series', label: 'Séries' },
  { id: 'genres', label: 'Genres' },
]

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
  if (!stats) return <p className="text-sm text-zinc-500">Chargement...</p>
  const cards = [
    { label: 'Utilisateurs', value: stats.totalProfiles },
    { label: 'Séries', value: stats.totalSeries },
    { label: 'Chapitres', value: stats.totalChapters },
    { label: 'Vues cumulées', value: stats.totalViews.toLocaleString('fr-FR') },
    { label: 'Revenus', value: `${(stats.totalRevenueCents / 100).toLocaleString('fr-FR')} HTG` },
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
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  {p.display_name} <span className="font-normal text-zinc-500">@{p.username}</span>
                </p>
              </div>
              {p.id === currentUserId && <Badge variant="neutral">toi</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <FlagToggle
                active={p.is_author}
                onClick={() => toggle(p, 'is_author', 'isAuthor')}
                label="Auteur"
                activeClass="bg-accent/20 text-accent"
              />
              <FlagToggle
                active={p.is_editor}
                onClick={() => toggle(p, 'is_editor', 'isEditor')}
                label="Éditeur"
                activeClass="bg-orange-500/20 text-orange-400"
              />
              <FlagToggle
                active={p.is_platform_admin}
                onClick={() => toggle(p, 'is_platform_admin', 'isPlatformAdmin')}
                label="Admin"
                activeClass="bg-hypercube-500/30 text-hypercube-400"
              />
              <FlagToggle
                active={p.is_suspended}
                onClick={() => toggle(p, 'is_suspended', 'isSuspended')}
                label="Suspendu"
                activeClass="bg-red-500/20 text-red-400"
              />
            </div>
          </div>
        ))}
        {profiles?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun résultat.</p>}
      </div>
    </div>
  )
}

function SeriesTab() {
  const [series, setSeries] = useState(null)

  function reload() {
    listSeries().then(setSeries)
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleDelete(s) {
    if (!confirm(`Supprimer « ${s.title} » et tous ses chapitres ?`)) return
    await deleteSeriesAdmin(s.id)
    reload()
  }

  return (
    <div className="space-y-2">
      {series?.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
          <div className="min-w-0">
            <Link to={`/serie/${s.slug}`} className="truncate text-sm font-semibold text-zinc-100 hover:text-accent">
              {s.title}
            </Link>
            <p className="text-xs text-zinc-500">
              @{s.author?.username} · {s.views.toLocaleString('fr-FR')} vues
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(s)}
            aria-label={`Supprimer ${s.title}`}
            className="shrink-0 rounded-full p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {series?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucune série.</p>}
    </div>
  )
}

function GenresTab() {
  const [genres, setGenres] = useState(null)
  const [newGenre, setNewGenre] = useState('')

  function reload() {
    listGenres().then(setGenres)
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newGenre.trim()) return
    await createGenre(newGenre.trim())
    setNewGenre('')
    reload()
  }

  async function handleDelete(name) {
    if (!confirm(`Retirer le genre « ${name} » ?`)) return
    await deleteGenre(name)
    reload()
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
          placeholder="Nouveau genre..."
          className="flex-1 rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-accent px-3.5 py-2 text-sm font-bold text-accent-ink hover:bg-accent-dark"
        >
          <Plus size={16} /> Ajouter
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {genres?.map((g) => (
          <span
            key={g}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-2 py-1 pl-3 pr-1.5 text-xs font-semibold text-zinc-300"
          >
            {g}
            <button
              type="button"
              onClick={() => handleDelete(g)}
              aria-label={`Retirer ${g}`}
              className="rounded-full p-0.5 text-zinc-500 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('dashboard')

  if (!user || !profile) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
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
          {tab === 'series' && <SeriesTab />}
          {tab === 'genres' && <GenresTab />}
        </div>
      </div>
    </Layout>
  )
}
