import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import OctoberGroupsView from '@/features/october/OctoberGroupsView'

/**
 * Раздел «Онлайн-бухгалтерия» — сценарий «середина октября». Налоги к уплате свёрнуты в
 * три группы (просрочено / УСН / сотрудники): один налог в группе → сразу уплата, несколько →
 * дровер. Зарплатные налоги посчитаны, налог по УСН за III квартал ещё считается.
 * Августовский сценарий (`AugustView`, середина квартала) остаётся в коде для сравнения,
 * но не подключён к роутам.
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
      <OctoberGroupsView />
    </PageShell>
  )
}
