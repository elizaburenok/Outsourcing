import type { Payable } from './payment'

export type VatRate = 5 | 7 | 22
export type VatKind = 'sale' | 'advance' | 'advanceOffset' | 'purchase'
export type VatDocument = {
  id: string
  title: string
  contractor: string
  kind: VatKind
  gross: number
  /** НДС по счёту-фактуре; для покупки нужен подтверждённый вычет. */
  vat?: number
  /** Связь зачёта с ранее начисленным авансом. */
  advanceId?: string
}

export type VatSection = {
  kind: VatKind
  title: string
  description: string
  sign: 1 | -1
  documents: VatDocument[]
  gross: number
  vat: number
}

export type VatContractorSummary = {
  name: string
  documents: VatDocument[]
  saleCount: number
  advanceCount: number
  offsetCount: number
  purchaseCount: number
  /** Только НДС с продаж, без полученных и зачтённых авансов. */
  saleVat: number
  /** Начисление с продаж и авансов за вычетом зачтённых авансов. */
  saleSideVat: number
  /** Доступный вычет входного НДС. */
  purchaseVat: number
}

const SECTION_META: Record<VatKind, Pick<VatSection, 'title' | 'description' | 'sign'>> = {
  sale: { title: 'Продажи', description: 'НДС по отгрузкам и актам', sign: 1 },
  advance: { title: 'Полученные авансы', description: 'НДС при получении предоплаты', sign: 1 },
  advanceOffset: { title: 'Зачтённые авансы', description: 'Вычет ранее начисленного НДС', sign: -1 },
  purchase: { title: 'Покупки', description: 'Вычет входного НДС по документам', sign: -1 },
}
const KINDS: VatKind[] = ['sale', 'advance', 'advanceOffset', 'purchase']
const roundKopecks = (value: number) => Math.round(value * 100) / 100

/** Расчётная ставка для суммы, в которую уже включён НДС. */
export function vatIncludedInGross(gross: number, rate: VatRate): number {
  return roundKopecks(gross * rate / (100 + rate))
}

export function vatOnNet(net: number, rate: VatRate): number {
  return roundKopecks(net * rate / 100)
}

export function vatForDocument(document: VatDocument, rate: VatRate): number {
  if (document.kind === 'purchase' && rate !== 22) return 0
  return document.vat ?? vatIncludedInGross(document.gross, rate)
}

/**
 * Доход УСН определяется поступлениями и рассчитывается отдельно.
 * Продажа и связанный с ней аванс могут относиться к одной оплате покупателя.
 */
export function calculateVat(documents: VatDocument[], rate: VatRate, priorAdvanceVat: Record<string, number> = {}) {
  const advances = new Map(documents.filter((d) => d.kind === 'advance').map((d) => [d.id, vatForDocument(d, rate)]))
  const offsets = new Map<string, number>()
  for (const document of documents.filter((d) => d.kind === 'advanceOffset')) {
    if (!document.advanceId) throw new Error('Зачёт аванса не связан с исходным документом')
    const total = roundKopecks((offsets.get(document.advanceId) ?? 0) + vatForDocument(document, rate))
    if (total > (advances.get(document.advanceId) ?? priorAdvanceVat[document.advanceId] ?? 0)) throw new Error('Зачёт превышает НДС с аванса')
    offsets.set(document.advanceId, total)
  }
  const sections: VatSection[] = KINDS.map((kind) => {
    const items = documents.filter((document) => document.kind === kind)
    return {
      kind,
      ...SECTION_META[kind],
      documents: items,
      gross: roundKopecks(items.reduce((sum, document) => sum + document.gross, 0)),
      vat: roundKopecks(items.reduce((sum, document) => sum + vatForDocument(document, rate), 0)),
    }
  })
  const exactTax = roundKopecks(sections.reduce((sum, section) => sum + section.sign * section.vat, 0))
  const accruedVat = roundKopecks(sections[0].vat + sections[1].vat)
  const deductionsVat = roundKopecks(sections[2].vat + sections[3].vat)
  const byContractor = new Map<string, VatDocument[]>()
  for (const document of documents) {
    const items = byContractor.get(document.contractor) ?? []
    items.push(document)
    byContractor.set(document.contractor, items)
  }
  const contractors: VatContractorSummary[] = [...byContractor].map(([name, items]) => {
    const ofKind = (kind: VatKind) => items.filter((document) => document.kind === kind)
    const sumVat = (kind: VatKind) => roundKopecks(ofKind(kind).reduce((sum, document) => sum + vatForDocument(document, rate), 0))
    return {
      name,
      documents: items,
      saleCount: ofKind('sale').length,
      advanceCount: ofKind('advance').length,
      offsetCount: ofKind('advanceOffset').length,
      purchaseCount: ofKind('purchase').length,
      saleVat: sumVat('sale'),
      saleSideVat: roundKopecks(sumVat('sale') + sumVat('advance') - sumVat('advanceOffset')),
      purchaseVat: sumVat('purchase'),
    }
  }).sort((a, b) => (b.saleSideVat + b.purchaseVat) - (a.saleSideVat + a.purchaseVat))
  const tax = Math.max(0, exactTax)
  const totalKopecks = Math.round(tax * 100)
  const firstKopecks = Math.ceil(totalKopecks / 3)
  const secondKopecks = Math.ceil((totalKopecks - firstKopecks) / 2)
  return { rate, sections, accruedVat, deductionsVat, contractors, exactTax, tax,
    installments: [firstKopecks / 100, secondKopecks / 100, (totalKopecks - firstKopecks - secondKopecks) / 100] as const }
}

/** Квартальный пример и дополнительные демо-операции для разных сочетаний покупок и продаж. */
const Q3_DOCUMENTS: VatDocument[] = [
  { id: 'sale-1', title: 'Счёт-фактура № 1 от 25.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'sale', gross: 1_128_673.24, vat: 203_531.24 },
  { id: 'sale-2', title: 'Счёт-фактура № 1 от 22.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'sale', gross: 209_962, vat: 37_862 },
  { id: 'advance-1', title: 'Оплата от 22.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'advance', gross: 209_962, vat: 37_862 },
  { id: 'advance-2', title: 'Оплата от 09.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'advance', gross: 1_039_273.59, vat: 187_409.99 },
  { id: 'offset-1', title: 'Зачёт аванса по счёту-фактуре от 22.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'advanceOffset', gross: 209_962, vat: 37_862, advanceId: 'advance-1' },
  { id: 'offset-2', title: 'Зачёт аванса по счёту-фактуре от 25.09.2026', contractor: 'ООО «Гарант-Логистик»', kind: 'advanceOffset', gross: 1_039_273.59, vat: 187_409.99, advanceId: 'advance-2' },
  { id: 'purchase-1', title: 'Счёт-фактура от ООО «ВсеИнструменты.ру» от 03.07.2026', contractor: 'ООО «ВсеИнструменты.ру»', kind: 'purchase', gross: 67_232.15, vat: 12_123.83 },
  { id: 'purchase-2', title: 'Счёт-фактура от ООО «ДНС Ритейл» от 16.07.2026', contractor: 'ООО «ДНС Ритейл»', kind: 'purchase', gross: 45_898.01, vat: 8_276.69 },
  { id: 'purchase-3', title: 'Счёт-фактура от СТД «Петрович» от 27.07.2026', contractor: 'СТД «Петрович»', kind: 'purchase', gross: 36_245.20, vat: 6_536.02 },
  { id: 'purchase-4', title: 'Счёт-фактура от ООО «Оптим» от 04.08.2026', contractor: 'ООО «Оптим»', kind: 'purchase', gross: 34_166.27, vat: 6_161.13 },
  { id: 'purchase-5', title: 'Счёт-фактура от ООО «Вивальдо Рус» от 13.08.2026', contractor: 'ООО «Вивальдо Рус»', kind: 'purchase', gross: 27_477.84, vat: 4_955.02 },
  { id: 'purchase-6', title: 'Счёт-фактура от АО «СКБ Контур» от 21.08.2026', contractor: 'АО «СКБ Контур»', kind: 'purchase', gross: 6_913.35, vat: 1_246.67 },
  { id: 'purchase-7', title: 'Счёт-фактура от ООО «ЦентрКрепёж» от 02.09.2026', contractor: 'ООО «ЦентрКрепёж»', kind: 'purchase', gross: 5_580, vat: 1_006.23 },
  { id: 'purchase-8', title: 'Счёт-фактура от ООО «Заречный механический завод» от 07.09.2026', contractor: 'ООО «Заречный механический завод»', kind: 'purchase', gross: 1_395.79, vat: 251.70 },
  { id: 'purchase-9', title: 'Счёт-фактура № 214 от 08.07.2026', contractor: 'ООО «ВсеИнструменты.ру»', kind: 'purchase', gross: 122_000 },
  { id: 'purchase-10', title: 'Счёт-фактура № 318 от 19.08.2026', contractor: 'ООО «ВсеИнструменты.ру»', kind: 'purchase', gross: 122_000 },
  { id: 'purchase-11', title: 'Счёт-фактура № 47 от 14.07.2026', contractor: 'ООО «Оптим»', kind: 'purchase', gross: 122_000 },
  { id: 'purchase-12', title: 'Счёт-фактура № 106 от 05.08.2026', contractor: 'ООО «ДНС Ритейл»', kind: 'purchase', gross: 61_000 },
  { id: 'purchase-13', title: 'Счёт-фактура № 63 от 10.09.2026', contractor: 'ООО «Вивальдо Рус»', kind: 'purchase', gross: 61_000 },
  { id: 'sale-3', title: 'Счёт-фактура № 12 от 21.07.2026', contractor: 'ООО «Оптим»', kind: 'sale', gross: 183_000 },
  { id: 'sale-4', title: 'Счёт-фактура № 18 от 17.08.2026', contractor: 'ООО «Оптим»', kind: 'sale', gross: 61_000 },
  { id: 'sale-5', title: 'Счёт-фактура № 23 от 15.09.2026', contractor: 'ООО «Вивальдо Рус»', kind: 'sale', gross: 122_000 },
  { id: 'sale-6', title: 'Счёт-фактура № 26 от 24.09.2026', contractor: 'ООО «Заречный механический завод»', kind: 'sale', gross: 122_000 },
]

const Q2_DOCUMENTS: VatDocument[] = [
  { id: 'q2-sale', title: 'Счёт-фактура № 91 от 25.06.2026', contractor: 'ООО «Интернет Решения»', kind: 'sale', gross: 1_050_000 },
  { id: 'q2-advance', title: 'Счёт-фактура на аванс № 92 от 27.06.2026', contractor: 'Розничные покупатели', kind: 'advance', gross: 966_000 },
]

export function getVatCalculation(payable: Payable) {
  if (payable.category !== 'nds' || !/q[23]/.test(payable.id)) return undefined
  const isQ3 = payable.id.includes('q3')
  if (isQ3 && !/(?:c2|c3)-nds-q3/.test(payable.id)) return undefined
  const rate = payable.vatRate ?? (isQ3 ? 22 : 5)
  const result = calculateVat(isQ3 ? Q3_DOCUMENTS : Q2_DOCUMENTS, rate)
  return {
    ...result,
    quarter: isQ3 ? 'III' : 'II',
    months: isQ3 ? ['октября', 'ноября', 'декабря'] : ['июля', 'августа', 'сентября'],
  }
}
