import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Camera, Flag, LogIn, LogOut, Send, Users, X } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PostItem from '../components/ui/PostItem'
import { bannerPlaceholder } from '../utils/placeholders'
import { useAuth } from '../context/AuthContext'
import {
  countCommunityMembers,
  createCommunityPost,
  getCommunity,
  isCommunityMember,
  joinCommunity,
  leaveCommunity,
  listCommunityMembers,
  listCommunityPosts,
  reportCommunity,
  updateCommunityCover,
  uploadCommunityCover,
} from '../api/communities'
import { recordStreakActivity } from '../api/streaks'

export default function CommunityDetail() {
  const { communityId } = useParams()
  const { user } = useAuth()

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

  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const coverInputRef = useRef(null)

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
      const created = await createCommunityPost({
        communityId,
        authorId: user.id,
        body: newPost.trim(),
        replyToId: replyTarget?.id,
      })
      setPosts((p) => [...p, created])
      setNewPost('')
      setReplyTarget(null)
      setMentionQuery(null)
      recordStreakActivity('community').catch(() => {})
    } catch (err) {
      setSendError(err.message || "Le message n'a pas pu être envoyé. Réessaie.")
    } finally {
      setSending(false)
    }
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportCommunity({ communityId, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  const mentionMatches =
    mentionQuery !== null ? members.filter((m) => m.username.toLowerCase().startsWith(mentionQuery)).slice(0, 5) : []

  if (!community) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  const isCreator = user?.id === community.creator_id
  const cover = community.cover_url || bannerPlaceholder({ seed: community.id })

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
          {user && (
            <button
              type="button"
              onClick={toggleMembership}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${
                isMember ? 'bg-surface-2 text-zinc-200 ring-1 ring-white/10' : 'bg-accent text-accent-ink'
              }`}
            >
              {isMember ? <LogOut size={15} /> : <LogIn size={15} />}
              {isMember ? 'Quitter' : 'Rejoindre'}
            </button>
          )}
        </div>

        {community.description && <p className="mt-3 text-sm text-zinc-400">{community.description}</p>}

        {community.is_validated && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
            <BadgeCheck size={14} /> Communauté certifiée par Hypercube Realms.
          </p>
        )}

        <div className="mt-4 rounded-xl border border-white/5 bg-surface-1/50 p-3 sm:p-4">
          {posts.map((p) => (
            <PostItem
              key={p.id}
              post={p}
              author={p.author}
              isOwn={p.author_id === user?.id}
              onReply={setReplyTarget}
            />
          ))}
          {posts.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">Aucun message pour l'instant. Sois le premier à écrire !</p>}
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
                type="submit"
                disabled={!newPost.trim() || sending}
                aria-label="Envoyer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
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
