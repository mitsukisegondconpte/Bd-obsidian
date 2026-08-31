import { Link, NavLink } from 'react-router-dom'
import { Search } from 'lucide-react'
import hypercubeLogo from '../../assets/hypercube-obsidian-logo.jpg'
import { currentUser } from '../../data/mockData'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/explorer', label: 'Explorer' },
  { to: '/abonnements', label: 'Abonnements' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-surface-0/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded bg-white px-2 py-1">
          <img src={hypercubeLogo} alt="Hypercube Obsidian" className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-surface-2 text-accent' : 'text-zinc-400 hover:text-zinc-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Chercher une série, un auteur..."
              className="w-56 rounded-full border border-white/10 bg-surface-2 py-1.5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            aria-label="Rechercher"
            className="rounded-full p-2 text-zinc-300 hover:bg-surface-2 sm:hidden"
          >
            <Search size={19} />
          </button>
          <Link
            to="/profil/auth-1"
            className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-transparent hover:ring-accent"
          >
            <img src={currentUser.avatar} alt="Mon profil" className="h-full w-full object-cover" />
          </Link>
        </div>
      </div>
    </header>
  )
}
