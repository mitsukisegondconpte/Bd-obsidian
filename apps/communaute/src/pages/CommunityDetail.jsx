import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Flag, LogIn, LogOut, Users } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PostItem from '../components/ui/PostItem'
import { useAuth } from '../context/AuthContext'
import {
  countCommunityMembers,
  createCommunityPost,
  getCommunity,
  isCommunityMember,
  joinCommunity,
  leaveCommunity,
  listCommunityPosts,
  reportCommunity,
} from '../api/communities'
import { recordStreakActivity } from '../api/streaks'

export default function CommunityDetail() {
  const { communityId } = useParams()
  const { user } = useAuth()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [memberCount, setMemberCount] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    getCommunity(communityId).then(setCommunity)
    listCommunityPosts(communityId).then(setPosts)
    countCommunityMembers(communityId).then(setMemberCount)
  }, [communityId])

  useEffect(() => {
    if (user) isCommunityMember(user.id, communityId).then(setIsMember)
  }, [user, communityId])

  async function toggleMembership() {
    if (isMember) {
      await leaveCommunity(user.id, communityId)
      setIsMember(false)
      setMemberCount((n) => n - 1)
    } else {
      await joinCommunity(user.id, communityId)
      setIsMember(true)
      setMemberCount((n) => n + 1)
    }
  }

  async function handlePost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    const created = await createCommunityPost({ communityId, authorId: user.id, body: newPost.trim() })
    setPosts((p) => [created, ...p])
    setNewPost('')
    recordStreakActivity('community').catch(() => {})
  }

  async function handleReport() {
    if (!reportReason.trim()) return
    await reportCommunity({ communityId, reporterId: user.id, reason: reportReason.trim() })
    setReportSent(true)
  }

  if (!community) {
    return (
      <Layout>
        <p className="p-6 text-zinc-500">Chargement...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 pt-4 sm:px-6">
        <Link to="/communautes" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400">
          <ArrowLeft size={16} /> Communautés
        </Link>

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
            <BadgeCheck size={14} /> Communauté certifiée par Hypercube Obsidian.
          </p>
        )}

        {isMember && (
          <form onSubmit={handlePost} className="mt-5 space-y-2 rounded-xl border border-white/10 bg-surface-1 p-3.5">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Partage quelque chose avec le groupe..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-accent-ink">
              Publier
            </button>
          </form>
        )}

        <div className="mt-4 pb-4">
          {posts.map((p) => (
            <PostItem key={p.id} post={p} author={p.author} />
          ))}
          {posts.length === 0 && <p className="py-6 text-sm text-zinc-500">Aucune publication pour l'instant.</p>}
        </div>

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
