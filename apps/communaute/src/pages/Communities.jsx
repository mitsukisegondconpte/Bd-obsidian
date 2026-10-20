import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import CommunityCard from '../components/ui/CommunityCard'
import { listCommunities } from '../api/communities'

export default function Communities() {
  const [communities, setCommunities] = useState(null)

  useEffect(() => {
    listCommunities().then(setCommunities)
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-zinc-50">Communautés</h1>
          <Link to="/creer-communaute" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink">
            <Plus size={15} /> Créer un groupe
          </Link>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Ouvert à tout le monde. Le badge bleu signale une communauté certifiée.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities?.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
          {communities && communities.length === 0 && (
            <p className="col-span-full text-sm text-zinc-500">Aucune communauté pour l'instant.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
