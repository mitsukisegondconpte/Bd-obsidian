import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Channels from './pages/Channels'
import ChannelDetail from './pages/ChannelDetail'
import CreateChannel from './pages/CreateChannel'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import CreateCommunity from './pages/CreateCommunity'
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
        <Route path="/canaux" element={<Channels />} />
        <Route path="/canal/:channelId" element={<ChannelDetail />} />
        <Route path="/creer-canal" element={<CreateChannel />} />
        <Route path="/communautes" element={<Communities />} />
        <Route path="/communaute/:communityId" element={<CommunityDetail />} />
        <Route path="/creer-communaute" element={<CreateCommunity />} />
        <Route path="/profil/:username" element={<AuthorProfile />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
      </Routes>
    </>
  )
}
