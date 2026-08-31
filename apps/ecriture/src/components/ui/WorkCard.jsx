import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Badge from './Badge'
import { bookCoverPlaceholder } from '../../utils/placeholders'

export default function WorkCard({ work, size = 'md' }) {
  const widthClass = size === 'sm' ? 'w-[132px] sm:w-[150px]' : 'w-full'
  const cover = work.cover?.image_url || bookCoverPlaceholder({ seed: work.id, title: work.title })

  return (
    <Link to={`/oeuvre/${work.id}`} className={`group shrink-0 ${widthClass}`}>
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-white/5">
        <img
          src={cover}
          alt={work.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute left-1.5 top-1.5">
          <Badge variant="neutral">{work.work_type === 'light_novel' ? 'Light novel' : 'Roman'}</Badge>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-accent">{work.title}</h3>
      <p className="line-clamp-1 flex items-center gap-1 text-xs text-zinc-500">
        <BookOpen size={11} /> {work.author?.display_name ?? 'Auteur inconnu'}
      </p>
    </Link>
  )
}
