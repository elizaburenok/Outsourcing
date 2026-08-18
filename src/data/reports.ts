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

/** Лого-иконка предмета отчёта (из DS `src/logo`) — какой документ/работа за строкой. */
export type ReportLogoKind = 'declaration' | 'tax-document' | 'tax-reports' | 'document' | 'mail' | 'report'

export interface Report {
  id: string
  /** Название отчёта/предмет («Декларация по УСН за 9 месяцев»). */
  title: string
  /** Пояснение статуса: срок сдачи, зачем нужно, дата отправки. */
  note?: string
  status: ReportStatus
  logo: ReportLogoKind
  /** Подпись действия для статуса «ждём ответа» («Подписать», «Подтвердить»). */
  action?: string
}

export const REPORTS: Report[] = [
  {
    id: 'mchd',
    title: 'Машиночитаемая доверенность (МЧД)',
    note: 'Без неё бухгалтер не сдаст отчёты',
    status: 'waiting',
    logo: 'tax-document',
    action: 'Подписать',
  },
  {
    id: 'usn-income-9m',
    title: 'Доходы за 9 месяцев',
    note: 'Проверьте суммы — по ним посчитаем налог по УСН',
    status: 'waiting',
    logo: 'report',
    action: 'Подтвердить',
  },
  {
    id: 'salary-recon-sep',
    title: 'Сверка зарплаты за сентябрь',
    note: 'Нужно для 6-НДФЛ и РСВ',
    status: 'waiting',
    logo: 'tax-reports',
    action: 'Проверить',
  },
  {
    id: 'usn-decl-9m',
    title: 'Декларация по УСН за 9 месяцев',
    note: 'Готовим · сдать до 25 октября',
    status: 'preparing',
    logo: 'declaration',
  },
  {
    id: 'ndfl-rsv-9m',
    title: '6-НДФЛ и РСВ за 9 месяцев',
    note: 'Готовим · сдать до 27 октября',
    status: 'preparing',
    logo: 'document',
  },
  {
    id: 'perso-sep',
    title: 'Персонифицированные сведения за сентябрь',
    note: 'Сдано 15 октября',
    status: 'submitted',
    logo: 'document',
  },
  {
    id: 'enp-notice-sep',
    title: 'Уведомление по ЕНП за сентябрь',
    note: 'Сдано 25 сентября',
    status: 'submitted',
    logo: 'mail',
  },
]

/** Сколько отчётов ждут ответа клиента — число для бейджа на карточке. */
export function countWaiting(reports: Report[] = REPORTS): number {
  return reports.filter((r) => r.status === 'waiting').length
}

/** Отчёты с выбранным статусом (в исходном порядке) — под таб страницы отчётности. */
export function filterReports(reports: Report[], status: ReportStatus): Report[] {
  return reports.filter((r) => r.status === status)
}
