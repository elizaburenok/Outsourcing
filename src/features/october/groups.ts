/**
 * Группировка октябрьских налогов для Главной.
 *
 * Единая точка расчёта групп и суммы шапки — чтобы цифры в шапке и внутри групп
 * не разъезжались. Данные берём как есть из `october.ts`
 * (`OCTOBER_PAYMENTS` + `octoberUsn()`); новых моков не заводим.
 *
 * Раскладка «Блоки» — по состоянию: просрочено / УСН / сотрудники
 * (каждый налог ровно в одной группе).
 */

import { OCTOBER_PAYMENTS, octoberUsn } from '@/data/october'
import { AUGUST_PAYMENTS, usnPayment, type Snapshot } from '@/data/august'
import type { AugustPayment } from '@/data/august'

export type GroupKey = 'overdue' | 'usn' | 'nds' | 'employees'

export type PayGroup = {
  key: GroupKey
  title: string
  items: AugustPayment[]
  /** Сумма по группе (для УСН в `process` не показывается). */
  total: number
  /** Есть ли что платить (false для УСН, пока сумма считается, и для «Сотрудники», когда всё уплачено). */
  payable: boolean
  /** «Сотрудники»: все платежи этой группы уплачены — блок остаётся, но со статусом «Оплачено». */
  done?: boolean
}

type IsPaid = (id: string) => boolean

const sum = (list: AugustPayment[]) => list.reduce((s, p) => s + p.amount, 0)

/** В группе и в её дровере «Сотрудники» показываем только первые платежи — не весь список. */
const EMPLOYEES_LIMIT = 3

/**
 * Группы для варианта «Блоки» (по состоянию): просрочено → УСН → сотрудники.
 * Пустые группы не возвращаем.
 */
export function octoberBlockGroups(isPaid: IsPaid): PayGroup[] {
  const overdue = OCTOBER_PAYMENTS.filter((p) => p.state === 'overdue' && !isPaid(p.id))
  const employees = OCTOBER_PAYMENTS.filter((p) => p.state === 'due' && !isPaid(p.id)).slice(
    0,
    EMPLOYEES_LIMIT,
  )
  const usn = octoberUsn()

  const groups: PayGroup[] = []
  if (overdue.length > 0)
    groups.push({
      key: 'overdue',
      title: 'Есть задолженности',
      items: overdue,
      total: sum(overdue),
      payable: true,
    })
  if (!isPaid(usn.id))
    groups.push({
      key: 'usn',
      title: 'Налог по УСН за III кв. 2026',
      items: [usn],
      total: usn.amount,
      payable: usn.state !== 'process',
    })
  if (employees.length > 0)
    groups.push({
      key: 'employees',
      title: 'Сотрудники',
      items: employees,
      total: sum(employees),
      payable: true,
    })
  return groups
}

/**
 * Сумма в шапке — все неоплаченные твёрдые платежи.
 * Налог по УСН в `process` в неё не входит (его нет в `OCTOBER_PAYMENTS`).
 */
export function octoberHeroAmount(isPaid: IsPaid): number {
  return OCTOBER_PAYMENTS.filter((p) => p.state !== 'paid' && !isPaid(p.id)).reduce(
    (s, p) => s + p.amount,
    0,
  )
}

/**
 * Группы для сценария «20 августа» (ООО на УСН «Доходы» + НДС 5%): просрочено → УСН →
 * НДС → сотрудники. Налог по УСН — отдельная строка всегда (не только когда наступил
 * срок): в середине квартала это состояние «считается» (`process`, некликабельно), после
 * закрытия квартала — твёрдая сумма к уплате. НДС на УСН платится тремя платежами (28-е
 * число трёх месяцев после квартала); 1-й платёж за II квартал просрочен (в группе
 * «Просрочено»), 2-й — в группе «НДС» вместе со сроком 28 августа. Пустые группы (кроме
 * УСН) не возвращаем.
 */
export function augustBlockGroups(isPaid: IsPaid, snapshot: Snapshot): PayGroup[] {
  const overdue = AUGUST_PAYMENTS.filter((p) => p.state === 'overdue' && !isPaid(p.id))
  const nds = AUGUST_PAYMENTS.filter(
    (p) => p.category === 'nds' && p.state === 'due' && !isPaid(p.id),
  )
  // «Сотрудники» показываем не весь список, а первые EMPLOYEES_LIMIT (ближайшие по сроку).
  // Блок переходит в статус «Всё уплачено», когда закрыты все зарплатные платежи.
  const employees = AUGUST_PAYMENTS.filter(
    (p) => p.state === 'due' && p.category !== 'nds' && !isPaid(p.id),
  ).slice(0, EMPLOYEES_LIMIT)
  const usn = usnPayment(snapshot)

  const groups: PayGroup[] = []
  if (overdue.length > 0)
    groups.push({
      key: 'overdue',
      title: 'Есть задолженности',
      items: overdue,
      total: sum(overdue),
      payable: true,
    })
  if (!isPaid(usn.id))
    groups.push({
      key: 'usn',
      title: 'Налог по УСН за III кв. 2026',
      items: [usn],
      total: usn.amount,
      payable: usn.state !== 'process',
    })
  if (nds.length > 0)
    groups.push({
      key: 'nds',
      title: 'Налог по НДС',
      items: nds,
      total: sum(nds),
      payable: true,
    })
  // «Сотрудники» — в отличие от остальных групп, не пропадает, когда всё уплачено:
  // остаётся строкой со статусом «Оплачено» (см. `GroupRow`).
  groups.push(
    employees.length > 0
      ? { key: 'employees', title: 'Сотрудники', items: employees, total: sum(employees), payable: true }
      : { key: 'employees', title: 'Сотрудники', items: [], total: 0, payable: false, done: true },
  )
  return groups
}

/** Сумма в шапке для сценария «20 августа» — все неоплаченные твёрдые платежи. */
export function augustHeroAmount(isPaid: IsPaid): number {
  return AUGUST_PAYMENTS.filter((p) => p.state !== 'paid' && !isPaid(p.id)).reduce(
    (s, p) => s + p.amount,
    0,
  )
}

/** Ближайший срок группы (первый `due`/`overdue`), напр. «15 октября». */
export function nearestDue(items: AugustPayment[]): string | undefined {
  return items.find((p) => p.dueLabel)?.dueLabel
}

/** Склонение слова «налог» по числу. */
export function pluralTaxes(n: number): string {
  const mod100 = n % 100
  const mod10 = n % 10
  let word = 'налогов'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'налог'
    else if (mod10 >= 2 && mod10 <= 4) word = 'налога'
  }
  return `${n} ${word}`
}
