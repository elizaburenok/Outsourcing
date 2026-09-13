import { useNavigate } from 'react-router-dom'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import AccountingView from '@/features/accounting/AccountingView'
import { useScenario } from '@/state/ScenarioProvider'
import { CASE2 } from '@/data/case2'
import { CASE3 } from '@/data/case3'
import { ROUTES } from '@/routes'

/**
 * Раздел «Бухучёт» — все выполненные платежи по налогам и взносам (доходы и расходы
 * по обязательствам). Переход сюда — плиткой «Бухучёт» на Главной. Набор данных берём
 * из активного кейса (октябрь / декабрь).
 */
export default function AccountingPage() {
  const navigate = useNavigate()
  const { scenario } = useScenario()
  const data = scenario === 'case3' ? CASE3 : CASE2

  return (
    <PageShell
      background="primary"
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          hasRootLink
          rootLinkText="Онлайн-бухгалтерия"
          onRootLinkClick={() => navigate(ROUTES.home)}
          title="Бухучёт"
          subtitle="Доходы и расходы"
          onBackClick={() => navigate(ROUTES.home)}
        />
      }
    >
      <AccountingView data={data} />
    </PageShell>
  )
}
