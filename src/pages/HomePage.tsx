import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HomeCardsView from '@/features/home/HomeCardsView'
import Case2View from '@/features/case2/Case2View'
import { useScenario } from '@/state/ScenarioProvider'

/**
 * Раздел «Онлайн-бухгалтерия». По умолчанию (сценарии «Есть просрочка» / «Всё хорошо») —
 * сценарий «24 августа»: ООО на УСН «Доходы» + НДС 5%, один сотрудник (директор). Главная
 * собрана на архитектуре «Пульс»: платежи сгруппированы в стабильные доменные карточки
 * (`HomeCardsView`), состояние — severity, просрочка поднимает карточку наверх.
 *
 * Демо-тумблер также отдаёт КЕЙС 2 — альтернативный экран «Блоки» (`Case2View`) для ООО на
 * УСН «Доходы» 6% без НДС: виджет с вкладками «К уплате / Выполнено» + сетка карточек.
 * Прежние экраны групп-по-состоянию (`AugustGroupsView`, `OctoberGroupsView`) остаются в
 * коде для сравнения, но не подключены к роутам.
 */
export default function HomePage() {
  const { scenario } = useScenario()
  const isCase2 = scenario === 'case2'

  return (
    <PageShell
      background="primary"
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle={isCase2 ? 'УСН «Доходы» — 6%' : 'УСН «Доходы» + НДС 5%'}
        />
      }
    >
      {isCase2 ? <Case2View /> : <HomeCardsView />}
    </PageShell>
  )
}
