import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { listSeriesByAuthor, listSeriesChapters } from '../api/series'

export default function MySeries() {
  const { user, profile } = useAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !profile?.is_lecture_author) return
    let active = true
    async function load() {
      try {
        const series = await listSeriesByAuthor(user.id)
        const withChapters = await Promise.all(series.map(async (item) => ({ ...item, chapters: await listSeriesChapters(item.id) })))
        if (active) setRows(withChapters)
      } catch (err) {
        if (active) setError(err.message || 'Impossible de charger tes séries.')
      }
    }
    load()
    return () => { active = false }
  }, [user?.id, profile?.is_lecture_author])

  if (!user) return <Layout><div className="px-4 py-16 text-center text-zinc-400">Connecte-toi pour accéder au studio auteur.</div></Layout>
  if (!profile) return <Layout><Loader className="py-16" /></Layout>
  if (!profile.is_lecture_author) return <Layout><div className="flex flex-col items-center gap-3 px-4 py-16 text-center"><Lock size={28} className="text-zinc-500" /><p className="text-sm text-zinc-400">Le studio Lecture est réservé aux auteurs autorisés.</p></div></Layout>
  if (!rows && !error) return <Layout><Loader className="py-16" /></Layout>
  if (!rows) return <Layout><p role="alert" className="p-6 text-sm text-red-500">{error}</p></Layout>

  const drafts = rows.filter((item) => !item.is_published)
  const published = rows.filter((item) => item.is_published)
  const draftChapters = rows.reduce((total, item) => total + item.chapters.filter((chapter) => !chapter.published_at).length, 0)
  const totalChapters = rows.reduce((total, item) => total + item.chapters.length, 0)

  return (
    <Layout>
      <main className="px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-extrabold text-zinc-50">Bonjour {profile.display_name || profile.username}, bienvenue dans ton studio</h1><p className="mt-1 text-sm text-zinc-500">Gère les séries et reprends tes brouillons.</p></div><Link to="/creer-serie" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink"><Plus size={15} />Nouvelle série</Link></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Séries</p><p className="mt-1 text-2xl font-extrabold text-zinc-50">{rows.length}</p></div><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Publiées</p><p className="mt-1 text-2xl font-extrabold text-zinc-50">{published.length}</p></div><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Brouillons</p><p className="mt-1 text-2xl font-extrabold text-zinc-50">{drafts.length + draftChapters}</p></div><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Chapitres</p><p className="mt-1 text-2xl font-extrabold text-zinc-50">{totalChapters}</p></div></div>
        {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
        {rows.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-white/10 p-8 text-center"><p className="text-zinc-400">Tu n’as pas encore de série.</p><Link to="/creer-serie" className="mt-3 inline-flex text-sm font-semibold text-accent">Créer ta première série</Link></div> : <div className="mt-6 space-y-8 pb-10">{rows.map((item) => <section key={item.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-4"><div className="w-32 shrink-0"><SeriesCard item={item} /></div><div className="min-w-0"><h2 className="font-bold text-zinc-100">{item.title}</h2><p className="mt-1 text-xs text-zinc-500">{item.is_published ? 'Publiée' : 'Brouillon'} · {item.chapters.length} chapitre(s)</p><p className="mt-1 text-xs text-zinc-500">{item.chapters.filter((chapter) => !chapter.published_at).length} chapitre(s) en brouillon</p></div></div><div className="flex flex-wrap gap-2">{item.is_published ? <><Link to={'/serie/' + item.slug} className="rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300">Voir la série</Link><Link to={'/serie/' + item.slug + '/modifier'} className="rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-300">Modifier les détails</Link><Link to={'/serie/' + item.slug + '/ajouter-chapitre'} className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">Ajouter un chapitre</Link></> : <Link to={'/creer-serie?draft=' + encodeURIComponent(item.id)} className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">Continuer le brouillon</Link>}</div></div>
          {item.chapters.length > 0 && <div className="mt-4 border-t border-white/10 pt-3"><h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Chapitres</h3><div className="mt-2 space-y-2">{item.chapters.map((chapter) => <div key={chapter.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2"><p className="min-w-0 truncate text-sm text-zinc-300">{chapter.number}. {chapter.title} <span className="text-xs text-zinc-500">· {chapter.published_at ? 'Publié' : 'Brouillon'}</span></p><Link to={'/serie/' + item.slug + '/ajouter-chapitre/' + chapter.id} className="shrink-0 text-xs font-semibold text-accent">{chapter.published_at ? 'Modifier' : 'Continuer'}</Link></div>)}</div></div>}
        </section>)}</div>}
      </main>
    </Layout>
  )
}
