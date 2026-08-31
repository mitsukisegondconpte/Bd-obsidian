import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Flag,
  Image as ImageIcon,
  LogIn,
  LogOut,
  Pin,
  Search,
  Send,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import PostItem from '../components/ui/PostItem'
import { bannerPlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import {
  countCommunityMembers,
  createCommunityPost,
  deleteCommunityPost,
  getCommunity,
  isCommunityMember,
  joinCommunity,
  leaveCommunity,
  listCommunityMembers,
  listCommunityPosts,
  pinCommunityPost,
  removeReaction,
  reportCommunity,
  setReaction,
  unpinCommunityPost,
  updateCommunityCover,
  updateCommunityPost,
  uploadCommunityCover,
  uploadCommunityMedia,
} from '../api/communities'
import { recordStreakActivity } from '../api/streaks'

export default function CommunityDetail() {
  const { communityId } = useParams()
  const { user, profile } = useAuth()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [members, setMembers] = useState([])
  const [memberCount, setMemberCount] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [replyTarget, setReplyTarget] = useState(null)
  const [mentionQuery, setMentionQuery] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [highlightedId, setHighlightedId] = useState(null)
  const [mediaFile, setMediaFile] = useState(null)
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const coverInputRef = useRef(null)
  const mediaInputRef = useRef(null)
  const messageRefs = useRef({})

  function jumpToReply(id) {
    const el = messageRefs.current[id]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedId(id)
    setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), 1500)
  }

  function formatDaySeparator(dateStr) {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const sameDay = (a, b) => a.toDateString() === b.toDateString()
    if (sameDay(date, today)) return "Aujourd'hui"
    if (sameDay(date, yesterday)) return 'Hier'
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  useEffect(() => {
    getCommunity(communityId).then(setCommunity)
    listCommunityPosts(communityId).then(setPosts)
    listCommunityMembers(communityId).then(setMembers)
    countCommunityMembers(communityId).then(setMemberCount)
  }, [communityId])

  useEffect(() => {
    if (user) isCommunityMember(user.id, communityId).then(setIsMember)
  }, [user, communityId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: 'end' })
  }, [posts.length])

  async function toggleMembership() {
    if (isMember) {
      await leaveCommunity(user.id, communityId)
      setIsMember(false)
      setMemberCount((n) => n - 1)
    } else {
      await joinCommunity(user.id, communityId)
      setIsMember(true)
      setMemberCount((n) => n + 1)
      listCommunityMembers(communityId).then(setMembers)
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadCommunityCover({ ownerId: user.id, file })
      await updateCommunityCover(communityId, url)
      setCommunity((c) => ({ ...c, cover_url: url }))
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  function handleInputChange(value) {
    setNewPost(value)
    const match = value.slice(0, inputRef.current?.selectionStart ?? value.length).match(/@([a-zA-Z0-9_]*)$/)
    setMentionQuery(match ? match[1].toLowerCase() : null)
  }

  function insertMention(username) {
    const cursor = inputRef.current?.selectionStart ?? newPost.length
    const before = newPost.slice(0, cursor).replace(/@([a-zA-Z0-9_]*)$/, `@${username} `)
    const after = newPost.slice(cursor)
    setNewPost(before + after)
    setMentionQuery(null)
    inputRef.current?.focus()
  }

  // Rejoindre est automatique dès le premier message : on ne bloque plus
  // l'envoi derrière un bouton "Rejoindre" séparé et peu visible.
  async function handlePost(e) {
    e.preventDefault()
    if (!newPost.trim() || sending) return
    setSending(true)
    setSendError('')
    try {
      if (!isMember) {
        await joinCommunity(user.id, communityId)
        setIsMember(true)
        setMemberCount((n) => n + 1)
        listCommunityMembers(communityId).then(setMembers)
      }
      let mediaUrl
      if (mediaFile) {
        mediaUrl = await uploadCommunityMedia({ ownerId: user.id, file: mediaFile })
      }
      const created = await createCommunityPost({
        communityId,
        authorId: user.id,
        body: newPost.trim(),
        replyToId: replyTarget?.id,
        isSpoiler,
        mediaUrl,
      })
      setPosts((p) => [...p, created])
      setNewPost('')
      setReplyTarget(null)
      setMentionQuery(null)
      setMediaFile(null)
      setIsSpoiler(false)
      recordStreakActivity('community').catch(() => {})
    } catch (err) {
      setSendError(err.message || "Le message n'a pas pu être envoyé. Réessaie.")
    } finally {
      setSending(false)
    }
  }

  async function handleReact(post, emoji) {
    if (!user) return
    const prevReactions = post.reactions ?? []
    const nextReactions = prevReactions.filter((r) => r.user_id !== user.id)
    if (emoji) nextReactions.push({ user_id: user.id, emoji })
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, reactions: nextReactions } : p)))
    if (emoji) await setReaction({ postId: post.id, userId: user.id, emoji })
    else await removeReaction({ postId: post.id, userId: user.id })
  }

  async function handleEditPost(post, body) {
    const updated = await updateCommunityPost(post.id, body)
    setPosts((ps) => ps.map((p) => (p.id === post.id ? updated : p)))
  }

  async function handleDeletePost(post) {
    if (!window.confirm('Supprimer ce message ?')) return
    await deleteCommunityPost(post.id)
    setPosts((ps) => ps.filter((p) => p.id !== post.id))
  }

  async function handleTogglePin(post) {
    if (community.pinned_post_id === post.id) {
      await unpinCommunityPost(communityId)
      setCommunity((c) => ({ ...c, pinned_post_id: null }))
    } else {
      await pinCommunityPost(communityId, post.id)
      setCommunity((c) => ({ ...c, pinned_post_id: post.id }))
    }
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportCommunity({ communityId, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  const mentionMatches =
    mentionQuery !== null ? members.filter((m) => m.username.toLowerCase().startsWith(mentionQuery)).slice(0, 5) : []

  // La cible d'une réponse est déjà présente dans la liste chargée : pas
  // besoin de la redemander au serveur (voir la note dans communities.js
  // sur l'embed reply_to cassé côté PostgREST pour une table sur elle-même).
  const postsById = new Map(posts.map((p) => [p.id, p]))

  if (!community) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  const isCreator = user?.id === community.creator_id
  const canModerate = isCreator || profile?.is_platform_admin
  const cover = community.cover_url || bannerPlaceholder({ seed: community.id })
  const pinnedPost = community.pinned_post_id ? postsById.get(community.pinned_post_id) : null

  const query = searchQuery.trim().toLowerCase()
  const visiblePosts = query ? posts.filter((p) => !p.is_system && p.body.toLowerCase().includes(query)) : posts

  return (
    <Layout>
      <div className="relative">
        <div className="relative h-32 w-full overflow-hidden sm:h-40">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/20 to-black/10" />
        </div>
        <Link to="/communautes" aria-label="Retour" className="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white">
          <ArrowLeft size={20} />
        </Link>
        {isCreator && (
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-zinc-50">
              <Users size={16} className="text-accent" /> {community.name}
              {community.is_validated && <BadgeCheck size={17} className="text-sky-400" fill="currentColor" stroke="#0c0709" />}
            </h1>
            <p className="text-xs text-zinc-500">
              créée par {community.creator?.display_name} · {memberCount.toLocaleString('fr-FR')} membres
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Rechercher dans les messages"
              className={`rounded-full p-2 ${searchOpen ? 'bg-accent/20 text-accent' : 'text-zinc-400 hover:bg-surface-2'}`}
            >
              <Search size={17} />
            </button>
            {user && (
              <button
                type="button"
                onClick={toggleMembership}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${
                  isMember ? 'bg-surface-2 text-zinc-200 ring-1 ring-white/10' : 'bg-accent text-accent-ink'
                }`}
              >
                {isMember ? <LogOut size={15} /> : <LogIn size={15} />}
                {isMember ? 'Quitter' : 'Rejoindre'}
              </button>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="relative mt-3">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un message..."
              className="w-full rounded-full border border-white/10 bg-surface-2 py-2 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
          </div>
        )}

        {community.description && <p className="mt-3 text-sm text-zinc-400">{community.description}</p>}

        {community.is_validated && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
            <BadgeCheck size={14} /> Communauté certifiée par Hypercube Realms.
          </p>
        )}

        {pinnedPost && !query && (
          <button
            type="button"
            onClick={() => jumpToReply(pinnedPost.id)}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-left"
          >
            <Pin size={14} className="shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-accent">Message épinglé</p>
              <p className="truncate text-xs text-zinc-300">{pinnedPost.body}</p>
            </div>
            {canModerate && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTogglePin(pinnedPost)
                }}
                aria-label="Désépingler"
                className="shrink-0 text-zinc-500 hover:text-zinc-300"
              >
                <X size={14} />
              </span>
            )}
          </button>
        )}

        <div className="mt-4 rounded-xl border border-white/5 bg-surface-1/50 p-3 sm:p-4">
          {visiblePosts.map((p, i) => {
            const prev = visiblePosts[i - 1]
            const showDaySeparator =
              !query && (!prev || new Date(prev.created_at).toDateString() !== new Date(p.created_at).toDateString())
            return (
              <div key={p.id}>
                {showDaySeparator && (
                  <div className="my-2 flex items-center justify-center">
                    <span className="rounded-full bg-surface-2/70 px-3 py-1 text-[11px] font-semibold text-zinc-500">
                      {formatDaySeparator(p.created_at)}
                    </span>
                  </div>
                )}
                <PostItem
                  post={p}
                  author={p.author}
                  isOwn={p.author_id === user?.id}
                  onReply={setReplyTarget}
                  replyTo={p.reply_to_id ? postsById.get(p.reply_to_id) : null}
                  onJumpToReply={jumpToReply}
                  highlighted={highlightedId === p.id}
                  itemRef={(el) => {
                    messageRefs.current[p.id] = el
                  }}
                  reactions={p.reactions ?? []}
                  currentUserId={user?.id}
                  onReact={user ? (emoji) => handleReact(p, emoji) : undefined}
                  canEdit={p.author_id === user?.id}
                  onEdit={(body) => handleEditPost(p, body)}
                  canDelete={p.author_id === user?.id || profile?.is_platform_admin}
                  onDelete={() => handleDeletePost(p)}
                  isPinned={community.pinned_post_id === p.id}
                  canPin={canModerate}
                  onTogglePin={() => handleTogglePin(p)}
                />
              </div>
            )
          })}
          {visiblePosts.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              {query ? 'Aucun message ne correspond à ta recherche.' : "Aucun message pour l'instant. Sois le premier à écrire !"}
            </p>
          )}
          <div ref={scrollRef} />
        </div>

        {user ? (
          <form onSubmit={handlePost} className="sticky bottom-16 z-10 mt-2 rounded-xl border border-white/10 bg-surface-1 p-2.5 shadow-xl sm:bottom-2">
            {!isMember && (
              <p className="mb-2 px-1 text-xs text-zinc-500">
                Ton premier message t'inscrit automatiquement dans cette communauté.
              </p>
            )}
            {replyTarget && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border-l-2 border-accent bg-surface-2 px-2.5 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-accent">{replyTarget.author?.display_name ?? 'Membre'}</p>
                  <p className="truncate text-zinc-400">{replyTarget.body}</p>
                </div>
                <button type="button" onClick={() => setReplyTarget(null)} aria-label="Annuler la réponse" className="shrink-0 text-zinc-500 hover:text-zinc-200">
                  <X size={14} />
                </button>
              </div>
            )}

            {mediaFile && (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs text-zinc-300">
                <span className="truncate">{mediaFile.name}</span>
                <button type="button" onClick={() => setMediaFile(null)} aria-label="Retirer l'image" className="shrink-0 text-zinc-500 hover:text-zinc-200">
                  <X size={14} />
                </button>
              </div>
            )}

            {mentionMatches.length > 0 && (
              <div className="mb-2 space-y-1 rounded-lg border border-white/10 bg-surface-2 p-1.5">
                {mentionMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => insertMention(m.username)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-surface-3"
                  >
                    <span className="font-semibold text-accent">@{m.username}</span>
                    <span className="text-xs text-zinc-500">{m.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                aria-label="Joindre une image"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-surface-2 hover:text-zinc-200"
              >
                <ImageIcon size={17} />
              </button>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <textarea
                ref={inputRef}
                value={newPost}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handlePost(e)
                  }
                }}
                placeholder="Écris un message... (@ pour mentionner)"
                rows={1}
                className="max-h-32 w-full flex-1 resize-none rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSpoiler((v) => !v)}
                aria-label="Marquer comme spoiler"
                title="Marquer comme spoiler"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isSpoiler ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:bg-surface-2 hover:text-zinc-200'
                }`}
              >
                <TriangleAlert size={16} />
              </button>
              <button
                type="submit"
                disabled={!newPost.trim() || sending}
                aria-label="Envoyer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
            {isSpoiler && <p className="mt-1.5 px-1 text-xs text-amber-400">⚠️ Ce message sera envoyé masqué (spoiler).</p>}
            {sendError && <p className="mt-1.5 px-1 text-xs text-red-400">{sendError}</p>}
          </form>
        ) : (
          <p className="mt-3 text-center text-sm text-zinc-500">
            <Link to="/connexion" className="font-semibold text-accent">
              Connecte-toi
            </Link>{' '}
            pour écrire dans cette communauté.
          </p>
        )}

        {user && (
          <div className="border-t border-white/5 pb-6 pt-3">
            {reportSent ? (
              <p className="text-xs text-emerald-400">Signalement envoyé, merci.</p>
            ) : reportOpen ? (
              <div className="space-y-2">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Pourquoi signaler cette communauté ?"
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
                <Flag size={13} /> Signaler cette communauté
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
