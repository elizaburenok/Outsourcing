/**
 * Отчётность — «пульт спокойствия» по отчётам и декларациям: клиент видит, что
 * бухгалтер держит сдачу под контролем, и что иногда нужно от него самого.
 * Данные идут через людей, не real-time, поэтому без тайм-стемпов «минуту назад» —
 * только суть, статус и (для «ждём ответа») действие клиента.
 *
 * Сценарий — «середина октября»: кампания отчётности за 9 месяцев / III квартал.
 */

export type ReportStatus =
  /** Ждём ответа — единственное, что требует действия клиента (подписать/подтвердить). */
  | 'waiting'
  /** Готовим — бухгалтер в работе, от клиента ничего не нужно. */
  | 'preparing'
  /** Сдано — отчёт уже отправлен. */
  | 'submitted'

export interface Report {
  id: string
  /** Название отчёта/предмет («Декларация по УСН за 9 месяцев»). */
  title: string
  /** Пояснение статуса: срок сдачи, зачем нужно, дата отправки. */
  note?: string
  status: ReportStatus
  /** Подпись действия для статуса «ждём ответа» («Подписать», «Подтвердить»). */
  action?: string
}

/** Фильтр страницы отчётности. */
export type ReportFilter = 'all' | 'waiting'

export const REPORTS: Report[] = [
  {
    id: 'mchd',
    title: 'Машиночитаемая доверенность (МЧД)',
    note: 'Без неё бухгалтер не сдаст отчёты',
    status: 'waiting',
    action: 'Подписать',
  },
  {
    id: 'usn-income-9m',
    title: 'Доходы за 9 месяцев',
    note: 'Проверьте суммы — по ним посчитаем налог по УСН',
    status: 'waiting',
    action: 'Подтвердить',
  },
  {
    id: 'salary-recon-sep',
    title: 'Сверка зарплаты за сентябрь',
    note: 'Нужно для 6-НДФЛ и РСВ',
    status: 'waiting',
    action: 'Проверить',
  },
  {
    id: 'usn-decl-9m',
    title: 'Декларация по УСН за 9 месяцев',
    note: 'Готовим · сдать до 25 октября',
    status: 'preparing',
  },
  {
    id: 'ndfl-rsv-9m',
    title: '6-НДФЛ и РСВ за 9 месяцев',
    note: 'Готовим · сдать до 27 октября',
    status: 'preparing',
  },
  {
    id: 'perso-sep',
    title: 'Персонифицированные сведения за сентябрь',
    note: 'Сдано 15 октября',
    status: 'submitted',
  },
  {
    id: 'enp-notice-sep',
    title: 'Уведомление по ЕНП за сентябрь',
    note: 'Сдано 25 сентября',
    status: 'submitted',
  },
]

/** Порядок групп на странице «Все». */
export const REPORT_GROUPS: { status: ReportStatus; label: string }[] = [
  { status: 'waiting', label: 'Ждём вашего ответа' },
  { status: 'preparing', label: 'Готовим' },
  { status: 'submitted', label: 'Сдано' },
]

/** Сколько отчётов ждут ответа клиента — число для бейджа на карточке. */
export function countWaiting(reports: Report[] = REPORTS): number {
  return reports.filter((r) => r.status === 'waiting').length
}

/** Отчёты под выбранный фильтр (в исходном порядке). */
export function filterReports(reports: Report[], filter: ReportFilter): Report[] {
  return filter === 'waiting' ? reports.filter((r) => r.status === 'waiting') : reports
}

/** «1 отчёт / 2 отчёта / 5 отчётов» */
export function pluralReports(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'отчётов'
  if (mod10 === 1 && mod100 !== 11) word = 'отчёт'
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'отчёта'
  return `${n} ${word}`
}

/** «ждёт / ждут» по числу отчётов, требующих ответа. */
export function pluralWaiting(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  const verb = mod10 === 1 && mod100 !== 11 ? 'ждёт' : 'ждут'
  return `${pluralReports(n)} ${verb} вашего ответа`
}
