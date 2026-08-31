import { Heart, Trash2 } from 'lucide-react'
import { avatarPlaceholder } from '../../utils/placeholders'

export default function CommentItem({
  comment,
  isReply = false,
  liked = false,
  likeCount = 0,
  onToggleLike,
  onReply,
  onDelete,
}) {
  const name = comment.user?.display_name ?? 'Lecteur'
  const avatar = comment.user?.avatar_url || avatarPlaceholder({ seed: comment.user_id, name })

  return (
    <div className={`flex gap-3 py-3 ${isReply ? 'ml-10 pl-2' : ''}`}>
      <img
        src={avatar}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${isReply ? 'h-7 w-7' : 'h-9 w-9'}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-100">{name}</span>
          <span className="text-xs text-zinc-500">
            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-300">{comment.body}</p>
        <div className="mt-1 flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleLike}
            className={`flex items-center gap-1 text-xs font-semibold ${
              liked ? 'text-pink-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Heart size={13} className={liked ? 'fill-pink-400' : ''} />
            {likeCount > 0 && likeCount}
          </button>
          {onReply && (
            <button type="button" onClick={onReply} className="text-xs font-semibold text-zinc-500 hover:text-zinc-300">
              Répondre
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Supprimer le commentaire"
              className="ml-auto text-zinc-600 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
