import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'hypercube-lang'

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'ht' ? 'ht' : 'fr'
  } catch {
    return 'fr'
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  const setLang = useCallback((value) => {
    setLangState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // stockage indisponible (navigation privée) — la préférence reste en mémoire
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'fr' ? 'ht' : 'fr')
  }, [lang, setLang])

  const t = useCallback((key) => translations[lang]?.[key] ?? translations.fr[key] ?? key, [lang])

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
