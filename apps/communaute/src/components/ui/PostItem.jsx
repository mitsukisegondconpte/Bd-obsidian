import { avatarPlaceholder } from '../../utils/placeholders'

export default function PostItem({ post, author }) {
  const name = author?.display_name ?? 'Auteur'
  const avatar = author?.avatar_url || avatarPlaceholder({ seed: post.author_id ?? post.channel_id, name })

  return (
    <div className="flex gap-3 border-b border-white/5 py-4">
      <img src={avatar} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-100">{name}</span>
          <span className="text-xs text-zinc-500">{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm text-zinc-300">{post.body}</p>
        {post.media_url && <img src={post.media_url} alt="" className="mt-2 rounded-lg" />}
      </div>
    </div>
  )
}
