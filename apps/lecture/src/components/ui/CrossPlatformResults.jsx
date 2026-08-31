import { Link } from 'react-router-dom'
import { ExternalLink, Feather, Hash, User, Users } from 'lucide-react'
import { globalSearch } from '../../api/search'
import { useEffect, useState } from 'react'

const ECRITURE_URL = 'https://bd-obsidian-ecriture.vercel.app'
const COMMUNAUTE_URL = 'https://bd-obsidian-communaute.vercel.app'

const TYPE_META = {
  work: { icon: Feather, href: (item) => `${ECRITURE_URL}/oeuvre/${item.id}`, external: true },
  community: { icon: Users, href: (item) => `${COMMUNAUTE_URL}/communaute/${item.id}`, external: true },
  channel: { icon: Hash, href: (item) => `${COMMUNAUTE_URL}/canal/${item.id}`, external: true },
  author: { icon: User, href: (item) => `/profil/${item.slug}`, external: false },
}

// Résultats des 2 autres plateformes Hypercube (même compte, même recherche) —
// exclut 'series' puisque c'est déjà le contenu natif de cette app.
export default function CrossPlatformResults({ query }) {
  const [results, setResults] = useState(null)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults(null)
      return
    }
    const timer = setTimeout(() => {
      globalSearch(q)
        .then((data) => setResults(data.filter((r) => r.result_type !== 'series')))
        .catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (!query.trim() || !results?.length) return null

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
        Sur les autres plateformes Hypercube
      </h2>
      <div className="space-y-1.5">
        {results.map((item) => {
          const meta = TYPE_META[item.result_type]
          if (!meta) return null
          const Icon = meta.icon
          const content = (
            <span className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-surface-1 px-3.5 py-2.5 text-sm hover:border-accent/30">
              <span className="flex min-w-0 items-center gap-2 text-zinc-200">
                <Icon size={14} className="shrink-0 text-accent" />
                <span className="truncate">{item.title}</span>
                <span className="shrink-0 text-xs text-zinc-600">— {item.subtitle}</span>
              </span>
              {meta.external && <ExternalLink size={13} className="shrink-0 text-zinc-600" />}
            </span>
          )
          return meta.external ? (
            <a key={`${item.result_type}-${item.id}`} href={meta.href(item)} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <Link key={`${item.result_type}-${item.id}`} to={meta.href(item)}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
