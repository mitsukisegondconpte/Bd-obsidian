export function chapterPagesForReader(chapterId, rows) {
  return (rows || [])
    .filter((page) => page.chapter_id === chapterId)
    .sort((a, b) => a.page_number - b.page_number)
    .map((page) => ({ id: page.id, url: page.image_url }))
}
