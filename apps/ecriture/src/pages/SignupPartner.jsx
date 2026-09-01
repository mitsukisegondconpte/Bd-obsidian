import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Handshake } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const SOURCES = [
  { id: 'bohio_mag', label: 'Bohio Mag' },
  { id: 'hypercube', label: 'Hypercube Obsidian' },
]

export default function SignupPartner() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' })
  const [authorSource, setAuthorSource] = useState('bohio_mag')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signUp({ ...form, authorSource })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm px-4 pt-16 text-center">
          <Handshake className="mx-auto mb-3 text-accent" size={32} />
          <h1 className="text-xl font-extrabold text-zinc-50">Compte créé !</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Vérifie ton email pour confirmer ton compte. Ton statut d'auteur partenaire sera validé par notre équipe
            sous peu.
          </p>
          <button
            type="button"
            onClick={() => navigate('/connexion')}
            className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark"
          >
            Aller à la connexion
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm px-4 pt-16">
        <Handshake className="text-accent" size={28} />
        <h1 className="mt-3 text-2xl font-extrabold text-zinc-50">Inscription auteur partenaire</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crée ton compte Hypercube World. Ton statut d'auteur partenaire sera vérifié par notre équipe avant
          d'être activé.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Tu es auteur chez</p>
            <div className="flex gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAuthorSource(s.id)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                    authorSource === s.id
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <input
            required
            placeholder="Nom d'affichage"
            value={form.displayName}
            onChange={update('displayName')}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <input
            required
            placeholder="Pseudo"
            value={form.username}
            onChange={update('username')}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={update('email')}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Mot de passe (6 caractères min.)"
            value={form.password}
            onChange={update('password')}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-zinc-600">
          En créant un compte, tu acceptes nos{' '}
          <Link to="/conditions-utilisation" className="text-zinc-400 underline hover:text-accent">
            conditions d'utilisation
          </Link>{' '}
          et notre{' '}
          <Link to="/confidentialite" className="text-zinc-400 underline hover:text-accent">
            politique de confidentialité
          </Link>
          .
        </p>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="font-semibold text-accent">
            Se connecter
          </Link>
        </p>
      </div>
    </Layout>
  )
}
