import { Loader2 } from 'lucide-react'

export default function Loader({ className = 'p-10' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-zinc-500 ${className}`}>
      <Loader2 size={26} className="animate-spin text-accent" />
      <p className="text-sm">Chargement...</p>
    </div>
  )
}
