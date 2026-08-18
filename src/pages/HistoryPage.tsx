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
      background="primary"
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          hasRootLink
          rootLinkText="Онлайн-бухгалтерия"
          onRootLinkClick={() => navigate(ROUTES.home)}
          title="История операций"
          onBackClick={() => navigate(ROUTES.home)}
        />
      }
    >
      <HistoryView />
    </PageShell>
  )
}
