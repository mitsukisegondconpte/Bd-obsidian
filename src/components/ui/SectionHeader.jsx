import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SectionHeader({ title, subtitle, to }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-zinc-50 sm:text-xl">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-xs font-semibold text-zinc-400 hover:text-brand-yellow"
        >
          Voir tout
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}
