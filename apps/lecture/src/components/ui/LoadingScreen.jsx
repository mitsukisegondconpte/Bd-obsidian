import BrandLoader from './BrandLoader'

export default function LoadingScreen({ label = 'Chargement…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-0">
      <BrandLoader size={96} />
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">{label}</p>
    </div>
  )
}
