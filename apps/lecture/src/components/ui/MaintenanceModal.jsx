import { X, Zap } from 'lucide-react'

export default function MaintenanceModal({ onContinue, onDiscover }) {
  return (
    <>
      {/* Overlay sombre */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      
      {/* Modale */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-surface-1 to-surface-0 shadow-2xl shadow-black/50">
          {/* En-tête avec icône */}
          <div className="border-b border-white/5 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Zap className="text-accent" size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-50">Maintenance en cours</h2>
          </div>

          {/* Contenu */}
          <div className="px-6 py-6">
            <p className="text-center text-sm leading-relaxed text-zinc-300">
              Cette plateforme est actuellement en préparation et certaines fonctionnalités sont encore en cours de développement. Elle sera bientôt pleinement disponible.
            </p>
          </div>

          {/* Boutons */}
          <div className="space-y-3 border-t border-white/5 px-6 py-6">
            <button
              type="button"
              onClick={onContinue}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-bold text-accent-ink transition hover:bg-accent-dark"
            >
              Continuer ici
            </button>
            <button
              type="button"
              onClick={onDiscover}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-surface-1 hover:text-zinc-100"
            >
              Découvrir les autres plateformes
            </button>
          </div>

          {/* Bouton fermer discret */}
          <button
            type="button"
            onClick={onContinue}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </>
  )
}
