import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

function MissingConfigScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-0 px-6 text-center text-zinc-100">
      <h1 className="text-xl font-extrabold">Configuration manquante</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY ne sont pas définies. En local : copie{' '}
        <code className="rounded bg-surface-2 px-1">.env.example</code> en{' '}
        <code className="rounded bg-surface-2 px-1">.env.local</code> à la racine du repo. Sur Vercel : Project
        Settings → Environment Variables, puis redéployer.
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    ) : (
      <MissingConfigScreen />
    )}
  </StrictMode>,
)
