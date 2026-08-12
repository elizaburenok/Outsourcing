import { useNavigate } from 'react-router-dom'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import ReportsView from '@/features/reports/ReportsView'
import { ROUTES } from '@/routes'

/**
 * Отчётность — отдельная страница: отчёты и декларации под контролем бухгалтера,
 * с фильтром «Все / Ждём ответа» (действия клиента). Переход сюда — с карточки-раздела
 * «Отчётность» на Главной.
 */
export default function ReportsPage() {
  const navigate = useNavigate()
  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Отчётность"
          subtitle="Под контролем у бухгалтера"
          onBackClick={() => navigate(ROUTES.home)}
        />
      }
    >
      <ReportsView />
    </PageShell>
  )
}
