/**
 * Сценарий «Уплата налогов в августе» — самый полный вариант: задачи есть по каждому
 * налогу и взносу сразу. ООО на УСН «Доходы» + НДС (доход прошлого года превысил порог
 * освобождения 20 млн ₽, ставка НДС — 5% без вычета входного налога), директор —
 * единственный сотрудник, с зарплатой (аванс + окончательный расчёт).
 *
 * «Сегодня» прототипа — 24 августа: НДФЛ и взносы начала августа оплачены; травматизм
 * и зарплата за июль (срок 15 августа) просрочены на 9 дней.
 * К уплате: аванс сотруднику за август (до 25 августа), страховые взносы и НДФЛ за
 * 1–22 августа, 2-й платёж НДС за II квартал (все — до 28 августа); НДФЛ за 23–31
 * августа (до 5 сентября); окончательный расчёт по зарплате и взносы на травматизм
 * за август (до 15 сентября); страховые взносы за август (до 28 сентября). Налог по
 * УСН за 9 месяцев виден отдельной строкой всегда (см. `usnPayment` ниже) — в середине
 * квартала «в процессе», после его закрытия 30 сентября — твёрдой суммой.
 * Суммы номинальные, для показа.
 */

/** `process` — сумма ещё считается (квартал не закрыт), числа нет. */
export type PayState = 'paid' | 'due' | 'overdue' | 'process'
export type PayCategory = 'ndfl' | 'travma' | 'salary' | 'vznos' | 'usn' | 'nds'

export type AugustPayment = {
  id: string
  title: string
  category: PayCategory
  amount: number
  /** false → отдельной платёжкой в СФР, мимо ЕНП (травматизм). */
  viaEnp: boolean
  state: PayState
  /** Срок уплаты (для due/overdue), напр. «до 28 августа» / «15 августа». */
  dueLabel?: string
  /** Когда оплачено (для paid). */
  paidLabel?: string
}

export const AUGUST_PAYMENTS: AugustPayment[] = [
  {
    id: 'ndfl-jul-2',
    title: 'НДФЛ с зарплаты за 23–31 июля',
    category: 'ndfl',
    amount: 3900,
    viaEnp: true,
    state: 'paid',
    paidLabel: '5 августа',
  },
  {
    id: 'usn-adv-h1',
    title: 'Аванс по УСН за полугодие',
    category: 'usn',
    amount: 58200,
    viaEnp: true,
    state: 'paid',
    paidLabel: '28 июля',
  },
  {
    id: 'vznos-jun',
    title: 'Страховые взносы за июнь',
    category: 'vznos',
    amount: 19500,
    viaEnp: true,
    state: 'paid',
    paidLabel: '28 июля',
  },
  {
    id: 'ndfl-jul-1',
    title: 'НДФЛ с зарплаты за 1–22 июля',
    category: 'ndfl',
    amount: 8400,
    viaEnp: true,
    state: 'paid',
    paidLabel: '28 июля',
  },
  {
    id: 'travma-jun',
    title: 'Взносы на травматизм за июнь',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'paid',
    paidLabel: '15 июля',
  },
  {
    id: 'travma-jul',
    title: 'Взносы на травматизм за июль',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'overdue',
    dueLabel: '15 августа',
  },
  {
    id: 'salary-jul',
    title: 'Зарплата за июль',
    category: 'salary',
    amount: 53783,
    viaEnp: true,
    state: 'overdue',
    dueLabel: '15 августа',
  },
  {
    id: 'salary-aug-advance',
    title: 'Аванс за август',
    category: 'salary',
    amount: 20000,
    viaEnp: true,
    state: 'due',
    dueLabel: '25 августа',
  },
  {
    id: 'vznos-jul',
    title: 'Страховые взносы сотрудников за июль',
    category: 'vznos',
    amount: 19500,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 августа',
  },
  {
    id: 'ndfl-aug-1',
    title: 'НДФЛ за сотрудников с 1–22 августа',
    category: 'ndfl',
    amount: 9100,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 августа',
  },
  {
    id: 'nds-q2-2',
    title: 'НДС: 2-й платёж за II квартал',
    category: 'nds',
    amount: 32000,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 августа',
  },
  {
    id: 'ndfl-aug-2',
    title: 'НДФЛ за сотрудников с 23–31 августа',
    category: 'ndfl',
    amount: 3900,
    viaEnp: true,
    state: 'due',
    dueLabel: '5 сентября',
  },
  {
    id: 'travma-aug',
    title: 'Взносы на травматизм за август',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'due',
    dueLabel: '15 сентября',
  },
  {
    id: 'salary-aug-final',
    title: 'Зарплата за август',
    category: 'salary',
    amount: 33783,
    viaEnp: true,
    state: 'due',
    dueLabel: '15 сентября',
  },
  {
    id: 'vznos-aug',
    title: 'Страховые взносы сотрудников за август',
    category: 'vznos',
    amount: 19500,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 сентября',
  },
]

/**
 * Аванс по УСН за 9 месяцев (январь–сентябрь) — единственный квартальный платёж,
 * попадающий в горизонт августа. Срок уплаты — до 28 октября 2026 (среда, на выходной
 * не переносится). УСН «доходы» считается кассовым методом нарастающим итогом с 1 января,
 * поэтому в середине квартала (пока III квартал не закрыт 30 сентября) сумма не финальна —
 * показываем состояние «в процессе», а не выдуманный прогноз. Как только квартал закрыт —
 * появляется твёрдое число. Сумма номинальная, масштаб согласован с quarter.ts (аванс ~96–105 тыс).
 */
export const USN_ADVANCE = {
  id: 'usn-9m',
  title: 'Налог по УСН за III кв. 2026',
  category: 'usn' as PayCategory,
  amount: 104900,
  viaEnp: true,
  dueLabel: '28 октября',
} as const

/** Снимок времени: середина квартала (аванс УСН ещё считается) / квартал закрыт (посчитан). */
export type Snapshot = 'mid' | 'closed'

/** Строка аванса УСН для конкретного снимка: `process` в середине квартала, `due` — когда закрыт. */
export function usnPayment(snapshot: Snapshot): AugustPayment {
  return { ...USN_ADVANCE, state: snapshot === 'mid' ? 'process' : 'due' }
}

export type AugustSummary = {
  toPayTotal: number
  paidTotal: number
  overdueCount: number
  dueCount: number
}

export function summarizeAugust(list: AugustPayment[]): AugustSummary {
  const toPay = list.filter((p) => p.state !== 'paid')
  return {
    toPayTotal: toPay.reduce((s, p) => s + p.amount, 0),
    paidTotal: list.filter((p) => p.state === 'paid').reduce((s, p) => s + p.amount, 0),
    overdueCount: list.filter((p) => p.state === 'overdue').length,
    dueCount: list.filter((p) => p.state === 'due').length,
  }
}

export function pluralPayments(n: number): string {
  const mod100 = n % 100
  const mod10 = n % 10
  let word = 'платежей'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'платёж'
    else if (mod10 >= 2 && mod10 <= 4) word = 'платежа'
  }
  return `${n} ${word}`
}
