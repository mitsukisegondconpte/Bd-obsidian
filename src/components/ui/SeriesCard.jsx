import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

const CORNER_CLIP =
  '[clip-path:polygon(0_14px,14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%)]'

// size: 'md' (grille par défaut) | 'sm' (rails horizontaux)
export default function SeriesCard({ item, size = 'md' }) {
  const widthClass = size === 'sm' ? 'w-[132px] sm:w-[150px]' : 'w-full'
  const ribbon = item.isHot ? 'Tendance' : item.isNew ? 'Nouveau' : null

  return (
    <Link
      to={`/serie/${item.slug}`}
      className={`group shrink-0 ${widthClass} transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-1.5deg]`}
    >
      <div
        className={`relative aspect-2/3 overflow-hidden bg-surface-2 shadow-lg shadow-black/40 ring-1 ring-white/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-accent/20 ${CORNER_CLIP}`}
      >
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />

        {ribbon && (
          <div className="absolute -left-9 top-3 w-32 -rotate-45 bg-accent py-0.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-accent-ink shadow-md">
            {ribbon}
          </div>
        )}

        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Star size={12} className="fill-accent text-accent" />
          {item.rating}
        </div>
      </div>

      <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-accent">
        {item.title}
      </h3>
      <p className="line-clamp-1 text-xs text-zinc-500">{item.genres.join(' · ')}</p>
    </Link>
  )
}
