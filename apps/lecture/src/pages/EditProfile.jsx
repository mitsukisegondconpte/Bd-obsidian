import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadAvatar } from '../api/profiles'
import { avatarPlaceholder } from '../utils/placeholders'
import Loader from '../components/ui/Loader'

export default function EditProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setBio(profile.bio ?? '')
    setAvatarPreview(profile.avatar_url ?? '')
  }, [profile])

  if (!user || !profile) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let avatarUrl
      if (avatarFile) {
        avatarUrl = await uploadAvatar({ userId: user.id, file: avatarFile })
      }
      await updateProfile({ userId: user.id, displayName, bio, avatarUrl })
      await refreshProfile()
      navigate(`/profil/${profile.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm px-4 pt-10 pb-10">
        <h1 className="text-xl font-extrabold text-zinc-50">Modifier le profil</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-surface-2"
              aria-label="Changer la photo de profil"
            >
              <img
                src={avatarPreview || avatarPlaceholder({ seed: user.id, name: displayName })}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={20} className="text-white" />
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <span className="text-xs text-zinc-500">@{profile.username}</span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Nom affiché</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="Parle un peu de toi..."
              className="w-full resize-none rounded-lg border border-white/10 bg-surface-2 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-dark disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
