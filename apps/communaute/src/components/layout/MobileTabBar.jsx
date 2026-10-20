import { NavLink } from 'react-router-dom'
import { Home, Radio, Users, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function MobileTabBar() {
  const { user, profile } = useAuth()
  const { lang } = useLanguage()

  const tabs = [
    { to: '/', label: lang === 'ht' ? 'Akèy' : 'Accueil', icon: Home, end: true },
    { to: '/canaux', label: lang === 'ht' ? 'Chanèl' : 'Canaux', icon: Radio },
    { to: '/communautes', label: lang === 'ht' ? 'Kominote' : 'Communautés', icon: Users },
    { to: user ? `/profil/${profile?.username ?? ''}` : '/connexion', label: lang === 'ht' ? 'Pwofil' : 'Profil', icon: User },
  ]

  return (
    <nav
      aria-label={lang === 'ht' ? 'Navigasyon prensipal' : 'Navigation principale'}
      className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center gap-1 rounded-full border border-white/10 bg-surface-1/75 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 py-2.5 text-[10px] font-semibold transition-all duration-300 ease-out motion-reduce:transition-none ${
                isActive
                  ? 'bg-accent/15 text-accent shadow-sm ring-1 ring-accent/20'
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={`transition-transform duration-300 motion-reduce:transition-none ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className="whitespace-nowrap leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
