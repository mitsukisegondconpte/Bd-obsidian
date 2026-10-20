import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import GoogleButton from '../components/ui/GoogleButton'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/')
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

  return (
    <Layout>
      <div className="mx-auto max-w-sm px-4 pt-16">
        <h1 className="text-2xl font-extrabold text-zinc-50">{t('auth.loginTitle')}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t('auth.loginSubtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <div className="text-right">
            <Link to="/mot-de-passe-oublie" className="text-xs font-semibold text-zinc-500 hover:text-accent">
              {t('auth.forgotPassword')}
            </Link>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-600">
          <div className="h-px flex-1 bg-white/10" />
          {t('auth.or')}
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleButton onClick={handleGoogle} loading={googleLoading} />

        <p className="mt-4 text-center text-sm text-zinc-500">
          {t('auth.noAccount')}{' '}
          <Link to="/inscription" className="font-semibold text-accent">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </Layout>
  )
}
