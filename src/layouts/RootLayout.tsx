import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EcosystemHeader from '@/components/EcosystemHeader/EcosystemHeader'
import { PaymentsProvider } from '@/state/PaymentsProvider'
import './RootLayout.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function RootLayout() {
  return (
    <PaymentsProvider>
      <div className="app">
        <ScrollToTop />
        {/* Экосистемная шапка Точки — данность платформы, не наша навигация */}
        <EcosystemHeader />
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </PaymentsProvider>
  )
}
