const VARIANTS = {
  free: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  paid: 'bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/40',
  new: 'bg-pink-500/15 text-pink-400 ring-1 ring-pink-500/30',
  hot: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  neutral: 'bg-surface-3 text-zinc-300 ring-1 ring-white/10',
}

export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
