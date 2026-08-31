import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

// Bouton d'abonnement à état local (front-end only, pas de persistance).
export default function SubscribeButton({ initialSubscribed = false, className = '' }) {
  const [subscribed, setSubscribed] = useState(initialSubscribed)

  return (
    <button
      type="button"
      onClick={() => setSubscribed((v) => !v)}
      className={`flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
        subscribed
          ? 'bg-surface-3 text-zinc-200 ring-1 ring-white/10 hover:bg-surface-2'
          : 'bg-brand-yellow text-brand-ink hover:bg-brand-yellow-dark'
      } ${className}`}
    >
      {subscribed ? <Check size={16} /> : <Bell size={16} />}
      {subscribed ? 'Abonné' : "S'abonner"}
    </button>
  )
}
