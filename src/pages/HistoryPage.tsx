import { useNavigate } from 'react-router-dom'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HistoryView from '@/features/history/HistoryView'
import { ROUTES } from '@/routes'

/**
 * История платежей — все операции за прошлые (закрытые) месяцы.
 * Переход сюда — из вкладки «Готово» и плитки «Операции» на Главной.
 */
export default function HistoryPage() {
  const navigate = useNavigate()
  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="История платежей"
          subtitle="Все операции за прошлые месяцы"
          onBackClick={() => navigate(ROUTES.home)}
        />
      }
    >
      <HistoryView />
    </PageShell>
  )
}
