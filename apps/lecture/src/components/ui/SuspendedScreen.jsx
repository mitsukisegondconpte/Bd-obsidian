import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SuspendedScreen() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-0 px-6 text-center text-zinc-100">
      <ShieldAlert size={32} className="text-red-400" />
      <h1 className="text-xl font-extrabold">Compte suspendu</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        Ton compte a été suspendu par un administrateur. Contacte le support si tu penses qu'il s'agit d'une erreur.
      </p>
      <button
        type="button"
        onClick={signOut}
        className="mt-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark"
      >
        Se déconnecter
      </button>
    </div>
  )
}
