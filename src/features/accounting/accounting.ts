/**
 * Доменный слой раздела «Бухучёт» — все выполненные платежи по налогам и взносам.
 * Собирает завершённые операции: сначала оплаченные в текущем периоде (изначально или
 * в этой сессии — их помечаем «Оплачено сегодня»), затем закрытые прошлые месяцы из
 * `HISTORY`. Данные берём как есть из активного кейса и истории — новых моков не заводим.
 */

import { HISTORY } from '@/data/history'
import type { AugustPayment } from '@/data/august'
import type { ObCaseData } from '@/data/case2'

/** Секция завершённых платежей с заголовком-периодом (текущий месяц или месяц истории). */
export interface CompletedSection {
  id: string
  label: string
  payments: AugustPayment[]
}

type IsPaid = (id: string) => boolean

/**
 * Завершённые платежи по периодам: оплаченные в текущем периоде + история прошлых
 * месяцев. Пустые секции не попадают в результат.
 */
export function completedSections(data: ObCaseData, isPaid: IsPaid): CompletedSection[] {
  const sections: CompletedSection[] = []

  const current = data.payables
    .filter((p) => p.state === 'paid' || isPaid(p.id))
    .map((p): AugustPayment =>
      p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' },
    )
  if (current.length > 0) {
    sections.push({ id: 'current', label: data.historyLabel, payments: current })
  }

  for (const m of HISTORY) {
    if (m.payments.length > 0) sections.push({ id: m.id, label: m.label, payments: m.payments })
  }

  return sections
}
