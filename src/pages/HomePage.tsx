import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HomeCardsView from '@/features/home/HomeCardsView'
import TotalDueWidget from '@/features/home/TotalDueWidget'
import Case2View from '@/features/case2/Case2View'
import { useCase2TotalDue } from '@/features/case2/useCase2TotalDue'
import { useScenario } from '@/state/ScenarioProvider'
import { CASE2 } from '@/data/case2'
import { CASE3 } from '@/data/case3'

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
  // Кейс 2 (октябрь) и Кейс 3 (декабрь) — один и тот же экран-макет с разными наборами.
  const isOb = scenario === 'case2' || scenario === 'case3'
  const caseData = scenario === 'case3' ? CASE3 : CASE2
  const totalDue = useCase2TotalDue(caseData)

  return (
    <PageShell
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle={isOb ? 'ООО · УСН «Доходы» 6% + НДС 5%' : 'УСН «Доходы» + НДС 5%'}
        />
      }
      rightRail={isOb && totalDue ? <TotalDueWidget content={totalDue} /> : undefined}
    >
      {isOb ? <Case2View data={caseData} /> : <HomeCardsView />}
    </PageShell>
  )
}
