import { usePayments } from '@/state/PaymentsProvider'
import { totalDueContent, type TotalDueContent } from '@/features/home/domain'
import { CASE2_USN, CASE2_NDS, CASE2_EMPLOYEES } from '@/data/case2'

/**
 * Общая сумма к уплате для виджета правой колонки Кейса 2 (макет 892-86541) — те же
 * открытые платежи, что видит `Case2View` в блоке «Платежи» (УСН «в расчёте» + НДС +
 * сотрудники за вычетом уже оплаченных), просто просуммированные через `totalDueContent`
 * вместо разбивки по группам.
 */
export function useCase2TotalDue(): TotalDueContent | null {
  const { isPaid } = usePayments()
  return totalDueContent({
    usn: [CASE2_USN].filter((p) => !isPaid(p.id)),
    nds: CASE2_NDS.filter((p) => !isPaid(p.id)),
    employees: CASE2_EMPLOYEES.filter((p) => !isPaid(p.id)),
  })
}
