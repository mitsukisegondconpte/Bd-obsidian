import { NavLink } from 'react-router-dom'
import { Home, Compass, PenLine, GraduationCap, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function MobileTabBar() {
  const { user, profile } = useAuth()

  const tabs = [
    { to: '/', label: 'Accueil', icon: Home, end: true },
    { to: '/explorer', label: 'Explorer', icon: Compass },
    { to: '/mes-oeuvres', label: 'Écrire', icon: PenLine },
    { to: '/edition', label: 'Édition', icon: GraduationCap },
    { to: user ? `/profil/${profile?.username ?? ''}` : '/connexion', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-surface-1/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-accent' : 'text-zinc-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
