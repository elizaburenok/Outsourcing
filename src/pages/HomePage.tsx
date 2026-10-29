import { useEffect, useState } from 'react'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HomeCardsView from '@/features/home/HomeCardsView'
import TotalDueWidget from '@/features/home/TotalDueWidget'
import Case2View from '@/features/case2/Case2View'
import { useCase2TotalDue } from '@/features/case2/useCase2TotalDue'
import { useScenario } from '@/state/ScenarioProvider'
import { caseDataFor, isCaseScenario } from '@/data/paymentDemos'
import OnboardingDemo, { type OnboardingPage } from '@/features/onboarding/OnboardingDemo'
import './HomePage.css'

/**
 * Раздел «Онлайн-бухгалтерия». По умолчанию (сценарии «Есть просрочка» / «Всё хорошо») —
 * сценарий «24 августа»: ООО на УСН «Доходы» + НДС 5%, один сотрудник (директор). Главная
 * собрана на архитектуре «Пульс»: платежи сгруппированы в стабильные доменные карточки
 * (`HomeCardsView`), состояние — severity, просрочка поднимает карточку наверх.
 *
 * Демо-тумблер также отдаёт КЕЙС 2 — отдельный экран (`Case2View`, макет 210-28862) для ООО
 * на УСН «Доходы» 6% + НДС: кнопка «Создать задачу», блок «Платежи» (УСН/НДС/сотрудники) и
 * блок «Задачи». В правой колонке у Кейса 2 — виджет общей суммы к уплате (макет 892-86541).
 * Прежние экраны групп-по-состоянию (`AugustGroupsView`, `OctoberGroupsView`) остаются в
 * коде для сравнения, но не подключены к роутам.
 */
export default function HomePage() {
  const { scenario } = useScenario()
  // Кейс 2 (октябрь) и Кейс 3 (декабрь) — один и тот же экран-макет с разными наборами.
  const isOb = isCaseScenario(scenario)
  const isOnboarding = scenario === 'onboarding' || scenario === 'onboarding_vat'
  const [onboardingPage, setOnboardingPage] = useState<OnboardingPage>('home')
  useEffect(() => setOnboardingPage('home'), [scenario])
  const onboardingTitles: Record<OnboardingPage, string> = {
    'wildberries-dashboard': 'Wildberries', 'ozon-dashboard': 'Ozon', 'wildberries-reports': 'Отчёты', 'ozon-reports': 'Отчёты',
    'wildberries-details': 'Магазин на Wildberries', 'ozon-details': 'Магазин на Ozon', home: 'Онлайн-бухгалтерия', signature: 'Доверенность', sfr: 'Доверенность', marketplaces: 'Маркетплейсы', wildberries: 'Подключение Wildberries', ozon: 'Подключение Ozon', banks: 'Интеграции', 'bank-connect': 'Подключение интеграции', vat: 'Настройка НДС',
  }
  const caseData = caseDataFor(scenario)
  const totalDue = useCase2TotalDue(caseData)

  return (
    <PageShell
      background={isOnboarding && (onboardingPage === 'marketplaces' || onboardingPage === 'signature' || onboardingPage === 'sfr' || onboardingPage === 'banks' || onboardingPage === 'bank-connect' || onboardingPage.endsWith('-reports') || onboardingPage.endsWith('-details')) ? 'primary' : undefined}
      aside={
        <NavigationBar
          className={isOnboarding && onboardingPage !== 'home' ? 'onboarding-navigation' : undefined}
          hasBackButton
          hasTextBlock
          title={isOnboarding ? onboardingTitles[onboardingPage] : 'Онлайн-бухгалтерия'}
          subtitle={isOnboarding ? (onboardingPage.endsWith('-reports') ? (onboardingPage.startsWith('ozon') ? 'Ozon' : 'Wildberries') : onboardingPage === 'home' ? (scenario === 'onboarding_vat' ? 'ООО · УСН «Доходы» 6% + НДС 5%' : 'ООО · УСН «Доходы» 6%') : onboardingPage === 'signature' || onboardingPage === 'sfr' ? 'На АО «Точка»' : undefined) : caseData.taxpayer === 'ip' ? 'ИП · УСН «Доходы» 6% + НДС 5%' : isOb ? 'ООО · УСН «Доходы» 6% + НДС 5%' : 'УСН «Доходы» + НДС 5%'}
          hasRootLink={isOnboarding && onboardingPage !== 'home'}
          rootLinkText="Онлайн-бухгалтерия"
          onRootLinkClick={() => setOnboardingPage('home')}
          onBackClick={() => setOnboardingPage(onboardingPage.endsWith('-details') || onboardingPage.endsWith('-reports') ? (onboardingPage.startsWith('ozon') ? 'ozon-dashboard' : 'wildberries-dashboard') : onboardingPage === 'wildberries' || onboardingPage === 'ozon' || onboardingPage.endsWith('-dashboard') ? 'marketplaces' : onboardingPage === 'bank-connect' ? 'banks' : 'home')}
        />
      }
      rightRail={isOb && !isOnboarding && totalDue ? <TotalDueWidget content={totalDue} /> : undefined}
    >
      {isOnboarding ? <OnboardingDemo key={scenario} withVat={scenario === 'onboarding_vat'} page={onboardingPage} onPageChange={setOnboardingPage} /> : isOb ? <Case2View key={scenario} data={caseData} /> : <HomeCardsView />}
    </PageShell>
  )
}
