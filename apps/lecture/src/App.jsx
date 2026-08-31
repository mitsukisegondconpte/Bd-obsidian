import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LoadingScreen from './components/ui/LoadingScreen'
import SuspendedScreen from './components/ui/SuspendedScreen'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const Library = lazy(() => import('./pages/Library'))
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'))
const ChapterReader = lazy(() => import('./pages/ChapterReader'))
const CreateSeries = lazy(() => import('./pages/CreateSeries'))
const AddChapter = lazy(() => import('./pages/AddChapter'))
const MySeries = lazy(() => import('./pages/MySeries'))
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
          <Route path="/abonnements" element={<Library />} />
          <Route path="/serie/:slug" element={<SeriesDetail />} />
          <Route path="/serie/:slug/chapitre/:chapterId" element={<ChapterReader />} />
          <Route path="/serie/:slug/ajouter-chapitre" element={<AddChapter />} />
          <Route path="/creer-serie" element={<CreateSeries />} />
          <Route path="/mes-series" element={<MySeries />} />
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
