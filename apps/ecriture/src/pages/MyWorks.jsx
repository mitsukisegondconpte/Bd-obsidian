import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
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
    setMigrations((m) => m.filter((mig) => mig.id !== id))
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
            {migrations.map((m) => (
              <div key={m.id} className="rounded-xl border border-accent/30 bg-accent/10 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-accent">
                  <Sparkles size={16} /> Hypercube Obsidian s'intéresse à « {m.work.title} »
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Ton œuvre pourrait être republiée sur la plateforme de lecture. Si tu acceptes, elle sera retirée
                  d'ici et tu deviendras membre — les chapitres déjà lus par le public resteront gratuits, les
                  suivants seront payants.
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
            ))}
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
