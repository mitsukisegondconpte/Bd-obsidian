import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LoadingScreen from './components/ui/LoadingScreen'
import SuspendedScreen from './components/ui/SuspendedScreen'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const WorkDetail = lazy(() => import('./pages/WorkDetail'))
const ChapterReader = lazy(() => import('./pages/ChapterReader'))
const CreateWork = lazy(() => import('./pages/CreateWork'))
const AddChapter = lazy(() => import('./pages/AddChapter'))
const MyWorks = lazy(() => import('./pages/MyWorks'))
const EditionServices = lazy(() => import('./pages/EditionServices'))
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  const { loading, profile } = useAuth()

  if (loading) return <LoadingScreen />
  if (profile?.is_suspended) return <SuspendedScreen />

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
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
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
