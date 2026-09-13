/**
 * Данные страницы уплаты налога. Вью-модель платежа собирается из общего списка
 * `AUGUST_PAYMENTS` и квартального `USN_ADVANCE` (см. august.ts) плюс номинальные
 * реквизиты и счёт списания. Для УСН добавляется разбор расчёта (USN_CALC).
 *
 * Расчёт УСН сверен с моделью референс-скрина: Доходы × 6% = налог до вычетов;
 * минус (страховые взносы + уплаченные авансы по УСН) = к уплате. Числа привязаны
 * к сумме аванса на Главной — 104 900 ₽. Данные номинальные, для показа.
 */

import { AUGUST_PAYMENTS, USN_ADVANCE, type AugustPayment, type PayCategory } from './august'
import { OCTOBER_PAYMENTS } from './october'
import { CASE2_PAYABLES } from './case2'
import { CASE3_PAYABLES } from './case3'

/** Счёт списания (номинальный, для показа). */
export const PAYMENT_ACCOUNT = '2 480 310,55 ₽ — Расчётный, ···7742'

/** Короткое название налога для левой панели (NavigationBar). */
const CATEGORY_TITLE: Record<PayCategory, string> = {
  usn: 'Налог по УСН',
  nds: 'Налог по НДС',
  ndfl: 'НДФЛ',
  vznos: 'Страховые взносы',
  travma: 'Взносы на травматизм',
  salary: 'Зарплата директору',
}

/** Заголовок модалки результата оплаты («Флоу-результат») — с учётом рода/числа категории. */
const CATEGORY_PAID_TITLE: Record<PayCategory, string> = {
  usn: 'Налог по УСН уплачен!',
  nds: 'Налог по НДС уплачен!',
  ndfl: 'НДФЛ уплачен!',
  vznos: 'Страховые взносы уплачены!',
  travma: 'Взносы на травматизм уплачены!',
  salary: 'Зарплата директору уплачена!',
}

export type Payable = {
  id: string
  category: PayCategory
  /** Заголовок в левой панели. */
  title: string
  /** Подзаголовок в левой панели (период). */
  subtitle: string
  /** Полное название платежа (для модалки результата). */
  fullTitle: string
  /** Заголовок модалки «Успех» после уплаты. */
  paidTitle: string
  amount: number
  /** «до 28 октября» / «до 28 августа». */
  dueLabel: string
  /** Получатель платежа. */
  requisites: string
  account: string
  /** Показывать навигатор «Расчёт налогов» и дровер (для всех налогов и взносов; не для зарплаты). */
  hasCalc: boolean
}

function toPayable(
  p: AugustPayment | typeof USN_ADVANCE,
  subtitle: string,
  title: string = CATEGORY_TITLE[p.category],
): Payable {
  const requisites = p.viaEnp ? 'Единый налоговый счёт' : 'СФР — отдельной платёжкой'
  return {
    id: p.id,
    category: p.category,
    title,
    subtitle,
    fullTitle: p.title,
    paidTitle: CATEGORY_PAID_TITLE[p.category],
    amount: p.amount,
    dueLabel: p.dueLabel ?? '',
    requisites,
    account: PAYMENT_ACCOUNT,
    hasCalc: p.category !== 'salary',
  }
}

/** Собрать вью-модель платежа по id (из общего списка августа или квартального аванса УСН). */
export function getPayableById(id: string): Payable | undefined {
  if (id === USN_ADVANCE.id) return toPayable(USN_ADVANCE, 'Аванс за 9 месяцев 2026')
  const p =
    AUGUST_PAYMENTS.find((x) => x.id === id) ??
    OCTOBER_PAYMENTS.find((x) => x.id === id) ??
    CASE2_PAYABLES.find((x) => x.id === id) ??
    CASE3_PAYABLES.find((x) => x.id === id)
  if (!p) return undefined
  // НДС: заголовок — полное название платежа («N-й платёж за …квартал»), без подзаголовка.
  if (p.category === 'nds') return toPayable(p, '', p.title)
  return toPayable(p, p.title)
}

/** Тариф в процентах для дровера «Расчёт налога» — для налогов/взносов, где сумма = база × тариф. */
const CALC_RATE: Partial<Record<PayCategory, number>> = {
  ndfl: 13,
  vznos: 30,
  travma: 0.5,
  nds: 5,
}

/**
 * База начисления (зарплата за период / фонд оплаты труда), из которой в дровере
 * «Расчёт налога» выводится сумма конкретного платежа: база × тариф, округлённый
 * до рубля, даёт существующую сумму платежа. Зарплаты директора здесь нет — это
 * не налог, дровера для неё не показываем.
 */
const CALC_BASE: Record<string, number> = {
  'ndfl-jul-2': 30_000,
  'ndfl-jul-1': 64_615,
  'ndfl-aug-1': 70_000,
  'vznos-jun': 65_000,
  'vznos-jul': 65_000,
  'vznos-aug': 65_000,
  'travma-jun': 40_000,
  'travma-jul': 40_000,
  'travma-aug': 40_000,
  'ndfl-aug-2': 30_000,
  // НДС на УСН, 5% без вычета — база это выручка за расчётный месяц квартала.
  'nds-q2-2': 640_000,
  // Октябрьский сценарий (10 октября) — базы для налогов/взносов к уплате.
  'o-travma-sep': 40_000,
  'o-vznos-sep': 65_000,
  'o-ndfl-oct-1': 70_000,
  // Кейс 2 (10 сентября) — базы для расчёта в дровере уплаты.
  'c2-nds-q2-3': 640_000,
  'c2-vznos-aug': 65_000,
  'c2-ndfl-sep-1': 70_000,
}

export type CalcBreakdown =
  | { kind: 'usn' }
  | { kind: 'rate'; base: number; ratePercent: number; tax: number }

/** Разбор расчёта для дровера «Расчёт налога» по конкретному платежу. */
export function getCalcBreakdown(payable: Payable): CalcBreakdown | undefined {
  if (payable.category === 'usn') return { kind: 'usn' }
  const base = CALC_BASE[payable.id]
  const ratePercent = CALC_RATE[payable.category]
  if (base === undefined || ratePercent === undefined) return undefined
  return { kind: 'rate', base, ratePercent, tax: payable.amount }
}

/** Один источник дохода (контрагент) в расчёте УСН. */
export type CalcContractor = {
  id: string
  name: string
  ops: number
  amount: number
  /** Инициалы для аватара. */
  initials: string
  /** Токен цвета аватара (из палитры категорий DS). */
  color: string
}

/** Разбор расчёта аванса по УСН «Доходы» за 9 месяцев 2026. */
export const USN_CALC = {
  periodLabel: 'с 01.01.2026 по 30.09.2026',
  yearLabel: '2026',
  income: 3_150_000,
  rate: 6,
  taxBeforeDeduction: 189_000,
  deduction: 84_100,
  deductionNote: 'Страховые взносы + уплаченные авансы по УСН за I квартал и полугодие',
  toPay: 104_900,
  contractors: [
    {
      id: 'technosfera',
      name: 'ТЕХНОСФЕРА, ООО',
      ops: 4,
      amount: 1_240_000,
      initials: 'Т',
      color: 'var(--color-category-indigo)',
    },
    {
      id: 'vektor',
      name: 'ГК «Вектор», АО',
      ops: 3,
      amount: 820_000,
      initials: 'В',
      color: 'var(--color-category-amethyst)',
    },
    {
      id: 'digital-pro',
      name: 'Диджитал Про, ООО',
      ops: 2,
      amount: 610_000,
      initials: 'Д',
      color: 'var(--color-category-orchid)',
    },
    {
      id: 'retail',
      name: 'Розничные покупатели',
      ops: 5,
      amount: 480_000,
      initials: 'Р',
      color: 'var(--color-category-sand)',
    },
  ] satisfies CalcContractor[],
} as const
