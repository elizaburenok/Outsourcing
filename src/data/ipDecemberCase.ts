import type { AugustPayment } from './august'
import type { ObCaseData } from './case2'

/**
 * ИП на УСН «Доходы» с НДС и сотрудниками, 5 декабря 2026 года.
 * Имущественные налоги за 2025 год указаны для объектов, по которым у ИП нет
 * освобождения на УСН. Суммы, кроме фиксированных взносов, условные.
 */
const taxes: AugustPayment[] = [
  { id: 'ip-dec-property-2025', title: 'Налог на имущество за 2025 год', category: 'property', amount: 12000, viaEnp: true, state: 'overdue', dueLabel: '1 декабря' },
  { id: 'ip-dec-transport-2025', title: 'Транспортный налог за 2025 год', category: 'transport', amount: 4500, viaEnp: true, state: 'overdue', dueLabel: '1 декабря' },
  { id: 'ip-dec-fixed-2026', title: 'Фиксированные взносы ИП за 2026 год', category: 'ipfixed', amount: 57390, viaEnp: true, state: 'due', dueLabel: '28 декабря' },
]

const nds: AugustPayment[] = [
  { id: 'ip-dec-nds-q3-3', title: 'НДС: 3-й платёж за III квартал', category: 'nds', amount: 12000, viaEnp: true, state: 'due', dueLabel: '28 декабря' },
]

const employees: AugustPayment[] = [
  { id: 'ip-dec-salary-nov', title: 'Зарплата за ноябрь', category: 'salary', amount: 42000, viaEnp: true, state: 'due', dueLabel: '10 декабря' },
  { id: 'ip-dec-ndfl-dec', title: 'НДФЛ за сотрудников с 23 ноября по 22 декабря', category: 'ndfl', amount: 9100, viaEnp: true, state: 'due', dueLabel: '28 декабря' },
  { id: 'ip-dec-vznos-nov', title: 'Страховые взносы сотрудников за ноябрь', category: 'vznos', amount: 19500, viaEnp: true, state: 'due', dueLabel: '28 декабря' },
]

export const IP_DECEMBER_CASE: ObCaseData = {
  taxpayer: 'ip',
  taxes,
  nds,
  employees,
  payables: [...taxes, ...nds, ...employees],
  historyLabel: 'Декабрь',
}
