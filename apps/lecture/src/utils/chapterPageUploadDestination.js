function safeName(name) {
  return String(name ?? '').replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function chapterPageUploadDestination({ chapterId, ownerId, pageId, fileName, isPublished }) {
  const bucket = isPublished ? 'chapter-pages' : 'author-drafts'
  const folder = isPublished ? ownerId + '/' : ownerId + '/chapters/' + chapterId + '/'
  return { bucket, path: folder + pageId + '-' + safeName(fileName) }
}
