import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Trash2, Check, Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { listChannelReports, listChannels, resolveChannelReport } from '../api/channels'
import { listCommunities, listReports, resolveReport } from '../api/communities'
import { listAllProfiles, setProfileFlags, deleteCommunityAdmin, deleteChannelAdmin, getDashboardStats } from '../api/admin'

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'communities', label: 'Communautés' },
  { id: 'channels', label: 'Canaux' },
  { id: 'reports', label: 'Signalements' },
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
    { label: 'Canaux', value: stats.totalChannels },
    { label: 'Communautés', value: stats.totalCommunities },
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

function CommunitiesTab() {
  const [communities, setCommunities] = useState(null)
  function reload() {
    listCommunities().then(setCommunities)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleDelete(c) {
    if (!confirm(`Supprimer la communauté « ${c.name} » ?`)) return
    await deleteCommunityAdmin(c.id)
    reload()
  }

  return (
    <div className="space-y-2">
      {communities?.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
          <div className="min-w-0">
            <Link to={`/communaute/${c.id}`} className="truncate text-sm font-semibold text-zinc-100 hover:text-accent">
              {c.name}
            </Link>
            <p className="text-xs text-zinc-500">
              @{c.creator?.username} {c.is_validated && '· certifiée'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(c)}
            aria-label={`Supprimer ${c.name}`}
            className="shrink-0 rounded-full p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {communities?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucune communauté.</p>}
    </div>
  )
}

function ChannelsTab() {
  const [channels, setChannels] = useState(null)
  function reload() {
    listChannels().then(setChannels)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleDelete(c) {
    if (!confirm(`Supprimer le canal « ${c.name} » ?`)) return
    await deleteChannelAdmin(c.id)
    reload()
  }

  return (
    <div className="space-y-2">
      {channels?.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-surface-1 p-3">
          <div className="min-w-0">
            <Link to={`/canal/${c.id}`} className="truncate text-sm font-semibold text-zinc-100 hover:text-accent">
              {c.name}
            </Link>
            <p className="text-xs text-zinc-500">@{c.owner?.username}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(c)}
            aria-label={`Supprimer ${c.name}`}
            className="shrink-0 rounded-full p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {channels?.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun canal.</p>}
    </div>
  )
}

function ReportsTab() {
  const [communityReports, setCommunityReports] = useState(null)
  const [channelReports, setChannelReports] = useState(null)

  function reload() {
    listReports().then(setCommunityReports)
    listChannelReports().then(setChannelReports)
  }
  useEffect(() => {
    reload()
  }, [])

  async function handleResolveCommunity(id) {
    await resolveReport(id)
    setCommunityReports((prev) => prev.filter((r) => r.id !== id))
  }

  async function handleResolveChannel(id) {
    await resolveChannelReport(id)
    setChannelReports((prev) => prev.filter((r) => r.id !== id))
  }

  const noReports = communityReports?.length === 0 && channelReports?.length === 0

  return (
    <div className="space-y-6">
      {noReports && (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          Aucun signalement en attente.
        </p>
      )}

      {communityReports?.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Communautés</h3>
          <div className="space-y-3">
            {communityReports.map((r) => (
              <div key={r.id} className="rounded-lg border border-white/5 bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/communaute/${r.community?.id}`} className="font-semibold text-zinc-100 hover:text-accent">
                      {r.community?.name ?? 'Communauté supprimée'}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">{r.reason}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Signalé par @{r.reporter?.username} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolveCommunity(r.id)}
                    aria-label="Marquer comme résolu"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-accent hover:text-accent-ink"
                  >
                    <Check size={14} /> Résolu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {channelReports?.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Canaux</h3>
          <div className="space-y-3">
            {channelReports.map((r) => (
              <div key={r.id} className="rounded-lg border border-white/5 bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/canal/${r.channel?.id}`} className="font-semibold text-zinc-100 hover:text-accent">
                      {r.channel?.name ?? 'Canal supprimé'}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">{r.reason}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Signalé par @{r.reporter?.username} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolveChannel(r.id)}
                    aria-label="Marquer comme résolu"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-accent hover:text-accent-ink"
                  >
                    <Check size={14} /> Résolu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
          {tab === 'communities' && <CommunitiesTab />}
          {tab === 'channels' && <ChannelsTab />}
          {tab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </Layout>
  )
}
