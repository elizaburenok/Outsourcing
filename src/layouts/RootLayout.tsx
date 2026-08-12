import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EcosystemHeader from '@/components/EcosystemHeader/EcosystemHeader'
import { PaymentsProvider } from '@/state/PaymentsProvider'
import { OnboardingProvider } from '@/state/OnboardingProvider'
import OnboardingLayer from '@/features/onboarding/OnboardingLayer'
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
      <OnboardingProvider>
        <div className="app">
          <ScrollToTop />
          {/* Экосистемная шапка Точки — данность платформы, не наша навигация */}
          <EcosystemHeader />
          <main className="app__main">
            <Outlet />
          </main>
          {/* Глобальный слой онбординга: входная модалка, коуч, финал, сброс. */}
          <OnboardingLayer />
        </div>
      </OnboardingProvider>
    </PaymentsProvider>
  )
}
