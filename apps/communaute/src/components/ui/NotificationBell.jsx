import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import {
  listNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notifications'

const PLATFORM_URLS = {
  lecture: 'https://bd-obsidian-lecture.vercel.app',
  ecriture: 'https://bd-obsidian-ecriture.vercel.app',
  communaute: 'https://bd-obsidian-communaute.vercel.app',
}

// link_path est écrit par le trigger qui a créé la notification, sans
// savoir depuis quelle des 3 apps il sera consulté (même table partagée) —
// on route en interne si le chemin appartient à cette app, sinon en lien
// externe vers la bonne plateforme.
function resolveNotificationLink(path) {
  let targetApp = 'communaute'
  if (path.startsWith('/serie/')) targetApp = 'lecture'
  else if (path.startsWith('/oeuvre/') || path.startsWith('/edition') || path.startsWith('/mes-oeuvres')) targetApp = 'ecriture'
  if (targetApp === 'communaute') return { internal: true, url: path }
  return { internal: false, url: `${PLATFORM_URLS[targetApp]}${path}` }
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

// Cloche de notifications partagée entre les 3 apps : les événements
// déclenchés depuis n'importe quelle plateforme (nouvel abonné, nouveau
// chapitre, repêchage accepté) arrivent ici en direct via Supabase Realtime.
export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!user) return undefined
    countUnreadNotifications(user.id).then(setUnread)

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => setUnread((n) => n + 1),
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  useEffect(() => {
    if (!open || !user) return
    listNotifications(user.id).then(setItems)
  }, [open, user?.id])

  useEffect(() => {
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!user) return null

  async function handleItemClick(n) {
    if (!n.is_read) {
      await markNotificationRead(n.id)
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)))
      setUnread((c) => Math.max(0, c - 1))
    }
    if (n.link_path) {
      setOpen(false)
      const { internal, url } = resolveNotificationLink(n.link_path)
      if (internal) navigate(url)
      else window.location.href = url
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(user.id)
    setItems((prev) => prev.map((it) => ({ ...it, is_read: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-surface-2 hover:text-white"
      >
        <Bell size={19} />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />}
      </button>

      {open && (
        <div className="fixed right-4 top-14 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-surface-1 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <span className="text-sm font-bold text-zinc-100">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={handleMarkAll} className="text-xs font-semibold text-accent hover:underline">
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">Aucune notification pour l'instant.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleItemClick(n)}
                className={`block w-full border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-surface-2 ${n.is_read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                  <div className={n.is_read ? 'pl-3.5' : ''}>
                    <p className="text-sm font-semibold text-zinc-100">{n.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{n.body}</p>
                    <p className="mt-1 text-[11px] text-zinc-600">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
