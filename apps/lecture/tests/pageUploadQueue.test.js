import test from 'node:test'
import assert from 'node:assert/strict'
import { createPageUploadQueue } from '../src/utils/pageUploadQueue.js'
import { chapterPagesForReader } from '../src/utils/chapterPages.js'
import { chapterPageUploadDestination } from '../src/utils/chapterPageUploadDestination.js'

test('a failed upload remains queued and retries without duplicating completed pages', async () => {
  const queue = createPageUploadQueue()
  queue.enqueue([{ name: 'one.png' }, { name: 'two.png' }, { name: 'three.png' }], [])
  const attempts = []
  const saved = []
  let failOnce = true

  const upload = async (job) => {
    attempts.push(job.pageId)
    if (job.file.name === 'two.png' && failOnce) {
      failOnce = false
      throw new Error('temporary upload failure')
    }
    return { id: job.pageId, page_number: job.pageNumber, image_url: job.file.name }
  }
  const prepare = async (page) => page
  const onSaved = (page) => saved.push(page.id)

  await assert.rejects(queue.run(upload, prepare, onSaved), /temporary upload failure/)
  assert.equal(queue.pending, 2)
  assert.equal(saved.length, 1)
  await queue.run(upload, prepare, onSaved)
  assert.equal(queue.pending, 0)
  assert.equal(new Set(saved).size, 3)
  assert.equal(saved[0], attempts[0])
  assert.equal(attempts.filter((id) => id === saved[0]).length, 1)
  assert.equal(attempts.filter((id) => id === saved[1]).length, 2)
  assert.equal(attempts.filter((id) => id === saved[2]).length, 1)
})

test('a preview failure retries the saved page without uploading it again', async () => {
  const queue = createPageUploadQueue()
  queue.enqueue([{ name: 'one.png' }], [])
  let uploads = 0
  let failPreview = true
  const upload = async (job) => {
    uploads += 1
    return { id: job.pageId, image_url: job.file.name }
  }
  const prepare = async (page) => {
    if (failPreview) { failPreview = false; throw new Error('temporary preview failure') }
    return page
  }
  await assert.rejects(queue.run(upload, prepare, () => {}), /temporary preview failure/)
  await queue.run(upload, prepare, () => {})
  assert.equal(uploads, 1)
  assert.equal(queue.pending, 0)
})

test('a reader groups every page under its chapter and sorts by page number', () => {
  const rows = [
    { id: 'p2', chapter_id: 'c1', page_number: 2, image_url: '/page-2.png' },
    { id: 'other', chapter_id: 'c2', page_number: 1, image_url: '/other.png' },
    { id: 'p1', chapter_id: 'c1', page_number: 1, image_url: '/page-1.png' },
  ]
  assert.deepEqual(chapterPagesForReader('c1', rows), [
    { id: 'p1', url: '/page-1.png' },
    { id: 'p2', url: '/page-2.png' },
  ])
})

test('chapter page uploads use the private draft bucket path and public bucket only after publication', () => {
  const draft = chapterPageUploadDestination({
    chapterId: 'chapter-1', ownerId: 'author-1', pageId: 'page-1', fileName: 'page 1.png', isPublished: false,
  })
  assert.deepEqual(draft, { bucket: 'author-drafts', path: 'author-1/chapters/chapter-1/page-1-page_1.png' })
  const published = chapterPageUploadDestination({
    chapterId: 'chapter-1', ownerId: 'author-1', pageId: 'page-1', fileName: 'page 1.png', isPublished: true,
  })
  assert.deepEqual(published, { bucket: 'chapter-pages', path: 'author-1/page-1-page_1.png' })
})
