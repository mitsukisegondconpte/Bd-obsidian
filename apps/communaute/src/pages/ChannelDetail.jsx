import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bell, Camera, Check, Copy, Flag, Radio, Send, Share2, X } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PostItem from '../components/ui/PostItem'
import { avatarPlaceholder, bannerPlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import {
  countChannelPostLikes,
  countChannelSubscribers,
  createChannelPost,
  getChannel,
  hasLikedChannelPost,
  isSubscribedToChannel,
  likeChannelPost,
  listChannelPosts,
  reportChannel,
  subscribeToChannel,
  unlikeChannelPost,
  unsubscribeFromChannel,
  updateChannelCover,
  uploadChannelCover,
  uploadChannelMedia,
} from '../api/channels'
import { createCommunityPost, listMyCommunities } from '../api/communities'
import { recordStreakActivity } from '../api/streaks'
import Loader from '../components/ui/Loader'

export default function ChannelDetail() {
  const { channelId } = useParams()
  const { user } = useAuth()

  const [channel, setChannel] = useState(null)
  const [posts, setPosts] = useState([])
  const [subCount, setSubCount] = useState(0)
  const [subscribed, setSubscribed] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [posting, setPosting] = useState(false)

  const [likeState, setLikeState] = useState({}) // { [postId]: { liked, count } }
  const [shareTarget, setShareTarget] = useState(null)
  const [myCommunities, setMyCommunities] = useState([])
  const [shareDone, setShareDone] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef(null)

  useEffect(() => {
    getChannel(channelId).then(setChannel)
    listChannelPosts(channelId).then((data) => {
      setPosts(data)
      data.forEach((p) => {
        countChannelPostLikes(p.id).then((count) =>
          setLikeState((s) => ({ ...s, [p.id]: { ...s[p.id], count } })),
        )
      })
    })
    countChannelSubscribers(channelId).then(setSubCount)
  }, [channelId])

  useEffect(() => {
    if (!user) return
    isSubscribedToChannel(user.id, channelId).then(setSubscribed)
    listMyCommunities(user.id).then(setMyCommunities)
  }, [user, channelId])

  useEffect(() => {
    if (!user || posts.length === 0) return
    posts.forEach((p) => {
      hasLikedChannelPost(user.id, p.id).then((liked) =>
        setLikeState((s) => ({ ...s, [p.id]: { ...s[p.id], liked } })),
      )
    })
  }, [user, posts])

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

  async function toggleLike(postId) {
    if (!user) return
    const current = likeState[postId] ?? { liked: false, count: 0 }
    if (current.liked) {
      await unlikeChannelPost(user.id, postId)
      setLikeState((s) => ({ ...s, [postId]: { liked: false, count: Math.max(0, current.count - 1) } }))
    } else {
      await likeChannelPost(user.id, postId)
      setLikeState((s) => ({ ...s, [postId]: { liked: true, count: current.count + 1 } }))
    }
  }

  async function handlePost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    try {
      let mediaUrl
      if (mediaFile) {
        mediaUrl = await uploadChannelMedia({ ownerId: user.id, file: mediaFile })
      }
      const created = await createChannelPost({ channelId, body: newPost.trim(), mediaUrl })
      setPosts((p) => [created, ...p])
      setNewPost('')
      setMediaFile(null)
      recordStreakActivity('community').catch(() => {})
    } finally {
      setPosting(false)
    }
  }

  function handleCopyLink(post) {
    const url = `${window.location.origin}/canal/${channelId}#post-${post.id}`
    navigator.clipboard?.writeText(url)
  }

  async function handleWebShare(post) {
    const url = `${window.location.origin}/canal/${channelId}#post-${post.id}`
    if (navigator.share) {
      await navigator.share({ title: channel?.name, text: post.body, url }).catch(() => {})
    } else {
      handleCopyLink(post)
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadChannelCover({ ownerId: user.id, file })
      await updateChannelCover(channelId, url)
      setChannel((c) => ({ ...c, cover_url: url }))
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportChannel({ channelId, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  async function handleRepost(communityId) {
    if (!shareTarget) return
    await createCommunityPost({
      communityId,
      authorId: user.id,
      body: '',
      sharedFromChannelPostId: shareTarget.id,
    })
    setShareDone(true)
    setTimeout(() => {
      setShareTarget(null)
      setShareDone(false)
    }, 1200)
  }

  if (!channel) {
    return (
      <Layout>
        <Loader />
      </Layout>
    )
  }

  const isOwner = user?.id === channel.owner_id
  const avatar = channel.owner?.avatar_url || avatarPlaceholder({ seed: channel.owner_id, name: channel.owner?.display_name })
  const cover = channel.cover_url || bannerPlaceholder({ seed: channel.id })

  return (
    <Layout>
      <div className="relative">
        <div className="relative h-28 w-full overflow-hidden sm:h-36">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/20 to-black/10" />
        </div>
        <Link to="/canaux" aria-label="Retour" className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white">
          <ArrowLeft size={20} />
        </Link>
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              aria-label="Changer la couverture"
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70 disabled:opacity-60"
            >
              <Camera size={13} /> {uploadingCover ? 'Envoi...' : 'Couverture'}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-3 sm:px-6">
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-200"
            />
            <button type="submit" disabled={posting} className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-ink disabled:opacity-60">
              {posting ? 'Publication...' : 'Publier'}
            </button>
          </form>
        )}

        <div className="mt-4 pb-6">
          {posts.map((p) => (
            <PostItem
              key={p.id}
              post={p}
              author={channel.owner}
              likeCount={likeState[p.id]?.count ?? 0}
              liked={likeState[p.id]?.liked ?? false}
              onToggleLike={user ? () => toggleLike(p.id) : undefined}
              onShare={() => setShareTarget(p)}
            />
          ))}
          {posts.length === 0 && <p className="py-6 text-sm text-zinc-500">Aucune publication pour l'instant.</p>}
        </div>

        {user && !isOwner && (
          <div className="border-t border-white/5 pb-6 pt-3">
            {reportSent ? (
              <p className="text-xs text-emerald-400">Signalement envoyé, merci.</p>
            ) : reportOpen ? (
              <div className="space-y-2">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Pourquoi signaler cette chaine ?"
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
                />
                <button type="button" onClick={handleReport} className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400">
                  Envoyer le signalement
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-400"
              >
                <Flag size={13} /> Signaler cette chaine
              </button>
            )}
          </div>
        )}
      </div>

      {shareTarget && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setShareTarget(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-surface-1 p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-zinc-100">Partager</h3>
              <button type="button" onClick={() => setShareTarget(null)} aria-label="Fermer">
                <X size={18} className="text-zinc-500" />
              </button>
            </div>

            {shareDone ? (
              <p className="py-4 text-center text-sm text-emerald-400">Repartagé dans ton groupe !</p>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleWebShare(shareTarget)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-surface-2"
                >
                  <Send size={15} className="text-accent" /> Partager sur les réseaux sociaux
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareTarget)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-surface-2"
                >
                  <Copy size={15} className="text-accent" /> Copier le lien
                </button>

                {myCommunities.length > 0 && (
                  <>
                    <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                      Repartager dans un de mes groupes
                    </p>
                    {myCommunities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleRepost(c.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-surface-2"
                      >
                        <Share2 size={15} className="text-accent" /> {c.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
