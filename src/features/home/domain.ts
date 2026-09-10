/**
 * Доменный слой Главной — по образцу `Пульс/src/data/riskContent.ts`, но над единой
 * моделью платежа аутсорса (`AugustPayment`).
 *
 * Ключевой сдвиг относительно `october/groups.ts` (группировка по СОСТОЯНИЮ):
 * здесь платежи собираются в **стабильные доменные категории под задачи клиента**
 * (УСН, НДС, Сотрудники), а состояние выражается через `severity`. «Закрытие
 * задолженностей» — не отдельная категория, а severity `overdue`, который красит
 * карточку своего домена и (сортировкой в экране) поднимает её наверх. Так сохраняется
 * инвариант непересечения: каждый платёж живёт ровно в одной категории, без двойного
 * счёта, а механика «оплатил → категория пересчиталась и погасла» работает через
 * `markPaid` из `PaymentsProvider`.
 */

import {
  pluralPayments,
  type AugustPayment,
  type PayCategory,
  type PayState,
} from '@/data/august'
import { HISTORY } from '@/data/history'

export type Severity = 'ok' | 'attention' | 'overdue'
export type DomainCategoryId = 'usn' | 'nds' | 'employees'

/** Визуальный тон карточки. `neutral` — регулярный домен без открытых сумм: не «успех»
 *  (зелёный), а нейтральный факт «сейчас ничего не должны, следующий платёж по графику». */
export type CardTone = Severity | 'neutral'

export interface CardContent {
  /** Крупная строка карточки. */
  title: string
  /** Подпись под ней. */
  subtitle: string
}

export interface DomainCategoryDef {
  id: DomainCategoryId
  label: string
  /** Какие `PayCategory` входят в домен. */
  members: PayCategory[]
  /** Текст карточки, когда открытых платежей нет (в этом случае severity всегда `ok`). */
  emptyContent: CardContent
}

/** Канонический порядок доменов (до сортировки по срочности). */
export const CATEGORY_ORDER: DomainCategoryId[] = ['usn', 'nds', 'employees']

export const CATEGORIES: Record<DomainCategoryId, DomainCategoryDef> = {
  usn: {
    id: 'usn',
    label: 'Налог',
    members: ['usn'],
    emptyContent: { title: 'Всё уплачено', subtitle: 'УСН в порядке' },
  },
  nds: {
    id: 'nds',
    label: 'НДС',
    members: ['nds'],
    emptyContent: { title: 'Всё уплачено', subtitle: 'НДС в порядке' },
  },
  employees: {
    id: 'employees',
    label: 'Сотрудники',
    members: ['salary', 'ndfl', 'vznos', 'travma'],
    emptyContent: { title: 'Всё уплачено', subtitle: 'Зарплата и взносы в порядке' },
  },
}

/** Все домены регулярные, календарные: даже без открытой суммы к уплате карточка
 *  остаётся серой, а не зеленеет — это не разовое «закрыли период», а постоянный
 *  ритм с известной следующей датой. */
const NEUTRAL_WHEN_OK: DomainCategoryId[] = ['usn', 'nds', 'employees']

/** Визуальный тон карточки: severity как есть, кроме `ok` у регулярных доменов — там серый. */
export function cardTone(id: DomainCategoryId, severity: Severity): CardTone {
  return severity === 'ok' && NEUTRAL_WHEN_OK.includes(id) ? 'neutral' : severity
}

type IsPaid = (id: string) => boolean

/** Порядок сортировки платежей внутри домена: сначала самые срочные. */
const STATE_RANK: Record<PayState, number> = { overdue: 0, due: 1, process: 2, paid: 3 }

/**
 * Открытые (не уплаченные) платежи домена, отсортированные по срочности
 * (overdue → due → process). Для `usn` вкладывается синтетический аванс
 * (`usn`-параметр), если он есть — `null` означает, что домен ничего не показывает
 * (напр. гипотетический сценарий без предстоящего аванса). Платежи следующего платёжного
 * цикла (`nextCycle`, см. `AugustPayment`) в домен не попадают вовсе — не как усечение
 * произвольным числом (это резало пополам платежи с одним и тем же сроком), а как
 * явный признак у данных: «это уже следующий месяц, а не то, что нужно платить сейчас».
 * Всё остальное (просроченное и текущее) домен показывает и закрывает по «Уплатить всё»
 * целиком, без остатка.
 */
export function categoryPayments(
  id: DomainCategoryId,
  list: AugustPayment[],
  usn: AugustPayment | null,
  isPaid: IsPaid,
): AugustPayment[] {
  const { members } = CATEGORIES[id]
  const base = id === 'usn' && usn ? [usn, ...list] : list
  return base
    .filter(
      (p) => members.includes(p.category) && p.state !== 'paid' && !isPaid(p.id) && !p.nextCycle,
    )
    .sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state])
}

/** Группа операций домена в истории — «Август» (текущий период) и прошлые месяцы. */
export interface DomainHistoryGroup {
  id: string
  /** Заголовок группы — месяц, напр. «Август». */
  label: string
  payments: AugustPayment[]
}

/** Метка текущего (открытого) периода прототипа — сценарий «24 августа». */
const CURRENT_PERIOD_LABEL = 'Август'

/**
 * История операций домена под таб «Выполнено»: сначала оплаченные в текущем периоде
 * (изначально или в этой сессии — их помечаем «Оплачено сегодня»), затем закрытые
 * прошлые месяцы из `HISTORY`. В обеих частях берём только платежи категорий домена,
 * поэтому «Выполнено» у каждой карточки показывает ровно свой срез (УСН / НДС / Сотрудники).
 */
export function categoryHistory(
  id: DomainCategoryId,
  list: AugustPayment[],
  isPaid: IsPaid,
  /** Метка текущего периода (по умолчанию «Август»; напр. Кейс 2 — «Сентябрь»). */
  currentLabel: string = CURRENT_PERIOD_LABEL,
): DomainHistoryGroup[] {
  const { members } = CATEGORIES[id]
  const groups: DomainHistoryGroup[] = []

  const current = list
    .filter((p) => members.includes(p.category) && (p.state === 'paid' || isPaid(p.id)))
    .map((p): AugustPayment =>
      p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'сегодня' },
    )
  if (current.length > 0) {
    groups.push({ id: 'current', label: currentLabel, payments: current })
  }

  for (const m of HISTORY) {
    const payments = m.payments.filter((p) => members.includes(p.category))
    if (payments.length > 0) groups.push({ id: m.id, label: m.label, payments })
  }

  return groups
}

/**
 * Severity домена. `process` (сумма ещё считается — регулярный платёж на подходе, но
 * действовать пока не с чем) сам по себе не поднимает severity выше `ok`: только `due`/
 * `overdue` — это то, что реально нужно сделать. Иначе УСН/НДС «на подходе» красились бы
 * жёлтым при каждом открытии, хотя платить ещё нечего.
 */
export function categorySeverity(payments: AugustPayment[]): Severity {
  if (payments.some((p) => p.state === 'overdue')) return 'overdue'
  if (payments.some((p) => p.state === 'due')) return 'attention'
  return 'ok'
}

/**
 * Кликабельна ли карточка. `false`, если все открытые платежи домена — в состоянии
 * `process` (сумма ещё считается): платить пока нечего.
 */
export function categoryActionable(payments: AugustPayment[]): boolean {
  return payments.some((p) => p.state !== 'process')
}

/** Уровни по всем доменам (для сортировки карточек). */
export function computeLevels(
  list: AugustPayment[],
  usn: AugustPayment | null,
  isPaid: IsPaid,
): Record<DomainCategoryId, Severity> {
  return CATEGORY_ORDER.reduce(
    (acc, id) => {
      acc[id] = categorySeverity(categoryPayments(id, list, usn, isPaid))
      return acc
    },
    {} as Record<DomainCategoryId, Severity>,
  )
}

/**
 * Контент карточки домена. Если открытых платежей больше одного — карточка не называет
 * конкретный, а показывает их число + ближайший срок; если ровно один — называет его
 * (для платежа в `process` — «Рассчитаем до …», в т.ч. когда это единственное, что есть
 * у регулярного домена в состоянии «всё хорошо» — так видна дата следующего платежа);
 * если платежей нет вовсе — статичный текст из справочника. Ср. `cardContent` в
 * `riskContent.ts`.
 */
export function cardContent(
  def: DomainCategoryDef,
  severity: Severity,
  payments: AugustPayment[],
): CardContent {
  if (payments.length === 0) return def.emptyContent
  const lead = payments[0] // отсортированы: overdue → due → process
  const date = lead.dueLabel ?? ''
  if (payments.length > 1) {
    return {
      title: pluralPayments(payments.length),
      subtitle: severity === 'overdue' ? `Срок вышел ${date}` : `До ${date}`,
    }
  }
  if (lead.state === 'process') {
    return {
      title: lead.title,
      subtitle: lead.preliminary ? 'Пока платить не нужно' : `Рассчитаем до ${date}`,
    }
  }
  return {
    title: lead.title,
    subtitle: severity === 'overdue' ? `Срок вышел ${date}` : `До ${date}`,
  }
}

/** Контент виджета общей суммы к уплате (макет 892-86541). */
export interface TotalDueContent {
  /** Сумма всех открытых платежей по всем доменам. */
  amount: number
  subtitle: string
}

/**
 * Виджет общей суммы к уплате на Главной — единственное место, где сумма считается
 * не по одному домену, а сразу по всем трём (УСН, НДС, Сотрудники). Ведущий платёж
 * для подписи выбирается по срочности среди объединённого списка (не по порядку
 * доменов), тем же STATE_RANK, что и внутри `categoryPayments`. Если открытых платежей
 * нет вовсе — `null`: виджету нечего показывать, домены и так зелёные.
 */
export function totalDueContent(
  paymentsByCat: Record<DomainCategoryId, AugustPayment[]>,
): TotalDueContent | null {
  const all = CATEGORY_ORDER.flatMap((id) => paymentsByCat[id])
  if (all.length === 0) return null

  const amount = all.reduce((sum, p) => sum + p.amount, 0)
  const lead = [...all].sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state])[0]
  const date = lead.dueLabel ?? ''
  const severity = categorySeverity(all)

  let subtitle: string
  if (severity === 'overdue') {
    subtitle = `Срок вышел ${date} — на уплату налогов и взносов`
  } else if (lead.state === 'process') {
    subtitle = lead.preliminary
      ? `Нужно примерно ${date || 'в конце месяца'} на уплату налогов и взносов`
      : 'Рассчитаем сумму на уплату налогов и взносов'
  } else {
    subtitle = `Нужно до ${date} на уплату налогов и взносов`
  }

  return { amount, subtitle }
}
