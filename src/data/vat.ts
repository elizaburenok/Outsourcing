import type { Payable } from './payment'

export type VatRate = 5 | 7

export type VatDocument = {
  id: string
  title: string
  kind: 'sale' | 'advance'
  gross: number
  /** НДС с аванса, ранее начисленный и принимаемый к вычету при отгрузке. */
  advanceVatOffset?: number
}

export type VatContractor = {
  id: string
  name: string
  initials: string
  color: string
  documents: VatDocument[]
}

/** Сумма документа включает НДС: специальные расчётные ставки 5/105 и 7/107. */
export function vatIncludedInGross(gross: number, rate: VatRate): number {
  return Math.round(gross * rate / (100 + rate) * 100) / 100
}

/** Для цены без НДС налог начисляется сверх базы. */
export function vatOnNet(net: number, rate: VatRate): number {
  return Math.round(net * rate) / 100
}

export function vatForDocument(document: VatDocument, rate: VatRate): number {
  return Math.round((vatIncludedInGross(document.gross, rate) - (document.advanceVatOffset ?? 0)) * 100) / 100
}

const Q3_CONTRACTORS: VatContractor[] = [
  { id: 'ozon', name: 'ИНТЕРНЕТ РЕШЕНИЯ, ООО', initials: 'O', color: 'var(--color-category-indigo)', documents: [
    { id: 'ozon-1', title: 'Счёт-фактура №150 от 18.09.2026', kind: 'sale', gross: 420_000 },
  ] },
  { id: 'retail', name: 'Розничные покупатели', initials: 'Р', color: 'var(--color-category-sand)', documents: [
    { id: 'retail-1', title: 'Счёт-фактура №147 от 15.09.2026', kind: 'sale', gross: 210_000 },
  ] },
  { id: 'vektor', name: 'ГК «Вектор», АО', initials: 'В', color: 'var(--color-category-orchid)', documents: [
    { id: 'vektor-1', title: 'Счёт-фактура на аванс №172 от 29.09.2026', kind: 'advance', gross: 177_765 },
  ] },
]

const Q2_CONTRACTORS: VatContractor[] = [
  { id: 'ozon', name: 'ИНТЕРНЕТ РЕШЕНИЯ, ООО', initials: 'O', color: 'var(--color-category-indigo)', documents: [
    { id: 'ozon-2', title: 'Счёт-фактура №91 от 25.06.2026', kind: 'sale', gross: 1_050_000 },
  ] },
  { id: 'retail', name: 'Розничные покупатели', initials: 'Р', color: 'var(--color-category-sand)', documents: [
    { id: 'retail-2', title: 'Счёт-фактура на аванс №92 от 27.06.2026', kind: 'advance', gross: 966_000 },
  ] },
]

const IP_Q3_CONTRACTORS: VatContractor[] = [
  { id: 'ip-retail', name: 'Розничные покупатели', initials: 'Р', color: 'var(--color-category-sand)', documents: [
    { id: 'ip-retail-1', title: 'Счёт-фактура №38 от 30.09.2026', kind: 'sale', gross: 756_000 },
  ] },
]

export function getVatCalculation(payable: Payable, rate: VatRate = 5) {
  if (payable.category !== 'nds') return undefined
  if (!/q[23]/.test(payable.id)) return undefined
  const isQ3 = payable.id.includes('q3')
  const contractors = isQ3 ? (payable.id.startsWith('ip-') ? IP_Q3_CONTRACTORS : Q3_CONTRACTORS) : Q2_CONTRACTORS
  const quarter = isQ3 ? 'III' : 'II'
  const months = isQ3 ? ['октября', 'ноября', 'декабря'] : ['июля', 'августа', 'сентября']
  const gross = contractors.reduce((sum, contractor) => sum + contractor.documents.reduce((s, document) => s + document.gross, 0), 0)
  const tax = contractors.reduce((sum, contractor) => sum + contractor.documents.reduce((s, document) => s + vatForDocument(document, rate), 0), 0)
  const unit = Number.isInteger(tax) ? 1 : 100
  const first = Math.ceil(tax * unit / 3) / unit
  const last = Math.round((tax - first * 2) * unit) / unit
  return { rate, quarter, gross, tax, installments: [first, first, last], months, contractors }
}
