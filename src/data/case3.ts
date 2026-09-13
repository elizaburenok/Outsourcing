/**
 * Данные сценария «Кейс 3» Главной ОБ — тот же клиент, что и в Кейсе 2 (ООО на УСН
 * «Доходы» 6% + НДС, есть сотрудники), но «сегодня» — начало декабря 2026. Это пик
 * налогового календаря: под конец года у клиента одновременно сходится необычно много
 * платежей. Модуль самодостаточный, `AUGUST_PAYMENTS`/`CASE2_*` не трогает.
 *
 * «Сегодня» — 5 декабря 2026. Раскладка по трём группам (425-ФЗ, календарь 2026):
 *  - «Налоги и взносы» — годовой пик собственных налогов ООО. Имущественные налоги
 *    (транспортный, земельный, налог на имущество) за 2025 год платятся до 1 декабря —
 *    срок только что вышел, поэтому это задолженность.
 *  - «НДС» — за III квартал платится тремя долями (28 октября / ноября / декабря).
 *    Текущий (ближайший) платёж — 3-й, до 28 декабря.
 *  - «Сотрудники» — полный ритм за месяц: выплаты сотрудникам (зарплата за ноябрь,
 *    аванс за декабрь) и обязательства в бюджет — взносы на травматизм (15 декабря, в СФР
 *    мимо ЕНП), НДФЛ и страховые взносы (оба до 28 декабря).
 * Суммы номинальные, для показа.
 */

import type { AugustPayment } from '@/data/august'
import type { ObCaseData } from '@/data/case2'

/**
 * «Налоги и взносы» — декабрьский пик. Три имущественных налога за 2025 просрочены
 * (срок вышел 1 декабря); плюс годовой налог по УСН за 2026, который ещё считается.
 */
export const CASE3_TAXES: AugustPayment[] = [
  {
    id: 'c3-transport-2025',
    title: 'Транспортный налог за 2025 год',
    category: 'usn',
    amount: 8000,
    viaEnp: true,
    state: 'overdue',
    dueLabel: '1 декабря',
  },
  {
    id: 'c3-land-2025',
    title: 'Земельный налог за 2025 год',
    category: 'usn',
    amount: 5200,
    viaEnp: true,
    state: 'overdue',
    dueLabel: '1 декабря',
  },
  {
    id: 'c3-property-2025',
    title: 'Налог на имущество за 2025 год',
    category: 'usn',
    amount: 12400,
    viaEnp: true,
    state: 'overdue',
    dueLabel: '1 декабря',
  },
  {
    // Годовой налог по УСН за 2026 копится весь год, а платится по итогам года — до
    // 28 апреля 2027. Живёт в своём домене «Налоги и взносы», но в состоянии `process`:
    // в сумму к уплате и в «Уплатить всё» не входит, в дровере показывается отдельной
    // секцией «Не входит в расчёты» (см. GroupDrawer).
    id: 'c3-usn-2026',
    title: 'Налог по УСН за 2026 год',
    category: 'usn',
    amount: 61000,
    viaEnp: true,
    state: 'process',
    preliminary: true,
    payFromLabel: '1 января',
    dueLabel: '28 апреля',
  },
]

/** НДС за III квартал — ближайший (3-й, последний) платёж, до 28 декабря. */
export const CASE3_NDS: AugustPayment[] = [
  {
    id: 'c3-nds-q3-3',
    title: '3-й платёж за III квартал',
    category: 'nds',
    amount: 12821,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 декабря',
  },
]

/**
 * Полный ритм по сотрудникам за месяц: выплаты самим сотрудникам (зарплата за ноябрь,
 * аванс за декабрь) и обязательства в бюджет (травматизм 15 дек, НДФЛ и взносы 28 дек).
 */
export const CASE3_EMPLOYEES: AugustPayment[] = [
  {
    id: 'c3-salary-nov',
    title: 'Зарплата за ноябрь',
    category: 'salary',
    amount: 42000,
    viaEnp: true,
    state: 'due',
    dueLabel: '10 декабря',
  },
  {
    id: 'c3-travma-nov',
    title: 'Взносы на травматизм за ноябрь',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'due',
    dueLabel: '15 декабря',
  },
  {
    id: 'c3-ndfl-dec',
    title: 'НДФЛ за сотрудников с 23 ноября — 22 декабря',
    category: 'ndfl',
    amount: 6828,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 декабря',
  },
  {
    id: 'c3-vznos-nov',
    title: 'Страховые взносы сотрудников за ноябрь',
    category: 'vznos',
    amount: 6000,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 декабря',
  },
  {
    id: 'c3-salary-dec-advance',
    title: 'Аванс за декабрь',
    category: 'salary',
    amount: 20000,
    viaEnp: true,
    state: 'due',
    dueLabel: '25 декабря',
  },
  {
    // Следующий период по НДФЛ: сумма зависит от декабрьских выплат, поэтому ещё
    // считается (`process` без суммы) — пример «позже» в зарплатном домене.
    id: 'c3-ndfl-jan',
    title: 'НДФЛ за сотрудников с 23 декабря — 22 января',
    category: 'ndfl',
    amount: 0,
    viaEnp: true,
    state: 'process',
    dueLabel: '28 января',
  },
]

export const CASE3_PAYABLES: AugustPayment[] = [...CASE3_TAXES, ...CASE3_NDS, ...CASE3_EMPLOYEES]

/** Кейс 3 — декабрь: пик налогового календаря, много платежей одновременно. */
export const CASE3: ObCaseData = {
  taxes: CASE3_TAXES,
  nds: CASE3_NDS,
  employees: CASE3_EMPLOYEES,
  payables: CASE3_PAYABLES,
  historyLabel: 'Декабрь',
}
