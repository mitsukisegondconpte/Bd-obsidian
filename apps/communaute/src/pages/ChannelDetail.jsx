import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, Check, Radio } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PostItem from '../components/ui/PostItem'
import { avatarPlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import {
  countChannelSubscribers,
  createChannelPost,
  getChannel,
  isSubscribedToChannel,
  listChannelPosts,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../api/channels'
import { recordStreakActivity } from '../api/streaks'

export default function ChannelDetail() {
  const { channelId } = useParams()
  const { user } = useAuth()

  const [channel, setChannel] = useState(null)
  const [posts, setPosts] = useState([])
  const [subCount, setSubCount] = useState(0)
  const [subscribed, setSubscribed] = useState(false)
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    getChannel(channelId).then(setChannel)
    listChannelPosts(channelId).then(setPosts)
    countChannelSubscribers(channelId).then(setSubCount)
  }, [channelId])

  useEffect(() => {
    if (user) isSubscribedToChannel(user.id, channelId).then(setSubscribed)
  }, [user, channelId])

  async function toggleSub() {
    if (subscribed) {
      await unsubscribeFromChannel(user.id, channelId)
      setSubscribed(false)
      setSubCount((n) => n - 1)
    } else {
      await subscribeToChannel(user.id, channelId)
      setSubscribed(true)
      setSubCount((n) => n + 1)
    }
  }

  async function handlePost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    const created = await createChannelPost({ channelId, body: newPost.trim() })
    setPosts((p) => [created, ...p])
    setNewPost('')
    recordStreakActivity('community').catch(() => {})
  }

  if (!channel) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  const isOwner = user?.id === channel.owner_id
  const avatar = channel.owner?.avatar_url || avatarPlaceholder({ seed: channel.owner_id, name: channel.owner?.display_name })

  return (
    <Layout>
      <div className="px-4 pt-4 sm:px-6">
        <Link to="/canaux" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400">
          <ArrowLeft size={16} /> Canaux
        </Link>

        <div className="flex items-center gap-3">
          <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-zinc-50">
              <Radio size={16} className="text-accent" /> {channel.name}
            </h1>
            <p className="text-xs text-zinc-500">
              par {channel.owner?.display_name} · {subCount.toLocaleString('fr-FR')} abonnés
            </p>
          </div>
          {user && !isOwner && (
            <button
              type="button"
              onClick={toggleSub}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${
                subscribed ? 'bg-surface-2 text-zinc-200 ring-1 ring-white/10' : 'bg-accent text-accent-ink'
              }`}
            >
              {subscribed ? <Check size={15} /> : <Bell size={15} />}
              {subscribed ? 'Abonné' : "S'abonner"}
            </button>
          )}
        </div>

        {channel.description && <p className="mt-3 text-sm text-zinc-400">{channel.description}</p>}

        {isOwner && (
          <form onSubmit={handlePost} className="mt-5 space-y-2 rounded-xl border border-white/10 bg-surface-1 p-3.5">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Annonce, nouvelle sortie..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-ink">
              Publier
            </button>
          </form>
        )}

        <div className="mt-4 pb-6">
          {posts.map((p) => (
            <PostItem key={p.id} post={p} author={channel.owner} />
          ))}
          {posts.length === 0 && <p className="py-6 text-sm text-zinc-500">Aucune publication pour l'instant.</p>}
        </div>
      </div>
    </Layout>
  )
}
