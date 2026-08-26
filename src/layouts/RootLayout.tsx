import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MainPageNavigationBar } from '@ds/components/MainPageNavigationBar'
import { ROUTES } from '@/routes'
import { PaymentsProvider } from '@/state/PaymentsProvider'
import { ScenarioProvider } from '@/state/ScenarioProvider'
import { OnboardingProvider } from '@/state/OnboardingProvider'
import ScenarioSwitch from '@/features/devtools/ScenarioSwitch'
// import OnboardingLayer from '@/features/onboarding/OnboardingLayer' // временно скрыт, см. ниже
import './RootLayout.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function RootLayout() {
  const navigate = useNavigate()

  return (
    <PaymentsProvider>
      <ScenarioProvider>
        <OnboardingProvider>
          <div className="app">
            <ScrollToTop />
            {/* Экосистемная шапка Точки — данность платформы, не наша навигация */}
            <MainPageNavigationBar
              navItems={[
                { id: 'home', label: 'Главная', active: true, onClick: () => navigate(ROUTES.home) },
                { id: 'payments', label: 'Платежи' },
                { id: 'services', label: 'Сервисы' },
              ]}
              userName="Носковец П.А., ООО"
              avatarInitials="ПН"
              hasNotification
            />
            <main className="app__main">
              <Outlet />
            </main>
            {/* Онбординг временно скрыт из прототипа — не проверяем на тесте, вернём позже.
                <OnboardingLayer /> */}
            {/* Служебный тумблер сценариев прототипа (не элемент продукта) */}
            <ScenarioSwitch />
          </div>
        </OnboardingProvider>
      </ScenarioProvider>
    </PaymentsProvider>
  )
}
