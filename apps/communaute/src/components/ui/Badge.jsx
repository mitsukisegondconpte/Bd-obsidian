const VARIANTS = {
  official: 'bg-accent/15 text-accent ring-1 ring-accent/40',
  validated: 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30',
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
