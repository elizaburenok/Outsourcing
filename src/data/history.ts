/**
 * История платежей — все операции за прошлые месяцы (закрытые периоды).
 * Сюда попадают полностью завершённые месяцы: до текущего рабочего цикла (июль→август).
 * Самый свежий месяц — сверху. Внутри месяца операции идут в порядке уплаты.
 * Все суммы номинальные, для показа; масштаб согласован с august.ts.
 */

import type { AugustPayment } from './august'

export type HistoryMonth = {
  id: string
  /** Заголовок группы, напр. «Июнь 2026». */
  label: string
  /** Уплачено за месяц — сумма всех операций группы. */
  total: number
  payments: AugustPayment[]
}

/** Собирает месяц: считает сумму по операциям, чтобы не держать её вручную. */
function month(id: string, label: string, payments: AugustPayment[]): HistoryMonth {
  return { id, label, total: payments.reduce((s, p) => s + p.amount, 0), payments }
}

export const HISTORY: HistoryMonth[] = [
  month('2026-06', 'Июнь', [
    { id: 'h-nds-q1-3', title: '3-й платёж за I квартал', category: 'nds', amount: 30000, viaEnp: true, state: 'paid', paidLabel: '30 июня' },
    { id: 'h-ndfl-jun-2', title: 'НДФЛ с зарплаты за 23–31 мая', category: 'ndfl', amount: 3900, viaEnp: true, state: 'paid', paidLabel: '5 июня' },
    { id: 'h-salary-may', title: 'Зарплата директору за май', category: 'salary', amount: 53783, viaEnp: true, state: 'paid', paidLabel: '5 июня' },
    { id: 'h-travma-may', title: 'Взносы на травматизм за май', category: 'travma', amount: 200, viaEnp: false, state: 'paid', paidLabel: '16 июня' },
    { id: 'h-vznos-may', title: 'Страховые взносы за май', category: 'vznos', amount: 19500, viaEnp: true, state: 'paid', paidLabel: '30 июня' },
    { id: 'h-ndfl-jun-1', title: 'НДФЛ с зарплаты за 1–22 июня', category: 'ndfl', amount: 8400, viaEnp: true, state: 'paid', paidLabel: '30 июня' },
  ]),
  month('2026-05', 'Май', [
    { id: 'h-nds-q1-2', title: '2-й платёж за I квартал', category: 'nds', amount: 30000, viaEnp: true, state: 'paid', paidLabel: '28 мая' },
    { id: 'h-ndfl-may-2', title: 'НДФЛ с зарплаты за 23–30 апреля', category: 'ndfl', amount: 3900, viaEnp: true, state: 'paid', paidLabel: '5 мая' },
    { id: 'h-salary-apr', title: 'Зарплата директору за апрель', category: 'salary', amount: 53783, viaEnp: true, state: 'paid', paidLabel: '5 мая' },
    { id: 'h-travma-apr', title: 'Взносы на травматизм за апрель', category: 'travma', amount: 200, viaEnp: false, state: 'paid', paidLabel: '15 мая' },
    { id: 'h-vznos-apr', title: 'Страховые взносы за апрель', category: 'vznos', amount: 19500, viaEnp: true, state: 'paid', paidLabel: '28 мая' },
    { id: 'h-ndfl-may-1', title: 'НДФЛ с зарплаты за 1–22 мая', category: 'ndfl', amount: 8400, viaEnp: true, state: 'paid', paidLabel: '28 мая' },
  ]),
  month('2026-04', 'Апрель', [
    { id: 'h-nds-q1-1', title: '1-й платёж за I квартал', category: 'nds', amount: 30000, viaEnp: true, state: 'paid', paidLabel: '28 апреля' },
    { id: 'h-usn-q1', title: 'Аванс по УСН за I квартал', category: 'usn', amount: 46700, viaEnp: true, state: 'paid', paidLabel: '28 апреля' },
    { id: 'h-salary-mar', title: 'Зарплата директору за март', category: 'salary', amount: 53783, viaEnp: true, state: 'paid', paidLabel: '5 апреля' },
    { id: 'h-travma-mar', title: 'Взносы на травматизм за март', category: 'travma', amount: 200, viaEnp: false, state: 'paid', paidLabel: '15 апреля' },
    { id: 'h-vznos-mar', title: 'Страховые взносы за март', category: 'vznos', amount: 19500, viaEnp: true, state: 'paid', paidLabel: '28 апреля' },
  ]),
]

/** Итог по всей истории — для подписи «переход к истории». */
export function historyTotal(months: HistoryMonth[]): number {
  return months.reduce((s, m) => s + m.total, 0)
}

/** Кол-во операций во всей истории. */
export function historyCount(months: HistoryMonth[]): number {
  return months.reduce((s, m) => s + m.payments.length, 0)
}
