import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Layout from '../components/layout/Layout'
import ChannelCard from '../components/ui/ChannelCard'
import { useAuth } from '../context/AuthContext'
import { listChannels } from '../api/channels'

export default function Channels() {
  const { profile } = useAuth()
  const [channels, setChannels] = useState(null)

  useEffect(() => {
    listChannels().then(setChannels)
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-zinc-50">Canaux</h1>
          {profile?.is_author && (
            <Link to="/creer-canal" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink">
              <Plus size={15} /> Nouveau canal
            </Link>
          )}
        </div>
        {!profile?.is_author && (
          <p className="mt-1 text-xs text-zinc-500">
            Seuls les auteurs (ayant publié sur la plateforme lecture ou écriture) peuvent ouvrir un canal.
          </p>
        )}

        <div className="mt-5 space-y-2 pb-6">
          {channels?.map((c) => (
            <ChannelCard key={c.id} channel={c} />
          ))}
          {channels && channels.length === 0 && <p className="text-sm text-zinc-500">Aucun canal pour l'instant.</p>}
        </div>
      </div>
    </Layout>
  )
}
