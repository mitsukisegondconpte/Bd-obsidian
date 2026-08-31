import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LoadingScreen from './components/ui/LoadingScreen'
import SuspendedScreen from './components/ui/SuspendedScreen'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const Channels = lazy(() => import('./pages/Channels'))
const ChannelDetail = lazy(() => import('./pages/ChannelDetail'))
const CreateChannel = lazy(() => import('./pages/CreateChannel'))
const Communities = lazy(() => import('./pages/Communities'))
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'))
const CreateCommunity = lazy(() => import('./pages/CreateCommunity'))
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'))
const Classement = lazy(() => import('./pages/Classement'))
const Confidentialite = lazy(() => import('./pages/Confidentialite'))
const ConditionsUtilisation = lazy(() => import('./pages/ConditionsUtilisation'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))

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
          <Route path="/canaux" element={<Channels />} />
          <Route path="/canal/:channelId" element={<ChannelDetail />} />
          <Route path="/creer-canal" element={<CreateChannel />} />
          <Route path="/communautes" element={<Communities />} />
          <Route path="/communaute/:communityId" element={<CommunityDetail />} />
          <Route path="/creer-communaute" element={<CreateCommunity />} />
          <Route path="/profil/modifier" element={<EditProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profil/:username" element={<AuthorProfile />} />
          <Route path="/classement" element={<Classement />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Signup />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
