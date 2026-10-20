import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabaseClient'

// Supabase gère la session de récupération automatiquement (le lien de
// l'email inclut un token dans l'URL, lu au chargement par supabase-js) —
// cette page n'a qu'à appeler updateUser une fois l'utilisateur arrivé ici.
export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setDone(true)
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm px-4 pt-16">
        <h1 className="text-2xl font-extrabold text-zinc-50">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-zinc-500">Choisis un nouveau mot de passe pour ton compte.</p>

        {done ? (
          <p className="mt-6 text-sm text-emerald-400">Mot de passe mis à jour. Redirection...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Nouveau mot de passe (6 caractères min.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
