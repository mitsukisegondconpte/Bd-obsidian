import { Heart, Radio, Reply, Share2 } from 'lucide-react'
import { avatarPlaceholder } from '../../utils/placeholders'

function renderBody(body, isOwn) {
  const parts = body.split(/(@[a-zA-Z0-9_]+)/g)
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className={`font-bold underline underline-offset-2 ${isOwn ? '' : 'text-accent'}`}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export default function PostItem({
  post,
  author,
  isOwn = false,
  onReply,
  likeCount,
  liked,
  onToggleLike,
  onShare,
}) {
  const name = author?.display_name ?? 'Membre'
  const avatar = author?.avatar_url || avatarPlaceholder({ seed: post.author_id ?? post.channel_id, name })

  if (post.is_system) {
    return (
      <div className="py-1.5 text-center">
        <span className="rounded-full bg-surface-2/60 px-3 py-1 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-400">{name}</span> {post.body}
        </span>
      </div>
    )
  }

  return (
    <div className={`group flex gap-2 py-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <img src={avatar} alt={name} className="h-8 w-8 shrink-0 self-end rounded-full object-cover" />
      )}
      <div className={`flex max-w-[78%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm ${
            isOwn ? 'rounded-br-sm bg-accent text-accent-ink' : 'rounded-bl-sm bg-surface-2 text-zinc-100'
          }`}
        >
          {!isOwn && <p className="mb-0.5 text-xs font-bold text-accent">{name}</p>}
          {post.reply_to && (
            <div
              className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-xs ${
                isOwn ? 'border-accent-ink/40 bg-black/10 text-accent-ink/80' : 'border-accent/50 bg-black/20 text-zinc-400'
              }`}
            >
              <p className="font-semibold">{post.reply_to.author?.display_name ?? 'Membre'}</p>
              <p className="line-clamp-1">{post.reply_to.body}</p>
            </div>
          )}
          {post.shared_from && (
            <div
              className={`mb-1.5 space-y-1 rounded-lg border-l-2 px-2 py-1.5 text-xs ${
                isOwn ? 'border-accent-ink/40 bg-black/10 text-accent-ink/80' : 'border-accent/50 bg-black/20 text-zinc-400'
              }`}
            >
              <p className="flex items-center gap-1 font-semibold">
                <Radio size={11} /> Repartagé depuis {post.shared_from.channel?.name ?? 'un canal'}
              </p>
              <p className="line-clamp-2">{post.shared_from.body}</p>
              {post.shared_from.media_url && (
                <img src={post.shared_from.media_url} alt="" className="mt-1 max-h-40 rounded-md object-cover" />
              )}
            </div>
          )}
          <p className="whitespace-pre-line">{renderBody(post.body, isOwn)}</p>
          {post.media_url && <img src={post.media_url} alt="" className="mt-2 max-h-72 w-full rounded-lg object-cover" />}
        </div>
        <div className="mt-0.5 flex items-center gap-3 px-1">
          <span className="text-[11px] text-zinc-600">
            {new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {onToggleLike && (
            <button
              type="button"
              onClick={onToggleLike}
              aria-label={liked ? 'Retirer le like' : 'Aimer'}
              className={`flex items-center gap-1 text-[11px] font-semibold ${liked ? 'text-pink-400' : 'text-zinc-600 hover:text-pink-400'}`}
            >
              <Heart size={12} className={liked ? 'fill-pink-400' : ''} /> {likeCount > 0 ? likeCount : ''}
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              aria-label="Partager"
              className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-accent"
            >
              <Share2 size={12} /> Partager
            </button>
          )}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(post)}
              aria-label="Répondre"
              className="flex items-center gap-1 text-[11px] text-zinc-600 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
            >
              <Reply size={11} /> Répondre
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
