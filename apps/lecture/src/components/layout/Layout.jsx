import Navbar from './Navbar'
import MobileTabBar from './MobileTabBar'
import PlatformStatusBanner from './PlatformStatusBanner'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      <PlatformStatusBanner />
      <main className="mx-auto max-w-6xl pb-24 sm:pb-10">{children}</main>
      <MobileTabBar />
    </div>
  )
}
