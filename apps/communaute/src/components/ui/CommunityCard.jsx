import { Link } from 'react-router-dom'
import { BadgeCheck, Users } from 'lucide-react'
import Badge from './Badge'

export default function CommunityCard({ community }) {
  return (
    <Link
      to={`/communaute/${community.id}`}
      className="flex flex-col gap-2 rounded-xl border border-white/5 bg-surface-1 p-3.5 hover:border-accent/30"
    >
      <div className="flex items-center gap-1.5">
        <Users size={14} className="text-accent" />
        <p className="truncate text-sm font-bold text-zinc-100">{community.name}</p>
        {community.is_validated && <BadgeCheck size={15} className="shrink-0 text-sky-400" fill="currentColor" stroke="#0c0709" />}
      </div>
      {community.description && <p className="line-clamp-2 text-xs text-zinc-500">{community.description}</p>}
      <div className="flex gap-1.5">
        {community.related_series_id && <Badge variant="official">Officielle · BD</Badge>}
        {community.related_work_id && !community.related_series_id && <Badge variant="official">Officielle · Écriture</Badge>}
      </div>
    </Link>
  )
}
