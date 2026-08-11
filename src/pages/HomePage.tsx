import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import AugustView from '@/features/august/AugustView'

/**
 * Раздел «Онлайн-бухгалтерия» — сценарий «Уплата налогов в августе» по драфту.
 * Единый список платежей (без разбивки по месяцам), вкладки «К уплате / Готово».
 * Правило: показываем только твёрдые суммы к уплате, без прогнозов.
 */
export default function HomePage() {
  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle="УСН «Доходы» — 6%"
        />
      }
    >
      <AugustView />
    </PageShell>
  )
}
