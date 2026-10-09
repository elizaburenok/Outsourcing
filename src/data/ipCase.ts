import type { AugustPayment } from './august'
import type { ObCaseData } from './case2'

/**
 * ИП на УСН «Доходы» с НДС и сотрудниками, начало октября 2026 года.
 * Суммы условные. В налогах одновременно есть долг и готовые к уплате платежи.
 */
const taxes: AugustPayment[] = [
  { id: 'ip-extra-2025', title: 'Дополнительный взнос ИП 1% за 2025 год', category: 'ipextra', amount: 297000, viaEnp: true, state: 'overdue', dueLabel: '1 июля' },
  { id: 'ip-usn-h1-2026', title: 'Аванс по УСН за полугодие 2026 года', category: 'usn', amount: 38000, viaEnp: true, state: 'overdue', dueLabel: '28 июля' },
  { id: 'ip-usn-q3-2026', title: 'Аванс по УСН за 9 месяцев 2026 года', category: 'usn', amount: 44500, viaEnp: true, state: 'due', dueLabel: '28 октября' },
]

const nds: AugustPayment[] = [
  { id: 'ip-nds-q3-1', title: 'НДС: 1-й платёж за III квартал', category: 'nds', amount: 12000, viaEnp: true, state: 'due', dueLabel: '28 октября' },
]

const employees: AugustPayment[] = [
  { id: 'ip-salary-sep', title: 'Зарплата за сентябрь', category: 'salary', amount: 42000, viaEnp: true, state: 'due', dueLabel: '10 октября' },
  { id: 'ip-ndfl-oct', title: 'НДФЛ за сотрудников с 1 по 22 октября', category: 'ndfl', amount: 9100, viaEnp: true, state: 'due', dueLabel: '28 октября' },
  { id: 'ip-vznos-sep', title: 'Страховые взносы сотрудников за сентябрь', category: 'vznos', amount: 19500, viaEnp: true, state: 'due', dueLabel: '28 октября' },
]

export const IP_CASE: ObCaseData = {
  taxpayer: 'ip',
  taxes,
  nds,
  employees,
  payables: [...taxes, ...nds, ...employees],
  historyLabel: 'Октябрь',
}
