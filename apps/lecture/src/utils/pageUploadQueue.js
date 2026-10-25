// Keep File objects and stable row IDs until every step succeeds. Nothing is
// persisted in browser storage; leaving/reloading the editor requires a warning.
export function createPageUploadQueue() {
  const jobs = []
  let running = false
  function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (letter) => {
      const random = Math.random() * 16 | 0
      return (letter === 'x' ? random : (random & 0x3) | 0x8).toString(16)
    })
  }
  return {
    get pending() { return jobs.length },
    enqueue(files, existingPages) {
      const lastNumber = Math.max(0, ...existingPages.map((page) => page.page_number), ...jobs.map((job) => job.pageNumber))
      jobs.push(...files.map((file, index) => ({
        file,
        pageId: createId(),
        pageNumber: lastNumber + index + 1,
      })))
    },
    async run(upload, prepare, onSaved) {
      if (running) throw new Error('Un envoi de pages est déjà en cours.')
      running = true
      try {
        while (jobs.length) {
          const job = jobs[0]
          job.page = job.page || await upload(job)
          const page = await prepare(job.page)
          onSaved(page)
          jobs.shift()
        }
      } finally {
        running = false
      }
    },
  }
}
