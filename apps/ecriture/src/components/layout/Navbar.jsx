import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bookmark, Gift, LogOut, PenLine, Search, ShieldAlert, Trophy } from 'lucide-react'
import hypercubeLogo from '../../assets/hypercube-obsidian-logo.png'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import PlatformSwitcher from './PlatformSwitcher'
import NotificationBell from '../ui/NotificationBell'
import LanguageToggle from '../ui/LanguageToggle'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/explorer', label: t('nav.explore') },
    { to: '/edition', label: t('nav.edition') },
  ]

  function handleSearchSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/explorer?q=${encodeURIComponent(q)}` : '/explorer')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-surface-0/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 px-1 py-1">
          <img src={hypercubeLogo} alt="Hypercube World" className="h-7 w-auto drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]" />
          <span className="hidden text-sm font-extrabold tracking-tight text-zinc-100 sm:inline">Hypercube World</span>
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

        <div className="ml-auto flex min-w-0 items-center overflow-x-auto no-scrollbar">
        <div className="flex shrink-0 items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-56 rounded-full border border-white/10 bg-surface-2 py-1.5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={() => navigate('/explorer')}
            aria-label={t('search.aria')}
            className="rounded-full p-2 text-zinc-300 hover:bg-surface-2 sm:hidden"
          >
            <Search size={19} />
          </button>

          <Link to="/classement" aria-label={t('nav.classement')} className="rounded-full p-2 text-zinc-400 hover:bg-surface-2 hover:text-zinc-100">
            <Trophy size={17} />
          </Link>
          <Link to="/recompenses" aria-label="Récompenses" className="rounded-full p-2 text-zinc-400 hover:bg-surface-2 hover:text-zinc-100">
            <Gift size={17} />
          </Link>
          {user && (
            <Link
              to="/mes-listes"
              aria-label={t('nav.lists')}
              className="rounded-full p-2 text-zinc-400 hover:bg-surface-2 hover:text-zinc-100"
            >
              <Bookmark size={17} />
            </Link>
          )}
          <LanguageToggle />
          <PlatformSwitcher />

          {user ? (
            <>
              <Link
                to="/mes-oeuvres"
                className="hidden items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-accent-ink hover:bg-accent-dark sm:flex"
              >
                <PenLine size={15} /> {t('nav.write')}
              </Link>
              {profile?.is_platform_admin && (
                <Link
                  to="/admin"
                  aria-label={t('nav.admin')}
                  className="rounded-full p-2 text-zinc-400 hover:bg-surface-2 hover:text-zinc-100"
                >
                  <ShieldAlert size={17} />
                </Link>
              )}
              <NotificationBell />
              <button
                type="button"
                onClick={() => signOut().then(() => navigate('/'))}
                aria-label={t('auth.logout')}
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
              {t('auth.login')}
            </Link>
          )}
        </div>
        </div>
      </div>
    </header>
  )
}
