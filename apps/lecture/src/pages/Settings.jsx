import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Monitor, Moon, Send, Sun } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { createSupportReport } from '../api/support'
import { getThemePreference, setThemePreference } from '../lib/theme'

const COPY = {
  fr: {
    title: 'Paramètres', intro: 'Gère ton compte et tes préférences.', account: 'Compte', profile: 'Modifier le profil', logout: 'Se déconnecter', logoutError: 'La déconnexion a échoué. Réessaie.', appearance: 'Apparence', system: 'Système', light: 'Clair', dark: 'Sombre', support: 'Signaler un problème', category: 'Catégorie', technical: 'Problème technique', inappropriate: 'Contenu inapproprié', copyright: 'Droit d’auteur', accountProblem: 'Problème de compte', security: 'Sécurité', other: 'Autre', description: 'Description', descriptionHint: 'Décris le problème (10 à 5 000 caractères).', submit: 'Envoyer le signalement', sending: 'Envoi…', sent: 'Signalement enregistré. Merci.', sendError: 'Le signalement n’a pas pu être enregistré. Réessaie.', deleteTitle: 'Suppression du compte', deleteUnavailable: 'La suppression du compte n’est pas encore disponible.', deleteDetail: 'Aucune suppression ne sera effectuée depuis cette page tant qu’un processus serveur sécurisé et une règle de conservation des œuvres ne seront pas définis.', loginRequired: 'Connecte-toi pour accéder aux paramètres.', login: 'Se connecter',
  },
  ht: {
    title: 'Paramèt', intro: 'Jere kont ou ak preferans ou yo.', account: 'Kont', profile: 'Modifye pwofil la', logout: 'Dekonekte', logoutError: 'Dekoneksyon an echwe. Eseye ankò.', appearance: 'Aparans', system: 'Sistèm', light: 'Klè', dark: 'Fè nwa', support: 'Rapòte yon pwoblèm', category: 'Kategori', technical: 'Pwoblèm teknik', inappropriate: 'Kontni ki pa apwopriye', copyright: 'Dwa otè', accountProblem: 'Pwoblèm kont', security: 'Sekirite', other: 'Lòt', description: 'Deskripsyon', descriptionHint: 'Dekri pwoblèm nan (10 rive 5 000 karaktè).', submit: 'Voye rapò a', sending: 'Ap voye…', sent: 'Rapò a anrejistre. Mèsi.', sendError: 'Nou pa t kapab anrejistre rapò a. Eseye ankò.', deleteTitle: 'Efase kont lan', deleteUnavailable: 'Opsyon pou efase kont lan poko disponib.', deleteDetail: 'Paj sa a pap efase anyen jiskaske gen yon pwosesis sèvè ki an sekirite ak yon règ klè pou travay otè yo.', loginRequired: 'Konekte pou jwenn aksè nan paramèt yo.', login: 'Konekte',
  },
}

const CATEGORIES = [
  { value: 'technical', label: 'technical' },
  { value: 'inappropriate', label: 'inappropriate' },
  { value: 'copyright', label: 'copyright' },
  { value: 'account', label: 'accountProblem' },
  { value: 'security', label: 'security' },
  { value: 'other', label: 'other' },
]

export default function Settings() {
  const { user, signOut } = useAuth()
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const t = COPY[lang] || COPY.fr
  const [theme, setTheme] = useState(getThemePreference)
  const [category, setCategory] = useState('technical')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [signOutError, setSignOutError] = useState('')

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
      navigate('/')
    } catch {
      setSignOutError(t.logoutError)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!user || saving) return
    setSaving(true)
    setFeedback('')
    try {
      await createSupportReport({ reporterId: user.id, category, description })
      setDescription('')
      setFeedback(t.sent)
    } catch {
      setFeedback(t.sendError)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <h1 className="text-2xl font-extrabold text-zinc-50">{t.title}</h1>
          <p className="mt-3 text-sm text-zinc-400">{t.loginRequired}</p>
          <Link to="/connexion" className="mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink">{t.login}</Link>
        </main>
      </Layout>
    )
  }

  const options = [
    { id: 'system', label: t.system, icon: Monitor },
    { id: 'light', label: t.light, icon: Sun },
    { id: 'dark', label: t.dark, icon: Moon },
  ]

  return (
    <Layout>
      <main className="mx-auto max-w-2xl px-4 py-7 sm:px-6">
        <h1 className="text-2xl font-extrabold text-zinc-50">{t.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t.intro}</p>

        <section aria-labelledby="settings-account" className="mt-6 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-5">
          <h2 id="settings-account" className="text-base font-bold text-zinc-100">{t.account}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/profil/modifier" className="rounded-full border border-white/10 bg-surface-2 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-accent/40">{t.profile}</Link>
            <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink hover:bg-accent-dark"><LogOut size={15} aria-hidden="true" />{t.logout}</button>
          </div>
          {signOutError && <p role="alert" className="mt-3 text-sm text-red-500">{signOutError}</p>}
        </section>

        <section aria-labelledby="settings-appearance" className="mt-4 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-5">
          <h2 id="settings-appearance" className="text-base font-bold text-zinc-100">{t.appearance}</h2>
          <fieldset className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <legend className="sr-only">{t.appearance}</legend>
            {options.map(({ id, label, icon: Icon }) => (
              <label key={id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-surface-2 px-3 py-3 text-sm font-semibold text-zinc-200 has-[:checked]:border-accent has-[:checked]:text-accent">
                <input type="radio" name="theme" value={id} checked={theme === id} onChange={() => { setTheme(id); setThemePreference(id) }} className="accent-accent" />
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
        </section>

        <section aria-labelledby="settings-support" className="mt-4 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-5">
          <h2 id="settings-support" className="text-base font-bold text-zinc-100">{t.support}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="report-category" className="mb-1.5 block text-sm font-semibold text-zinc-300">{t.category}</label>
              <select id="report-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-zinc-100 focus:border-accent focus:outline-none">
                {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{t[label]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="report-description" className="mb-1.5 block text-sm font-semibold text-zinc-300">{t.description}</label>
              <textarea id="report-description" required minLength={10} maxLength={5000} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.descriptionHint} className="w-full resize-y rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent focus:outline-none" />
              <p className="mt-1 text-right text-xs text-zinc-500">{description.length}/5000</p>
            </div>
            <button type="submit" disabled={saving || description.trim().length < 10} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} aria-hidden="true" />{saving ? t.sending : t.submit}</button>
            {feedback && <p role="status" aria-live="polite" className={feedback === t.sent ? 'text-sm text-emerald-600' : 'text-sm text-red-500'}>{feedback}</p>}
          </form>
        </section>

        <section aria-labelledby="settings-delete" className="mt-4 rounded-2xl border border-white/10 bg-surface-1 p-4 sm:p-5">
          <h2 id="settings-delete" className="text-base font-bold text-zinc-100">{t.deleteTitle}</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-300">{t.deleteUnavailable}</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{t.deleteDetail}</p>
        </section>
      </main>
    </Layout>
  )
}
