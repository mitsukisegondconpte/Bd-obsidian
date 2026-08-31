import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-4 pb-24 text-center text-xs text-zinc-500 sm:pb-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <Link to="/confidentialite" className="hover:text-zinc-300 hover:underline">
          Politique de confidentialité
        </Link>
        <Link to="/conditions-utilisation" className="hover:text-zinc-300 hover:underline">
          Conditions d'utilisation
        </Link>
      </div>
      <p className="mt-2 text-zinc-600">© {new Date().getFullYear()} Hypercube Realms</p>
    </footer>
  )
}
