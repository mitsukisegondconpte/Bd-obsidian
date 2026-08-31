import Navbar from './Navbar'
import MobileTabBar from './MobileTabBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      <main className="mx-auto max-w-6xl pb-20 sm:pb-10">{children}</main>
      <MobileTabBar />
    </div>
  )
}
