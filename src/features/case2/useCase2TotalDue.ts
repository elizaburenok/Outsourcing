import { usePayments } from '@/state/PaymentsProvider'
import { totalDueContent, type TotalDueContent } from '@/features/home/domain'
import { CASE2, type ObCaseData } from '@/data/case2'

/**
 * Общая сумма к уплате для виджета правой колонки (макет 892-86541) — те же открытые
 * платежи, что видит `Case2View` в блоке «Платежи» (налоги и взносы + НДС + сотрудники
 * за вычетом уже оплаченных), просуммированные через `totalDueContent`. Доли НДС «по
 * графику» (`process`, платить рано) в сумму «нужно сейчас» не берём — только то, что
 * уже пора платить. Работает с любым кейсом (октябрь, декабрь…) через `ObCaseData`.
 */
export function useCase2TotalDue(data: ObCaseData = CASE2): TotalDueContent | null {
  const { isPaid } = usePayments()
  const open = (p: { id: string; state: string }) => !isPaid(p.id) && p.state !== 'process'
  return totalDueContent({
    usn: data.taxes.filter(open),
    nds: data.nds.filter(open),
    employees: data.employees.filter(open),
  })
}
