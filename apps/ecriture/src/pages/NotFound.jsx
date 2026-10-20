import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import BrandLoader from '../components/ui/BrandLoader'

export default function NotFound() {
  return (
    <Layout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <BrandLoader size={72} />
        <h1 className="text-xl font-extrabold text-zinc-50">Page introuvable</h1>
        <p className="max-w-sm text-sm text-zinc-500">Cette page n'existe pas ou a été déplacée.</p>
        <Link to="/" className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark">
          Retour à l'accueil
        </Link>
      </div>
    </Layout>
  )
}
