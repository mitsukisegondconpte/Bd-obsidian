import { NavLink } from 'react-router-dom'
import { Home, Compass, Bookmark, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/explorer', label: 'Explorer', icon: Compass },
  { to: '/abonnements', label: 'Bibliothèque', icon: Bookmark },
  { to: '/profil/auth-1', label: 'Profil', icon: User },
]

export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-surface-1/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
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
