import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import Badge from './Badge'

// size: 'md' (grille par défaut) | 'sm' (rails horizontaux)
export default function SeriesCard({ item, size = 'md' }) {
  const widthClass = size === 'sm' ? 'w-[132px] sm:w-[150px]' : 'w-full'

  return (
    <Link to={`/serie/${item.slug}`} className={`group shrink-0 ${widthClass}`}>
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-white/5">
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
          {item.isNew && <Badge variant="new">Nouveau</Badge>}
          {item.isHot && <Badge variant="hot">Tendance</Badge>}
        </div>

        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Star size={12} className="fill-brand-yellow text-brand-yellow" />
          {item.rating}
        </div>
      </div>

      <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-brand-yellow">
        {item.title}
      </h3>
      <p className="line-clamp-1 text-xs text-zinc-500">{item.genres.join(' · ')}</p>
    </Link>
  )
}
