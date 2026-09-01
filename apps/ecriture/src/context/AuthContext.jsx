import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Connexion automatique inter-plateformes : si l'utilisateur arrive
    // depuis une autre app Hypercube déjà connecté (lien du sélecteur de
    // plateformes), le token de session voyage dans le fragment d'URL
    // (jamais envoyé au serveur, contrairement à une query string) — on
    // l'utilise pour ouvrir la session ici sans redemander les identifiants.
    async function init() {
      const hash = window.location.hash
      if (hash.includes('sso_at=')) {
        const params = new URLSearchParams(hash.slice(1))
        const access_token = params.get('sso_at')
        const refresh_token = params.get('sso_rt')
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        if (access_token && refresh_token) {
          const { data } = await supabase.auth.setSession({ access_token, refresh_token })
          setSession(data.session)
          setLoading(false)
          return
        }
      }
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [session?.user?.id])

  async function refreshProfile() {
    if (!session?.user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    setProfile(data)
  }

  async function signUp({ email, password, username, displayName, authorSource }) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: displayName, author_source: authorSource ?? null } },
    })
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé sous AuthProvider')
  return ctx
}
