import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import HomeCardsView from '@/features/home/HomeCardsView'

/**
 * Раздел «Онлайн-бухгалтерия» — сценарий «24 августа»: ООО на УСН «Доходы» + НДС 5%
 * (доход прошлого года превысил порог освобождения от НДС), один сотрудник (директор).
 *
 * Главная собрана на архитектуре соседнего прототипа «Пульс»: платежи сгруппированы в
 * стабильные доменные карточки (Налоги, Сотрудники) через `HomeCardsView`; состояние —
 * severity, просрочка поднимает карточку наверх. Прежний экран групп-по-состоянию
 * (`AugustGroupsView`) и октябрьский сценарий (`OctoberGroupsView`) остаются в коде для
 * сравнения/отката, но не подключены к роутам.
 */
export default function HomePage() {
  return (
    <PageShell
      background="primary"
      aside={
        <NavigationBar
          hasBackButton
          hasTextBlock
          title="Онлайн-бухгалтерия"
          subtitle="УСН «Доходы» + НДС 5%"
        />
      }
    >
      <HomeCardsView />
    </PageShell>
  )
}
