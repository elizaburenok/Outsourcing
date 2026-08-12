import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import OctoberView from '@/features/october/OctoberView'

/**
 * Раздел «Онлайн-бухгалтерия» — сценарий «Уплата налогов, 10 октября».
 * Квартал закрыт (30 сентября) → аванс по УСН за 9 месяцев посчитан и стоит твёрдой
 * суммой к уплате (до 28 октября). Единый список платежей, вкладки «К уплате / Готово».
 * Августовский сценарий (середина квартала) остаётся в @/features/august для сравнения.
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
      <OctoberView />
    </PageShell>
  )
}
