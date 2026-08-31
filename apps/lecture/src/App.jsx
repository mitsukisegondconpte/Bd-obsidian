import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Library from './pages/Library'
import SeriesDetail from './pages/SeriesDetail'
import ChapterReader from './pages/ChapterReader'
import AuthorProfile from './pages/AuthorProfile'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
        <Route path="/profil/:username" element={<AuthorProfile />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
      </Routes>
    </>
  )
}
