import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, PenLine, Search } from 'lucide-react'
import hypercubeLogo from '../../assets/hypercube-obsidian-logo.jpg'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/explorer', label: 'Explorer' },
  { to: '/edition', label: 'Édition' },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

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
              placeholder="Chercher une oeuvre, un auteur..."
              className="w-56 rounded-full border border-white/10 bg-surface-2 py-1.5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
          </div>

          {user ? (
            <>
              <Link
                to="/mes-oeuvres"
                className="hidden items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink hover:bg-accent-dark sm:flex"
              >
                <PenLine size={15} /> Écrire
              </Link>
              <button
                type="button"
                onClick={() => signOut().then(() => navigate('/'))}
                aria-label="Déconnexion"
                className="rounded-full p-2 text-zinc-400 hover:bg-surface-2 hover:text-zinc-100"
              >
                <LogOut size={17} />
              </button>
              <Link
                to={`/profil/${profile?.username ?? ''}`}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-2 ring-transparent hover:ring-accent"
              >
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
                )}
              </Link>
            </>
          ) : (
            <Link
              to="/connexion"
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink hover:bg-accent-dark"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
