import { Link } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { avatarPlaceholder } from '../../utils/placeholders'

export default function ChannelCard({ channel }) {
  const avatar = channel.owner?.avatar_url || avatarPlaceholder({ seed: channel.owner_id, name: channel.owner?.display_name })

  return (
    <Link
      to={`/canal/${channel.id}`}
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-1 p-3 hover:border-accent/30"
    >
      <img src={avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-bold text-zinc-100">
          <Radio size={13} className="shrink-0 text-accent" /> {channel.name}
        </p>
        <p className="truncate text-xs text-zinc-500">par {channel.owner?.display_name}</p>
      </div>
    </Link>
  )
}
