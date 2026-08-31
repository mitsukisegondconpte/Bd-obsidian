import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShieldAlert } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { listReports, resolveReport } from '../api/communities'

export default function AdminReports() {
  const { profile } = useAuth()
  const [reports, setReports] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile) return
    listReports().then(setReports).catch((e) => setError(e.message))
  }, [profile])

  if (!profile) {
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

  async function handleResolve(id) {
    await resolveReport(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Signalements en attente</h1>
        <p className="mt-1 text-sm text-zinc-500">Communautés signalées par des utilisateurs, non résolues.</p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-5 space-y-3 pb-6">
          {reports?.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
              Aucun signalement en attente.
            </p>
          )}
          {reports?.map((r) => (
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
      </div>
    </Layout>
  )
}
