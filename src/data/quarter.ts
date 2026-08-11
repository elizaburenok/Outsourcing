/**
 * Демо-данные горизонта «Квартал» (не боевые).
 * Сегмент: ООО на УСН «доходы», единственный сотрудник — директор с зарплатой.
 * Источник ритма — «Налоговый календарь ООО» (§6). Суммы номинальные, для показа.
 *
 * Принцип модели (из ТЗ): каждое событие — платёж клиента ИЛИ работа бухгалтера.
 * В ленту «что от меня» попадают только платежи; отчётность/уведомления — работа
 * бухгалтера, показываем как доказательство работы, действия от клиента не требуют.
 */

/** Ось А — статусная модель уплаты. */
export type PayStatus = 'preliminary' | 'confirmed' | 'paid' | 'settled'
/** Ось Б — срочность (относительно «сегодня»). */
export type Urgency = 'future' | 'soon' | 'overdue'

/** Один платёж внутри платёжного момента (даты-срока). */
export type PaymentItem = {
  id: string
  title: string
  /** Что за период платим (кассовый/период основания). */
  basis: string
  amount: number
  /** false → отдельная платёжка в СФР, мимо ЕНП (травматизм). */
  viaEnp: boolean
}

/** Платёжный момент — всё, что клиент платит к одному сроку. */
export type PaymentMoment = {
  id: string
  day: number
  /** Короткая метка месяца для медальона даты, напр. «апр». */
  monthShort: string
  /** Полная метка срока, напр. «28 апреля». */
  dateLabel: string
  items: PaymentItem[]
  urgency: Urgency
  status: PayStatus
  /** Все платежи момента оплачены. */
  paid: boolean
}

/** Работа бухгалтера в этом месяце (лента «что делаем мы»). */
export type AccountantItem = {
  id: string
  title: string
  /** Напр. «сдаём к 25 апреля» / «уведомление отправлено». */
  note: string
  done: boolean
}

export type MonthBlock = {
  key: string
  name: string
  moments: PaymentMoment[]
  weDo: AccountantItem[]
}

export type Quarter = {
  id: string
  title: string
  rangeLabel: string
  /** «Сегодня» прототипа — для срочности и подсветки «ближайшего». */
  todayLabel: string
  months: MonthBlock[]
}

/**
 * II квартал 2026 (апрель–июнь). «Сегодня» прототипа — 22 апреля:
 * апрель почти закрыт, ближайший срок — 28 апреля, май–июнь спокойно впереди.
 */
export const QUARTER: Quarter = {
  id: 'q2-2026',
  title: 'II квартал 2026',
  rangeLabel: 'апрель – июнь',
  todayLabel: '22 апреля',
  months: [
    {
      key: 'apr',
      name: 'Апрель',
      moments: [
        {
          id: 'apr-05',
          day: 5,
          monthShort: 'апр',
          dateLabel: '5 апреля',
          urgency: 'future',
          status: 'paid',
          paid: true,
          items: [
            {
              id: 'apr-05-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 23–31 марта',
              amount: 3900,
              viaEnp: true,
            },
          ],
        },
        {
          id: 'apr-15',
          day: 15,
          monthShort: 'апр',
          dateLabel: '15 апреля',
          urgency: 'future',
          status: 'paid',
          paid: true,
          items: [
            {
              id: 'apr-15-travma',
              title: 'Взносы на травматизм',
              basis: 'за март',
              amount: 200,
              viaEnp: false,
            },
          ],
        },
        {
          id: 'apr-28',
          day: 28,
          monthShort: 'апр',
          dateLabel: '28 апреля',
          urgency: 'soon',
          status: 'confirmed',
          paid: false,
          items: [
            {
              id: 'apr-28-usn',
              title: 'Аванс по УСН',
              basis: 'за I квартал',
              amount: 96400,
              viaEnp: true,
            },
            {
              id: 'apr-28-vznos',
              title: 'Страховые взносы',
              basis: 'за март',
              amount: 19500,
              viaEnp: true,
            },
            {
              id: 'apr-28-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 1–22 апреля',
              amount: 9100,
              viaEnp: true,
            },
          ],
        },
      ],
      weDo: [
        { id: 'apr-usn-notify', title: 'Уведомление по авансу УСН', note: 'отправлено', done: true },
        { id: 'apr-rsv', title: 'РСВ за I квартал', note: 'сдаём к 25 апреля', done: false },
        { id: 'apr-6ndfl', title: '6-НДФЛ за I квартал', note: 'сдаём к 25 апреля', done: false },
        { id: 'apr-efs', title: 'ЕФС-1 (травматизм) за I квартал', note: 'сдаём к 25 апреля', done: false },
      ],
    },
    {
      key: 'may',
      name: 'Май',
      moments: [
        {
          id: 'may-05',
          day: 5,
          monthShort: 'мая',
          dateLabel: '5 мая',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'may-05-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 23–30 апреля',
              amount: 3900,
              viaEnp: true,
            },
          ],
        },
        {
          id: 'may-15',
          day: 15,
          monthShort: 'мая',
          dateLabel: '15 мая',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'may-15-travma',
              title: 'Взносы на травматизм',
              basis: 'за апрель',
              amount: 200,
              viaEnp: false,
            },
          ],
        },
        {
          id: 'may-28',
          day: 28,
          monthShort: 'мая',
          dateLabel: '28 мая',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'may-28-vznos',
              title: 'Страховые взносы',
              basis: 'за апрель',
              amount: 19500,
              viaEnp: true,
            },
            {
              id: 'may-28-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 1–22 мая',
              amount: 9100,
              viaEnp: true,
            },
          ],
        },
      ],
      weDo: [
        { id: 'may-persved', title: 'Персонифицированные сведения за апрель', note: 'сдаём к 25 мая', done: false },
        { id: 'may-notify', title: 'Уведомление по НДФЛ и взносам', note: 'отправим к 25 мая', done: false },
      ],
    },
    {
      key: 'jun',
      name: 'Июнь',
      moments: [
        {
          id: 'jun-05',
          day: 5,
          monthShort: 'июн',
          dateLabel: '5 июня',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'jun-05-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 23–31 мая',
              amount: 3900,
              viaEnp: true,
            },
          ],
        },
        {
          id: 'jun-15',
          day: 15,
          monthShort: 'июн',
          dateLabel: '15 июня',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'jun-15-travma',
              title: 'Взносы на травматизм',
              basis: 'за май',
              amount: 200,
              viaEnp: false,
            },
          ],
        },
        {
          id: 'jun-28',
          day: 28,
          monthShort: 'июн',
          dateLabel: '28 июня',
          urgency: 'future',
          status: 'preliminary',
          paid: false,
          items: [
            {
              id: 'jun-28-vznos',
              title: 'Страховые взносы',
              basis: 'за май',
              amount: 19500,
              viaEnp: true,
            },
            {
              id: 'jun-28-ndfl',
              title: 'НДФЛ с зарплаты',
              basis: 'за 1–22 июня',
              amount: 9100,
              viaEnp: true,
            },
          ],
        },
      ],
      weDo: [
        { id: 'jun-persved', title: 'Персонифицированные сведения за май', note: 'сдаём к 25 июня', done: false },
        { id: 'jun-notify', title: 'Уведомление по НДФЛ и взносам', note: 'отправим к 25 июня', done: false },
      ],
    },
  ],
}

/**
 * «Сегодня» прототипа — 22 апреля 2026. Для горизонта «Месяц»: маркер на таймлайне,
 * подсветка ближайшего действия и счётчик «через N дней».
 */
export const TODAY = { monthKey: 'apr', day: 22, label: '22 апреля', monthTitle: 'Апрель 2026' }

/** Сумма платёжного момента. */
export const momentTotal = (m: PaymentMoment): number =>
  m.items.reduce((s, it) => s + it.amount, 0)

export const monthByKey = (q: Quarter, key: string): MonthBlock | undefined =>
  q.months.find((m) => m.key === key)

export type MonthSummary = {
  totalDue: number
  paidAmount: number
  remaining: number
  momentsTotal: number
  momentsPaid: number
  overdueCount: number
  nextId?: string
  next?: { dateLabel: string; day: number; amount: number }
}

/** Свод по одному месяцу для горизонта «Месяц». */
export function summarizeMonth(month: MonthBlock): MonthSummary {
  const totalDue = month.moments.reduce((s, m) => s + momentTotal(m), 0)
  const paidAmount = month.moments.filter((m) => m.paid).reduce((s, m) => s + momentTotal(m), 0)
  const next = month.moments.find((m) => !m.paid)
  return {
    totalDue,
    paidAmount,
    remaining: totalDue - paidAmount,
    momentsTotal: month.moments.length,
    momentsPaid: month.moments.filter((m) => m.paid).length,
    overdueCount: month.moments.filter((m) => m.urgency === 'overdue').length,
    nextId: next?.id,
    next: next ? { dateLabel: next.dateLabel, day: next.day, amount: momentTotal(next) } : undefined,
  }
}

/** Русское «через N дней» / «сегодня» / «завтра». */
export function daysUntilLabel(targetDay: number, todayDay: number = TODAY.day): string {
  const n = targetDay - todayDay
  if (n <= 0) return 'сегодня'
  if (n === 1) return 'завтра'
  const mod100 = n % 100
  const mod10 = n % 10
  let word = 'дней'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'день'
    else if (mod10 >= 2 && mod10 <= 4) word = 'дня'
  }
  return `через ${n} ${word}`
}

export type QuarterSummary = {
  totalDue: number
  paidAmount: number
  remaining: number
  momentsTotal: number
  momentsPaid: number
  overdueCount: number
  next?: { dateLabel: string; amount: number }
}

/** Свод по кварталу для верхнего виджета. */
export function summarizeQuarter(q: Quarter): QuarterSummary {
  const moments = q.months.flatMap((mo) => mo.moments)
  const totalDue = moments.reduce((s, m) => s + momentTotal(m), 0)
  const paidAmount = moments.filter((m) => m.paid).reduce((s, m) => s + momentTotal(m), 0)
  const overdueCount = moments.filter((m) => m.urgency === 'overdue').length
  const next = moments.find((m) => !m.paid)
  return {
    totalDue,
    paidAmount,
    remaining: totalDue - paidAmount,
    momentsTotal: moments.length,
    momentsPaid: moments.filter((m) => m.paid).length,
    overdueCount,
    next: next ? { dateLabel: next.dateLabel, amount: momentTotal(next) } : undefined,
  }
}
