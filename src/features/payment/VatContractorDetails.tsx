import { useState } from 'react'
import { Cell } from '@ds/components/Cell'
import { TimelineEvent } from '@ds/components/TimelineEvent'
import { Chip } from '@ds/components/Chip'
import { formatMoney } from '@/lib/format'
import { pluralDocuments } from '@/lib/plural'
import { vatForDocument, type VatDocument, type VatKind, type VatRate, type VatSection } from '@/data/vat'

type Category = 'sale' | 'purchase'
type Filter = 'all' | 'sale' | 'advance' | 'advanceOffset' | 'purchase' | 'purchaseAdvance' | 'purchaseAdvanceOffset'

const colors = [
  'var(--color-category-indigo)', 'var(--color-category-orchid)',
  'var(--color-category-sand)', 'var(--color-category-amethyst)',
] as const
const summaryLabels: Record<VatKind, string> = {
  sale: 'НДС с продаж', purchase: 'НДС с покупок',
  advance: 'НДС с предоплат', advanceOffset: 'Вычет НДС с предоплат',
  purchaseAdvance: 'НДС с предоплат', purchaseAdvanceOffset: 'Зачёт предоплат',
}
/** Фильтры-чипы детализации по макету «Детализация покупателя». */
const SALE_FILTERS: [Exclude<Filter, 'all'>, string][] = [
  ['sale', 'НДС с продаж'], ['advance', 'НДС с предоплат'], ['advanceOffset', 'Вычет НДС с предоплат'],
]
const PURCHASE_FILTERS: [Exclude<Filter, 'all'>, string][] = [
  ['purchase', 'НДС с покупок'], ['purchaseAdvance', 'НДС с предоплат'], ['purchaseAdvanceOffset', 'Зачёт предоплат'],
]
function dateKey(title: string) {
  const date = title.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  return date ? `${date[3]}-${date[2]}-${date[1]}` : ''
}
function initials(name: string) {
  return name.replace(/^(ООО|АО|ИП)\s*/, '').replace(/^[«"]/, '').slice(0, 2).toUpperCase()
}
function sumVat(documents: VatDocument[], rate: VatRate) {
  return Math.round(documents.reduce((sum, document) => sum + vatForDocument(document, rate), 0) * 100) / 100
}
function sumGross(documents: VatDocument[]) {
  return Math.round(documents.reduce((sum, document) => sum + document.gross, 0) * 100) / 100
}
const isOffset = (document: VatDocument) => document.kind === 'advanceOffset' || document.kind === 'purchaseAdvanceOffset'
/** Подпись статуса в таймлайне (макет «Детализация покупателя»: «НДС начислен»). */
function timelineStatus(kind: VatKind): string {
  if (kind === 'sale' || kind === 'advance') return 'НДС начислен'
  if (kind === 'advanceOffset') return 'НДС зачтён'
  if (kind === 'purchase' || kind === 'purchaseAdvance') return 'НДС к вычету'
  return 'НДС восстановлен'
}
export function VatCategoryDetails({ kind, vat, selectedName, onSelect, showTotal = true }: {
  kind: Category
  vat: { rate: VatRate; sections: VatSection[] }
  selectedName: string | null
  onSelect?: (name: string) => void
  showTotal?: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const sections = vat.sections.filter((section) => kind === 'purchase'
    ? section.kind.startsWith('purchase') : !section.kind.startsWith('purchase'))
  /** На пониженных ставках (5%) доход УСН считается с учётом НДС — показываем сумму с налогом. */
  const saleIncomeAsGross = kind === 'sale' && vat.rate === 5
  const byContractor = new Map<string, VatDocument[]>()
  for (const document of sections.flatMap((section) => section.documents)) {
    const items = byContractor.get(document.contractor) ?? []
    items.push(document)
    byContractor.set(document.contractor, items)
  }
  const groups = [...byContractor].map(([name, items]) => {
    const offsetItems = items.filter(isOffset)
    const otherItems = items.filter((item) => !isOffset(item))
    const offsets = sumVat(offsetItems, vat.rate)
    const total = Math.round((sumVat(otherItems, vat.rate) - offsets) * 100) / 100
    const gross = Math.round((sumGross(otherItems) - sumGross(offsetItems)) * 100) / 100
    const net = Math.round((gross - total) * 100) / 100
    const documentCount = otherItems.length
    return { name, items, total, gross, net, documentCount }
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'ru'))
  const selected = groups.find((group) => group.name === selectedName)
  const present = (filterId: Exclude<Filter, 'all'>) =>
    selected?.items.some((document) => document.kind === filterId) ?? false
  const filterOptions = (kind === 'sale' ? SALE_FILTERS : PURCHASE_FILTERS).filter(([id]) => present(id))
  const showFilters = filterOptions.length > 1
  const activeFilter = showFilters && filterOptions.some(([id]) => id === filter) ? filter : 'all'
  const selectedItems = selected?.items ?? []
  const linkedAdvanceIds = new Set(selectedItems.filter((document) => document.kind === activeFilter)
    .map((document) => document.advanceId))
  const documents = selectedItems.filter((document) => {
    // Зачёт участвует в сводке, а в таймлайне макета показан исходный счёт-фактура.
    if (isOffset(document)) return false
    if (activeFilter === 'all') return true
    if (activeFilter === 'advanceOffset' || activeFilter === 'purchaseAdvanceOffset') {
      return linkedAdvanceIds.has(document.id)
    }
    return document.kind === activeFilter
  }).sort((a, b) => dateKey(b.title).localeCompare(dateKey(a.title)))

  if (!groups.length) return <p className="tcd__vat-context">{kind === 'purchase' ? 'В этом квартале покупок не было.' : 'В этом квартале продаж не было.'}</p>

  if (!selected) return <>
    {showTotal && <div className="tcd__category-intro">
      <p className="tcd__category-total">{formatMoney(Math.round(groups.reduce((sum, group) => sum + group.total, 0) * 100) / 100)}</p>
    </div>}
    <ul className="tcd__list tcd__contractor-list" aria-label="Контрагенты">
      {groups.map((group, index) => <li key={group.name}>
        <button type="button" className="tcd__contractor-button" onClick={() => onSelect?.(group.name)}
          aria-label={`Документы: ${group.name}`}>
          <Cell textScale="M" edgePadding="off" verticalSpacing="none"
            leftAccessory={<span className="tcd__avatar" style={{ background: colors[index % colors.length] }} aria-hidden>{initials(group.name)}</span>}
            title={group.name} description={pluralDocuments(group.documentCount)}
            rightAccessory={<span className="tcd__contractor-amount">{formatMoney(group.total)}
              <small>{kind === 'purchase' ? 'Расход' : 'Доход'} {formatMoney(saleIncomeAsGross ? group.gross : group.net)}</small></span>} />
        </button>
      </li>)}
    </ul>
  </>

  return <>
    {showFilters && <div className="tcd__filters" role="group" aria-label="Тип операции">
      <Chip chipType="Tab" isSelected={activeFilter === 'all'} aria-pressed={activeFilter === 'all'}
        onClick={() => setFilter('all')}>Все</Chip>
      {filterOptions.map(([id, label]) =>
        <Chip key={id} chipType="Tab" isSelected={filter === id} aria-pressed={filter === id}
          onClick={() => setFilter(id)}>{label}</Chip>)}
    </div>}
    <section className="tcd__detail-summary" aria-label={`Сводка: ${selected.name}`}>
      <div className="tcd__detail-summary-row">
        <span>НДС</span>
        <strong>{formatMoney(selected.total)}</strong>
      </div>
      <div className="tcd__detail-summary-row">
        <span>{kind === 'purchase' ? 'Расход' : 'Доход'}</span>
        <strong>{formatMoney(saleIncomeAsGross ? selected.gross : selected.net)}</strong>
      </div>
      {sections.filter((section) => section.documents.some((document) => document.contractor === selected.name)).map((section) =>
        <div className="tcd__detail-summary-row" key={section.kind}>
          <span>{summaryLabels[section.kind]}</span>
          <strong>{section.kind === 'advanceOffset' || section.kind === 'purchaseAdvanceOffset' ? '−' : ''}{formatMoney(sumVat(section.documents.filter((document) => document.contractor === selected.name), vat.rate))}</strong>
        </div>)}
    </section>
    {documents.length ? <ul className="tcd__timeline" aria-label="Документы контрагента">
      {documents.map((document) => {
        const documentVat = vatForDocument(document, vat.rate)
        const documentNet = Math.round((document.gross - documentVat) * 100) / 100
        const offset = isOffset(document)
        const fallbackDescription = offset
          ? `${document.kind === 'advanceOffset' ? 'Зачтён аванс' : 'Зачтённая предоплата'} ${formatMoney(document.gross)}`
          : document.kind === 'purchaseAdvance' ? `Предоплата ${formatMoney(document.gross)}`
            : `${kind === 'purchase' ? 'Расход' : 'Доход'} ${formatMoney(saleIncomeAsGross ? document.gross : documentNet)}`
        return <li key={document.id}>
          <TimelineEvent
            amount={`${offset ? '−' : '+'} ${formatMoney(documentVat)}`}
            positive={!offset}
            status={timelineStatus(document.kind)}
            title={document.title.replace(` от ${document.contractor}`, '')}
            description={document.description ?? fallbackDescription}
          />
        </li>
      })}
    </ul> : <p className="tcd__vat-context" role="status">В этом квартале операций этого типа нет.</p>}
  </>
}