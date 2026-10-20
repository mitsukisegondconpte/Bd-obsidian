import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// Bandeau d'accueil explicatif : se replie tout seul après `autoHideMs`
// (ou immédiatement si l'utilisateur clique sur fermer), avec une
// transition douce plutôt qu'une disparition brute.
export default function IntroBanner({ children, autoHideMs = 10000 }) {
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setClosing(true), autoHideMs)
    return () => clearTimeout(t)
  }, [autoHideMs])

  useEffect(() => {
    if (!closing) return
    const t = setTimeout(() => setVisible(false), 450)
    return () => clearTimeout(t)
  }, [closing])

  if (!visible) return null

  return (
    <div
      className={`overflow-hidden transition-[max-height,opacity,margin] duration-[450ms] ease-in ${
        closing ? 'mb-0 max-h-0 opacity-0' : 'max-h-[420px] opacity-100'
      }`}
    >
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-2 to-surface-1 p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setClosing(true)}
          aria-label="Fermer"
          className="absolute right-3 top-3 rounded-full bg-black/20 p-1.5 text-zinc-400 transition hover:bg-black/40 hover:text-white"
        >
          <X size={16} />
        </button>
        {children}
      </section>
    </div>
  )
}
