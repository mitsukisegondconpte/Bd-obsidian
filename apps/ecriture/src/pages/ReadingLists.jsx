import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import Layout from '../components/layout/Layout'
import WorkCard from '../components/ui/WorkCard'
import { useAuth } from '../context/AuthContext'
import { createReadingList, deleteReadingList, listMyReadingLists, removeWorkFromList } from '../api/readingLists'

export default function ReadingLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!user) return
    listMyReadingLists(user.id).then(setLists)
  }, [user])

  if (!user) {
    return (
      <Layout>
        <p className="p-6 text-zinc-400">Connecte-toi pour voir tes listes de lecture.</p>
      </Layout>
    )
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await createReadingList({ ownerId: user.id, name: newName.trim() })
      setLists((prev) => [{ ...created, reading_list_items: [] }, ...(prev ?? [])])
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteList(listId) {
    if (!window.confirm('Supprimer cette liste ?')) return
    await deleteReadingList(listId)
    setLists((prev) => prev.filter((l) => l.id !== listId))
  }

  async function handleRemoveWork(listId, workId) {
    await removeWorkFromList({ listId, workId })
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, reading_list_items: l.reading_list_items.filter((it) => it.work_id !== workId) }
          : l
      )
    )
  }

  return (
    <Layout>
      <div className="px-4 pt-6 sm:px-6">
        <h1 className="text-xl font-extrabold text-zinc-50">Mes listes de lecture</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Organise les oeuvres que tu suis en collections personnelles — tu peux en ajouter depuis la page d'une
          oeuvre.
        </p>

        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la nouvelle liste..."
            className="flex-1 rounded-full border border-white/10 bg-surface-2 px-3.5 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink disabled:opacity-60"
          >
            <Plus size={15} /> Créer
          </button>
        </form>

        <div className="mt-8 space-y-8 pb-10">
          {lists?.map((list) => (
            <div key={list.id}>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h2 className="text-sm font-bold text-zinc-100">
                  {list.name} <span className="text-zinc-500">({list.reading_list_items.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleDeleteList(list.id)}
                  aria-label="Supprimer la liste"
                  className="text-zinc-500 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {list.reading_list_items.length === 0 ? (
                <p className="py-4 text-sm text-zinc-500">Aucune oeuvre dans cette liste pour l'instant.</p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
                  {list.reading_list_items.map((item) => (
                    <div key={item.work_id} className="relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveWork(list.id, item.work_id)}
                        aria-label="Retirer de la liste"
                        className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-red-500/80"
                      >
                        <X size={13} />
                      </button>
                      <WorkCard work={item.work} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {lists && lists.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              Tu n'as pas encore de liste. Crée-en une ci-dessus.
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
