import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Library from './pages/Library'
import SeriesDetail from './pages/SeriesDetail'
import ChapterReader from './pages/ChapterReader'
import AuthorProfile from './pages/AuthorProfile'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explore />} />
        <Route path="/abonnements" element={<Library />} />
        <Route path="/serie/:slug" element={<SeriesDetail />} />
        <Route path="/serie/:slug/chapitre/:chapterId" element={<ChapterReader />} />
        <Route path="/profil/:authorId" element={<AuthorProfile />} />
      </Routes>
    </>
  )
}
