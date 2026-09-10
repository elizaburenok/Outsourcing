import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HomeCardsView from '@/features/home/HomeCardsView'
import TotalDueWidget from '@/features/home/TotalDueWidget'
import Case2View from '@/features/case2/Case2View'
import { useCase2TotalDue } from '@/features/case2/useCase2TotalDue'
import { useScenario } from '@/state/ScenarioProvider'

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
  const isCase2 = scenario === 'case2'
  const case2TotalDue = useCase2TotalDue()

  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle={isCase2 ? 'УСН «Доходы» — 6%' : 'УСН «Доходы» + НДС 5%'}
        />
      }
      rightRail={isCase2 && case2TotalDue ? <TotalDueWidget content={case2TotalDue} /> : undefined}
    >
      {isCase2 ? <Case2View /> : <HomeCardsView />}
    </PageShell>
  )
}
