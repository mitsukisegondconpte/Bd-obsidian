import { useRef, useState } from 'react'
import { Check, Heart, Pencil, Pin, Radio, Reply, Share2, SmilePlus, Trash2, TriangleAlert, X } from 'lucide-react'
import { avatarPlaceholder } from '../../utils/placeholders'

const SWIPE_TRIGGER = 56
const SWIPE_MAX = 76
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

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
  replyTo,
  onJumpToReply,
  highlighted = false,
  itemRef,
  reactions = [],
  currentUserId,
  onReact,
  canEdit = false,
  onEdit,
  canDelete = false,
  onDelete,
  isPinned = false,
  canPin = false,
  onTogglePin,
}) {
  const name = author?.display_name ?? 'Membre'
  const avatar = author?.avatar_url || avatarPlaceholder({ seed: post.author_id ?? post.channel_id, name })

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchStartX = useRef(0)
  const triggered = useRef(false)

  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(post.body)

  function handleTouchStart(e) {
    if (!onReply) return
    touchStartX.current = e.touches[0].clientX
    triggered.current = false
    setDragging(true)
  }

  function handleTouchMove(e) {
    if (!onReply || !dragging) return
    const delta = e.touches[0].clientX - touchStartX.current
    const clamped = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, delta))
    setDragX(clamped)
    if (!triggered.current && Math.abs(clamped) >= SWIPE_TRIGGER) {
      triggered.current = true
      navigator.vibrate?.(12)
    }
  }

  function handleTouchEnd() {
    if (!onReply) return
    setDragging(false)
    setDragX(0)
    if (triggered.current) onReply(post)
  }

  function saveEdit() {
    if (!editBody.trim() || editBody.trim() === post.body) {
      setEditing(false)
      return
    }
    onEdit?.(editBody.trim())
    setEditing(false)
  }

  function handleReactionClick(emoji) {
    const mine = reactions.find((r) => r.user_id === currentUserId)
    onReact?.(mine?.emoji === emoji ? null : emoji)
    setPickerOpen(false)
  }

  const reactionGroups = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1
    return acc
  }, {})
  const myReaction = reactions.find((r) => r.user_id === currentUserId)?.emoji

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
    <div
      ref={itemRef}
      className={`group relative flex gap-2 py-1.5 transition-colors ${isOwn ? 'flex-row-reverse' : ''} ${
        highlighted ? 'bg-accent/10' : ''
      }`}
    >
      {Math.abs(dragX) > 8 && (
        <div
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${dragX > 0 ? 'left-1' : 'right-1'}`}
          style={{ opacity: Math.min(1, Math.abs(dragX) / SWIPE_TRIGGER) }}
        >
          <Reply size={16} className="text-accent" />
        </div>
      )}
      {!isOwn && (
        <img src={avatar} alt={name} className="h-8 w-8 shrink-0 self-end rounded-full object-cover" />
      )}
      <div
        className={`flex max-w-[78%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
      >
        {isPinned && (
          <p className="mb-0.5 flex items-center gap-1 px-1 text-[10px] font-semibold text-accent">
            <Pin size={10} /> Épinglé
          </p>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm ${
            isOwn ? 'rounded-br-sm bg-accent text-accent-ink' : 'rounded-bl-sm bg-surface-2 text-zinc-100'
          }`}
        >
          {!isOwn && <p className="mb-0.5 text-xs font-bold text-accent">{name}</p>}
          {replyTo && (
            <button
              type="button"
              onClick={() => onJumpToReply?.(replyTo.id)}
              className={`mb-1.5 block w-full rounded-lg border-l-2 px-2 py-1 text-left text-xs ${
                isOwn ? 'border-accent-ink/40 bg-black/10 text-accent-ink/80' : 'border-accent/50 bg-black/20 text-zinc-400'
              }`}
            >
              <p className="font-semibold">{replyTo.author?.display_name ?? 'Membre'}</p>
              <p className="line-clamp-1">{replyTo.body}</p>
            </button>
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

          {editing ? (
            <div className="space-y-1.5">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={2}
                autoFocus
                className={`w-full resize-none rounded-lg border px-2 py-1.5 text-sm ${
                  isOwn
                    ? 'border-accent-ink/30 bg-black/10 text-accent-ink placeholder:text-accent-ink/50'
                    : 'border-white/10 bg-surface-1 text-zinc-100'
                }`}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Annuler la modification"
                  className={isOwn ? 'text-accent-ink/70' : 'text-zinc-500'}
                >
                  <X size={15} />
                </button>
                <button type="button" onClick={saveEdit} aria-label="Enregistrer" className={isOwn ? 'text-accent-ink' : 'text-accent'}>
                  <Check size={15} />
                </button>
              </div>
            </div>
          ) : post.is_spoiler && !spoilerRevealed ? (
            <button
              type="button"
              onClick={() => setSpoilerRevealed(true)}
              className={`flex w-full items-center gap-1.5 rounded-lg border border-dashed px-2.5 py-2 text-xs font-semibold ${
                isOwn ? 'border-accent-ink/30 text-accent-ink/80' : 'border-white/20 text-zinc-400'
              }`}
            >
              <TriangleAlert size={13} /> Spoiler — appuie pour révéler
            </button>
          ) : (
            <>
              <p className="whitespace-pre-line">{renderBody(post.body, isOwn)}</p>
              {post.media_url && (
                <img src={post.media_url} alt="" className="mt-2 max-h-72 w-full rounded-lg object-cover" />
              )}
            </>
          )}
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1 px-1">
            {Object.entries(reactionGroups).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReactionClick(emoji)}
                className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] ${
                  myReaction === emoji ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-zinc-400'
                }`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative mt-0.5 flex items-center gap-3 px-1">
          <span className="text-[11px] text-zinc-600">
            {new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {post.edited_at && <span className="ml-1 italic">(modifié)</span>}
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
          {onReact && (
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              aria-label="Réagir"
              className="flex items-center gap-1 text-[11px] text-zinc-600 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
            >
              <SmilePlus size={12} />
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
          {canPin && (
            <button
              type="button"
              onClick={onTogglePin}
              aria-label={isPinned ? 'Désépingler' : 'Épingler'}
              className={`flex items-center gap-1 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 ${
                isPinned ? 'text-accent' : 'text-zinc-600 hover:text-accent'
              }`}
            >
              <Pin size={11} />
            </button>
          )}
          {canEdit && !editing && (
            <button
              type="button"
              onClick={() => {
                setEditBody(post.body)
                setEditing(true)
              }}
              aria-label="Modifier"
              className="flex items-center gap-1 text-[11px] text-zinc-600 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
            >
              <Pencil size={11} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Supprimer"
              className="flex items-center gap-1 text-[11px] text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 size={11} />
            </button>
          )}

          {pickerOpen && (
            <div
              className={`absolute bottom-full z-10 mb-1.5 flex gap-1 rounded-full border border-white/10 bg-surface-1 px-2 py-1.5 shadow-xl ${
                isOwn ? 'right-0' : 'left-0'
              }`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReactionClick(emoji)}
                  className="text-lg hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
