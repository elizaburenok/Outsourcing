import { usePayments } from '@/state/PaymentsProvider'
import { totalDueContent, type TotalDueContent } from '@/features/home/domain'
import { CASE2, type ObCaseData } from '@/data/case2'
import type { AugustPayment } from '@/data/august'

/**
 * Общая сумма к уплате для виджета правой колонки (макет 892-86541 / 1178-16236) — те же
 * открытые платежи, что видит `Case2View` в блоке «Платежи» (налоги и взносы + НДС +
 * сотрудники за вычетом уже оплаченных), просуммированные через `totalDueContent`. Доли
 * «по графику» (`process`, платить рано) в сумму «нужно сейчас» не берём — только то, что
 * уже пора платить. Работает с любым кейсом (октябрь, декабрь…) через `ObCaseData`.
 *
 * Подпись виджета зависит от готовности расчёта по доменам:
 *  - расчёт по УСН ещё идёт (только `process`, твёрдой суммы нет) — «расчёт налога по УСН
 *    в работе»;
 *  - расчёт по сотрудникам ещё идёт (предстоит только будущий платёж) — «расчёт по
 *    платежам за сотрудников в работе»;
 *  - по НДС и сотрудникам всё посчитано — «Сумма на налоги и взносы по платежам».
 * УСН приоритетнее сотрудников, если «в работе» и то и другое.
 */
export function useCase2TotalDue(data: ObCaseData = CASE2): TotalDueContent | null {
  const { isPaid } = usePayments()
  const open = (p: AugustPayment) => !isPaid(p.id) && p.state !== 'process'
  const content = totalDueContent({
    usn: data.taxes.filter(open),
    nds: data.nds.filter(open),
    employees: data.employees.filter(open),
  })
  if (!content) return null

  // Домен «в работе»: среди неоплаченных платежей есть только «в расчёте»/предстоящие
  // (`process`) и ни одного твёрдого — сумму по домену назвать ещё нельзя. Для УСН
  // учитываем и следующий предварительный расчёт (`taxesUpcoming`), который встаёт на
  // место уплаченного текущего.
  const inWork = (list: AugustPayment[]) => {
    const active = list.filter((p) => !isPaid(p.id))
    return active.length > 0 && active.every((p) => p.state === 'process')
  }
  const usnItems = data.taxesUpcoming ? [...data.taxes, data.taxesUpcoming] : data.taxes

  let subtitle = 'Сумма на налоги и взносы по платежам'
  if (inWork(usnItems)) {
    subtitle = 'Сумма примерная — расчёт налога по УСН в работе'
  } else if (inWork(data.employees)) {
    subtitle = 'Сумма примерная — расчёт по платежам за сотрудников в работе'
  }

  return { ...content, subtitle }
}
