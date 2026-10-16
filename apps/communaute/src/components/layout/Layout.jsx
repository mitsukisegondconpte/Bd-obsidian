import Navbar from './Navbar'
import MobileTabBar from './MobileTabBar'
import Footer from './Footer'
import PlatformStatusBanner from './PlatformStatusBanner'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0 pb-24 sm:pb-0">
      <Navbar />
      <PlatformStatusBanner />
      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
