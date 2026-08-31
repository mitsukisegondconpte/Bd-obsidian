import { Link } from 'react-router-dom'
import { Lock, Heart, MessageCircle } from 'lucide-react'
import Badge from './Badge'

export default function ChapterListItem({ seriesSlug, chapter }) {
  return (
    <Link
      to={`/serie/${seriesSlug}/chapitre/${chapter.id}`}
      className="flex items-center justify-between gap-3 border-b border-white/5 px-1 py-3.5 hover:bg-surface-2/60"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            Chapitre {chapter.number}
          </span>
          {chapter.free ? (
            <Badge variant="free">Gratuit</Badge>
          ) : (
            <Badge variant="paid">
              <Lock size={10} /> {chapter.price} HTG
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-zinc-400">{chapter.title}</p>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
          <span>{chapter.publishedAt}</span>
          <span className="flex items-center gap-1">
            <Heart size={12} /> {chapter.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} /> {chapter.comments}
          </span>
        </div>
      </div>

      {!chapter.free && (
        <Lock size={16} className="shrink-0 text-zinc-600" />
      )}
    </Link>
  )
}
