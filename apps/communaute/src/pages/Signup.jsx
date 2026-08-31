import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import GoogleButton from '../components/ui/GoogleButton'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signUp(form)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setDone(true)
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    const { error: err } = await signInWithGoogle()
    if (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  if (done) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm px-4 pt-16 text-center">
          <h1 className="text-xl font-extrabold text-zinc-50">Vérifie ta boîte mail</h1>
          <p className="mt-2 text-sm text-zinc-400">
            On t'a envoyé un lien de confirmation. Une fois confirmé, connecte-toi.
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
        <h1 className="text-2xl font-extrabold text-zinc-50">Créer un compte</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gratuit. Ce compte fonctionnera aussi sur les autres plateformes Hypercube.
        </p>

        <div className="mt-6">
          <GoogleButton onClick={handleGoogle} loading={googleLoading} label="S'inscrire avec Google" />
        </div>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-600">
          <div className="h-px flex-1 bg-white/10" />
          ou
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nom affiché"
            value={form.displayName}
            onChange={update('displayName')}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <input
            required
            placeholder="Nom d'utilisateur"
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
