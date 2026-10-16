import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const STORAGE_KEY = 'bd-obsidian-lecture-status-banner-dismissed'

function shouldShowBanner() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== 'true'
  } catch {
    return true
  }
}

export default function PlatformStatusBanner() {
  const { lang } = useLanguage()
  const [visible, setVisible] = useState(shouldShowBanner)

  if (!visible) return null

  function dismiss() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // Le bandeau peut tout de même être fermé si le stockage est indisponible.
    }
    setVisible(false)
  }

  const isCreole = lang === 'ht'

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3.5 py-3 text-amber-50/90 backdrop-blur-md"
      >
        <Info size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
        <p className="flex-1 text-xs leading-relaxed sm:text-sm">
          {isCreole
            ? 'Platfòm nan sou entènèt, men li toujou nan faz tès. Gen kèk fonksyon ki poko fin pare. Si w vle teste l, ou ka inyore mesaj sa a.'
            : 'La plateforme est en ligne, mais encore en phase de test. Certaines fonctionnalités peuvent ne pas être prêtes. Tu peux ignorer ce message si tu souhaites la tester.'}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-200/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          aria-label={isCreole ? 'Inyore mesaj la' : 'Ignorer le message'}
        >
          <span>{isCreole ? 'Inyore' : 'Ignorer'}</span>
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
