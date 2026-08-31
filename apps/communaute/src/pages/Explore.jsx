import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Layout from '../components/layout/Layout'
import CommunityCard from '../components/ui/CommunityCard'
import ChannelCard from '../components/ui/ChannelCard'
import CrossPlatformResults from '../components/ui/CrossPlatformResults'
import { listCommunities } from '../api/communities'
import { listChannels } from '../api/channels'

const TABS = [
  { id: 'communities', label: 'Communautés' },
  { id: 'channels', label: 'Canaux' },
]

export default function Explore() {
  const [tab, setTab] = useState('communities')
  const [communities, setCommunities] = useState(null)
  const [channels, setChannels] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    listCommunities().then(setCommunities)
    listChannels().then(setChannels)
  }, [])

  function handleQueryChange(value) {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const filteredCommunities = useMemo(() => {
    if (!communities) return []
    const q = query.trim().toLowerCase()
    if (!q) return communities
    return communities.filter((c) => c.name.toLowerCase().includes(q))
  }, [communities, query])

  const filteredChannels = useMemo(() => {
    if (!channels) return []
    const q = query.trim().toLowerCase()
    if (!q) return channels
    return channels.filter((c) => c.name.toLowerCase().includes(q))
  }, [channels, query])

  return (
    <Layout>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Explorer</h1>

        <div className="relative mt-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Chercher une communauté, un canal, un auteur..."
            className="w-full rounded-full border border-white/10 bg-surface-2 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                tab === t.id
                  ? 'bg-accent text-accent-ink'
                  : 'border border-white/10 bg-surface-2 text-zinc-300 hover:border-accent/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'communities' ? (
          <div className="mt-5 grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2">
            {filteredCommunities.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
            {communities && filteredCommunities.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-zinc-500">
                {query ? `Aucun résultat pour "${query}".` : 'Aucune communauté pour l’instant.'}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-2 pb-6">
            {filteredChannels.map((c) => (
              <ChannelCard key={c.id} channel={c} />
            ))}
            {channels && filteredChannels.length === 0 && (
              <p className="py-10 text-center text-sm text-zinc-500">
                {query ? `Aucun résultat pour "${query}".` : 'Aucun canal pour l’instant.'}
              </p>
            )}
          </div>
        )}

        <CrossPlatformResults query={query} />
      </div>
    </Layout>
  )
}
