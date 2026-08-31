import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <Layout>
        <div className="mx-auto max-w-sm px-4 pt-16 text-center">
          <h1 className="text-xl font-extrabold text-zinc-50">Vérifie ta boîte mail</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Si un compte existe pour {email}, un lien de réinitialisation vient d'être envoyé.
          </p>
          <Link
            to="/connexion"
            className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark"
          >
            Retour à la connexion
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm px-4 pt-16">
        <h1 className="text-2xl font-extrabold text-zinc-50">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-zinc-500">On t'envoie un lien pour en choisir un nouveau.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          <Link to="/connexion" className="font-semibold text-accent">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </Layout>
  )
}
