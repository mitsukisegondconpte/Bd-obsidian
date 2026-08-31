import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
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
          {chapter.is_free ? (
            <Badge variant="free">Gratuit</Badge>
          ) : (
            <Badge variant="paid">
              <Lock size={10} /> {chapter.price_cents / 100} HTG
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-zinc-400">{chapter.title}</p>
        <p className="mt-1.5 text-xs text-zinc-500">
          {chapter.published_at ? new Date(chapter.published_at).toLocaleDateString('fr-FR') : 'Non publié'}
        </p>
      </div>

      {!chapter.is_free && <Lock size={16} className="shrink-0 text-zinc-600" />}
    </Link>
  )
}
