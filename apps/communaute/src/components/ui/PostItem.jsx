import { Reply } from 'lucide-react'
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

export default function PostItem({ post, author, isOwn = false, onReply }) {
  const name = author?.display_name ?? 'Membre'
  const avatar = author?.avatar_url || avatarPlaceholder({ seed: post.author_id ?? post.channel_id, name })

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
          <p className="whitespace-pre-line">{renderBody(post.body, isOwn)}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 px-1">
          <span className="text-[11px] text-zinc-600">
            {new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
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
