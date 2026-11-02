import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MainPageNavigationBar } from '@ds/components/MainPageNavigationBar'
import { isCaseScenario } from '@/data/paymentDemos'
import { ROUTES } from '@/routes'
import { PaymentsProvider } from '@/state/PaymentsProvider'
import { ScenarioProvider, useScenario } from '@/state/ScenarioProvider'
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

/**
 * Экосистемная шапка Точки (данность платформы, не наша навигация). Все клиенты — ООО;
 * владелец счёта различается по сценарию именем (см. `scenarios.ts`).
 */
function EcosystemHeader({ onHome }: { onHome: () => void }) {
  const { scenario } = useScenario()
  const isCase2 = isCaseScenario(scenario) || scenario === 'onboarding' || scenario === 'onboarding_vat'
  return (
    <MainPageNavigationBar
      navItems={[
        { id: 'home', label: 'Главная', active: true, onClick: onHome },
        { id: 'payments', label: 'Платежи' },
        { id: 'services', label: 'Сервисы' },
      ]}
      userName={(scenario === 'ip' || scenario === 'ip_december') ? 'Носковец О.Н., ИП' : isCase2 ? 'Носковец О.Н., ООО' : 'Носковец П.А., ООО'}
      avatarInitials={isCase2 ? 'НО' : 'ПН'}
      hasNotification
    />
  )
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
            <EcosystemHeader onHome={() => navigate(ROUTES.home)} />
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
