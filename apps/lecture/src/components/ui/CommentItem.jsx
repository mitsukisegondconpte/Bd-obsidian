import { avatarPlaceholder } from '../../utils/placeholders'

export default function CommentItem({ comment }) {
  const name = comment.user?.display_name ?? 'Lecteur'
  const avatar = comment.user?.avatar_url || avatarPlaceholder({ seed: comment.user_id, name })

  return (
    <div className="flex gap-3 py-3">
      <img src={avatar} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-100">{name}</span>
          <span className="text-xs text-zinc-500">{new Date(comment.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-300">{comment.body}</p>
      </div>
    </div>
  )
}
