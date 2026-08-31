import Navbar from './Navbar'
import MobileTabBar from './MobileTabBar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
