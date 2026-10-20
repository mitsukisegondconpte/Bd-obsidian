import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import SectionHeader from '../components/ui/SectionHeader'
import ChannelCard from '../components/ui/ChannelCard'
import CommunityCard from '../components/ui/CommunityCard'
import IntroBanner from '../components/ui/IntroBanner'
import Skeleton from '../components/ui/Skeleton'
import { listChannels } from '../api/channels'
import { listCommunities } from '../api/communities'

export default function Home() {
  const [channels, setChannels] = useState(null)
  const [communities, setCommunities] = useState(null)

  useEffect(() => {
    listChannels().then((c) => setChannels(c.slice(0, 4)))
    listCommunities().then((c) => setCommunities(c.slice(0, 4)))
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <IntroBanner>
          <h1 className="font-display max-w-md text-2xl font-extrabold text-zinc-50 sm:text-3xl">
            Suis tes auteurs préférés, rejoins des communautés de fans.
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Les auteurs ouvrent des canaux pour annoncer leurs sorties. Toi, crée ou rejoins un groupe de discussion
            autour des œuvres que tu aimes.
          </p>
          <div className="mt-4 flex gap-2">
            <Link to="/canaux" className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink">
              Voir les canaux
            </Link>
            <Link to="/communautes" className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200">
              Voir les communautés
            </Link>
          </div>
        </IntroBanner>

        <section className="mt-8">
          <SectionHeader title="Canaux" subtitle="Les annonces des auteurs" to="/canaux" />
          <div className="space-y-2">
            {!channels &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            {channels?.map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
            {channels?.length === 0 && <p className="text-sm text-zinc-500">Aucun canal pour l'instant.</p>}
          </div>
        </section>

        <section className="mt-8 pb-6">
          <SectionHeader title="Communautés" subtitle="Groupes de fans" to="/communautes" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {!communities &&
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            {communities?.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
            {communities?.length === 0 && <p className="text-sm text-zinc-500">Aucune communauté pour l'instant.</p>}
          </div>
        </section>
      </div>
    </Layout>
  )
}
