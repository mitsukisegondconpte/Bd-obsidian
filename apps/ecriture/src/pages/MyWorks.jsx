import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ExternalLink, Plus, Sparkles } from 'lucide-react'
import Layout from '../components/layout/Layout'
import WorkCard from '../components/ui/WorkCard'
import { useAuth } from '../context/AuthContext'
import { listMyWorkMigrations, listWorksByAuthor, respondToWorkMigration } from '../api/works'

export default function MyWorks() {
  const { user } = useAuth()
  const [works, setWorks] = useState(null)
  const [migrations, setMigrations] = useState([])

  useEffect(() => {
    if (!user) return
    listWorksByAuthor(user.id).then(setWorks)
    listMyWorkMigrations(user.id).then(setMigrations)
  }, [user])

  if (!user) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Connecte-toi pour voir tes œuvres.</p>
      </Layout>
    )
  }

  async function respond(id, accept) {
    await respondToWorkMigration(id, accept)
    if (accept) {
      // Le trigger côté base crée la série et passe le statut à 'completed'
      // dans la même opération — on recharge pour récupérer son slug.
      listMyWorkMigrations(user.id).then(setMigrations)
    } else {
      setMigrations((m) => m.filter((mig) => mig.id !== id))
    }
  }

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-zinc-50">Mes œuvres</h1>
          <Link
            to="/creer"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink"
          >
            <Plus size={15} /> Nouvelle œuvre
          </Link>
        </div>

        {migrations.length > 0 && (
          <div className="mt-5 space-y-3">
            {migrations.map((m) =>
              m.status === 'completed' ? (
                <div key={m.id} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 size={16} /> « {m.work.title} » a sa série sur Lecture
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    L'œuvre reste ici telle quelle. Une série vide a été créée sur la plateforme Lecture à ton nom
                    — vas-y ajouter des planches illustrées quand tu veux.
                  </p>
                  {m.new_series?.slug && (
                    <a
                      href={`https://bd-obsidian-lecture.vercel.app/serie/${m.new_series.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Voir la série <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              ) : (
                <div key={m.id} className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-accent">
                    <Sparkles size={16} /> Hypercube Obsidian s'intéresse à « {m.work.title} »
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Si tu acceptes, une série à ton nom est créée sur la plateforme Lecture, prête à recevoir des
                    planches illustrées — cette œuvre reste ici inchangée, sur écriture.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => respond(m.id, true)}
                      className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-ink"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(m.id, false)}
                      className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-zinc-300"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 pb-6 sm:grid-cols-4 md:grid-cols-5">
          {works?.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
          {works && works.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">
              Tu n'as pas encore publié d'œuvre.
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
