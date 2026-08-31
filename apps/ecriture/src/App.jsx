import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Explore from './pages/Explore'
import WorkDetail from './pages/WorkDetail'
import ChapterReader from './pages/ChapterReader'
import CreateWork from './pages/CreateWork'
import AddChapter from './pages/AddChapter'
import MyWorks from './pages/MyWorks'
import EditionServices from './pages/EditionServices'
import AuthorProfile from './pages/AuthorProfile'
import EditProfile from './pages/EditProfile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import LoadingScreen from './components/ui/LoadingScreen'
import { useAuth } from './context/AuthContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explore />} />
        <Route path="/oeuvre/:workId" element={<WorkDetail />} />
        <Route path="/oeuvre/:workId/chapitre/:chapterId" element={<ChapterReader />} />
        <Route path="/oeuvre/:workId/nouveau-chapitre" element={<AddChapter />} />
        <Route path="/creer" element={<CreateWork />} />
        <Route path="/mes-oeuvres" element={<MyWorks />} />
        <Route path="/edition" element={<EditionServices />} />
        <Route path="/profil/modifier" element={<EditProfile />} />
        <Route path="/profil/:username" element={<AuthorProfile />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
