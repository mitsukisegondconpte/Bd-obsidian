import { Heart } from 'lucide-react'
import { useState } from 'react'

export default function CommentItem({ comment }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(comment.likes)

  function toggleLike() {
    setLiked((v) => !v)
    setLikes((n) => (liked ? n - 1 : n + 1))
  }

  return (
    <div className="flex gap-3 py-3">
      <img src={comment.avatar} alt={comment.user} className="h-9 w-9 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-100">{comment.user}</span>
          <span className="text-xs text-zinc-500">{comment.time}</span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-300">{comment.text}</p>
        <button
          type="button"
          onClick={toggleLike}
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
            liked ? 'text-pink-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart size={13} className={liked ? 'fill-pink-400' : ''} />
          {likes}
        </button>
      </div>
    </div>
  )
}
