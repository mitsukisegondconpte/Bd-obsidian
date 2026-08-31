import { useState } from 'react'
import { ExternalLink, Grid2x2 } from 'lucide-react'

// Redirections inter-plateformes (doc client, point "c") : les 3 apps sont
// des déploiements séparés mais partagent la même base — ce menu les relie.
const PLATFORMS = [
  { name: 'Lecture & BD', url: 'https://bd-obsidian-lecture.vercel.app', current: false },
  { name: 'Écriture', url: '#', current: true },
  { name: 'Communauté', url: 'https://bd-obsidian-communaute.vercel.app', current: false },
]

export default function PlatformSwitcher() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer de plateforme Hypercube"
        className="rounded-full p-2 text-zinc-300 hover:bg-surface-2"
      >
        <Grid2x2 size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface-1 shadow-2xl">
            <p className="border-b border-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
              Plateformes Hypercube
            </p>
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.current ? undefined : p.url}
                target={p.current ? undefined : '_blank'}
                rel="noreferrer"
                aria-current={p.current}
                className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                  p.current ? 'cursor-default bg-accent/10 font-bold text-accent' : 'text-zinc-200 hover:bg-surface-2'
                }`}
              >
                {p.name}
                {!p.current && <ExternalLink size={13} className="text-zinc-500" />}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
