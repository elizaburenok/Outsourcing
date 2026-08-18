import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import AugustGroupsView from '@/features/august/AugustGroupsView'

/**
 * Раздел «Онлайн-бухгалтерия» — сценарий «20 августа»: ООО на УСН «Доходы» + НДС 5%
 * (доход прошлого года превысил порог освобождения от НДС), один сотрудник (директор).
 * Налоги к уплате свёрнуты в группы (просрочено / НДС / сотрудники): один налог в группе →
 * сразу уплата, несколько → дровер. Два налога просрочены к этой дате — 1-й платёж НДС
 * за II квартал (срок 28 июля) и взносы на травматизм за июль (срок 15 августа).
 * Октябрьский сценарий (`OctoberGroupsView`, «10 октября», УСН без НДС) остаётся в коде
 * для сравнения, но не подключён к роутам.
 */
export default function HomePage() {
  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle="УСН «Доходы» + НДС 5%"
        />
      }
    >
      <AugustGroupsView />
    </PageShell>
  )
}
