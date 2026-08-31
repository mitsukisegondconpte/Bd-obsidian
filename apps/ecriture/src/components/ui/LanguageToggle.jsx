import { useLanguage } from '../../context/LanguageContext'

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === 'fr' ? 'Passer en kreyòl' : 'Passer en français'}
      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-zinc-400 hover:border-accent/40 hover:text-accent"
    >
      {lang === 'fr' ? 'FR' : 'HT'}
    </button>
  )
}
