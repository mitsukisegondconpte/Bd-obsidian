import hypercubeLogo from '../../assets/hypercube-obsidian-logo.jpg'

export default function Footer() {
  return (
    <footer className="mt-10 hidden items-center justify-center gap-2 border-t border-white/5 px-4 py-6 text-xs text-zinc-600 sm:flex">
      <span>Une plateforme</span>
      <img src={hypercubeLogo} alt="Hypercube Obsidian" className="h-4 w-auto opacity-70" />
    </footer>
  )
}
