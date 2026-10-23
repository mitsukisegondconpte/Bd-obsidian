import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SeriesCard from '../components/ui/SeriesCard'
import Loader from '../components/ui/Loader'
import { useAuth } from '../context/AuthContext'
import { listAuthorSeries, listAuthorSeriesChapters } from '../api/series'

export default function MySeries() {
  const { user, profile } = useAuth()
  const userId = user?.id
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId || !profile?.is_lecture_author) return
    let active = true
    async function load() {
      setRows(null)
      setError('')
      try {
        const series = await listAuthorSeries(userId)
        const withChapters = await Promise.all(series.map(async (item) => {
          try {
            return { ...item, chapters: await listAuthorSeriesChapters(item.id) }
          } catch (err) {
            return {
              ...item,
              chapters: [],
              chaptersError: err?.message || 'Impossible de charger les chapitres de cette série.',
            }
          }
        }))
        if (active) setRows(withChapters)
      } catch (err) {
        if (active) setError(err.message || 'Impossible de charger tes séries.')
      }
    }
    load()
    return () => { active = false }
  }, [userId, profile?.is_lecture_author])

  if (!user) return <Layout><div className="px-4 py-16 text-center text-zinc-400">Connecte-toi pour accéder au studio auteur.</div></Layout>
  if (!profile) return <Layout><Loader className="py-16" /></Layout>
  if (!profile.is_lecture_author) return <Layout><div className="flex flex-col items-center gap-3 px-4 py-16 text-center"><Lock size={28} className="text-zinc-500" /><p className="text-sm text-zinc-400">Le studio Lecture est réservé aux auteurs autorisés.</p></div></Layout>
  if (!rows && !error) return <Layout><Loader className="py-16" /></Layout>
  if (!rows) return <Layout><p role="alert" className="p-6 text-sm text-red-500">{error}</p></Layout>

  const drafts = rows.filter((item) => !item.is_published)
  const published = rows.filter((item) => item.is_published)
  const totalChapters = rows.reduce((total, item) => total + item.chapters.length, 0)

  return (
    <Layout>
      <main className="px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-extrabold text-zinc-50">Bonjour {profile.display_name || profile.username}, bienvenue dans ton studio</h1><p className="mt-1 text-sm text-zinc-500">Gère les séries et reprends tes brouillons.</p></div><Link to="/creer-serie" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink"><Plus size={15} />Nouvelle série</Link></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Brouillons</p><p className="mt-2 text-2xl font-black text-zinc-50">{drafts.length}</p></div><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Publiées</p><p className="mt-2 text-2xl font-black text-zinc-50">{published.length}</p></div><div className="rounded-xl border border-white/10 bg-surface-1 p-4"><p className="text-xs font-semibold uppercase text-zinc-500">Chapitres</p><p className="mt-2 text-2xl font-black text-zinc-50">{totalChapters}</p></div></div>
        {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
        {rows.filter((item) => item.chaptersError).map((item) => (
          <p key={`chapters-error-${item.id}`} role="alert" className="mt-3 text-sm text-red-400">
            Les chapitres de « {item.title || 'Sans titre'} » n’ont pas pu être chargés : {item.chaptersError}
          </p>
        ))}
        {rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-zinc-400">Tu n’as pas encore de série.</p>
            <Link to="/creer-serie" className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-2 px-4 py-2 text-sm font-semibold text-zinc-200">
              Créer ma première série
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {rows.map((item) => (
              <section key={item.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{item.is_published ? 'Publiée' : 'Brouillon'}</p>
                    <h2 className="mt-1 text-lg font-bold text-zinc-50">{item.title || 'Sans titre'}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={item.is_published ? '/serie/' + item.slug : '/creer-serie?draft=' + item.id} className="rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                      {item.is_published ? 'Voir' : 'Continuer'}
                    </Link>
                    {!item.is_published && (
                      <Link to={'/serie/' + item.slug + '/ajouter-chapitre'} className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">
                        Nouveau chapitre
                      </Link>
                    )}
                  </div>
                </div>
                <div className="mt-4"><SeriesCard item={item} /></div>
                {item.chapters.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Chapitres</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.chapters.map((chapter) => (
                        <Link
                          key={chapter.id}
                          to={chapter.published_at ? '/serie/' + item.slug + '/chapitre/' + chapter.id : '/serie/' + item.slug + '/ajouter-chapitre/' + chapter.id}
                          className="rounded-full border border-white/10 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-zinc-300"
                        >
                          {chapter.title || 'Chapitre sans titre'}{chapter.published_at ? '' : ' • Brouillon'}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </Layout>
  )
}

