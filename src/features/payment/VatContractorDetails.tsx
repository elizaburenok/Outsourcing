import { useState } from 'react'
import { Cell } from '@ds/components/Cell'
import { Chip } from '@ds/components/Chip'
import { TimelineEvent } from '@ds/components/TimelineEvent'
import { formatMoney } from '@/lib/format'
import { pluralOps } from '@/lib/plural'
import { vatForDocument, vatIncludedInGross, type VatDocument, type VatKind, type VatRate, type VatSection } from '@/data/vat'

type Category = 'sale' | 'purchase'
type Filter = 'all' | 'sale' | 'advance'

const colors = [
  'var(--color-category-indigo)', 'var(--color-category-orchid)',
  'var(--color-category-sand)', 'var(--color-category-amethyst)',
] as const
const labels: Record<VatKind, string> = {
  sale: 'Продажа', purchase: 'Покупка', advance: 'Предоплата от покупателя', advanceOffset: 'Предоплата учтена в продаже',
}
const summaryLabels: Record<VatKind, string> = {
  sale: 'Продажи', purchase: 'Покупки',
  advance: 'Предоплата от покупателя', advanceOffset: 'Предоплата учтена в продаже',
}
function dateKey(title: string) {
  const date = title.match(/(\d{2})\.(\d{2})\.(\d{4})/)
  return date ? `${date[3]}-${date[2]}-${date[1]}` : ''
}
function initials(name: string) {
  return name.replace(/^(ООО|АО|ИП)\s*/, '').replace(/^[«"]/, '').slice(0, 2).toUpperCase()
}
function sumGross(documents: VatDocument[]) {
  return Math.round(documents.reduce((sum, document) => sum + document.gross, 0) * 100) / 100
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
    ? section.kind === 'purchase' : section.kind !== 'purchase')
  const byContractor = new Map<string, VatDocument[]>()
  for (const document of sections.flatMap((section) => section.documents)) {
    const items = byContractor.get(document.contractor) ?? []
    items.push(document)
    byContractor.set(document.contractor, items)
  }
  const groups = [...byContractor].map(([name, items]) => {
    const offsets = sumGross(items.filter((item) => item.kind === 'advanceOffset'))
    const total = Math.round((sumGross(items.filter((item) => item.kind !== 'advanceOffset')) - offsets) * 100) / 100
    return { name, items, total, offsets }
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'ru'))
  const selected = groups.find((group) => group.name === selectedName)
  const documents = selected?.items.filter((document) => filter === 'all' || document.kind === filter
    || (filter === 'advance' && document.kind === 'advanceOffset'))
    .sort((a, b) => dateKey(b.title).localeCompare(dateKey(a.title))) ?? []

  if (!selected) return <>
    {showTotal && <div className="tcd__category-intro">
      <p className="tcd__category-total">{formatMoney(Math.round(groups.reduce((sum, group) => sum + group.total, 0) * 100) / 100)}</p>
    </div>}
    <ul className="tcd__list tcd__contractor-list" aria-label="Контрагенты">
      {groups.map((group, index) => <li key={group.name}>
        <button type="button" className="tcd__contractor-button" onClick={() => onSelect?.(group.name)}
          aria-label={`Операции: ${group.name}`}>
          <Cell textScale="M" edgePadding="off" verticalSpacing="none"
            leftAccessory={<span className="tcd__avatar" style={{ background: colors[index % colors.length] }} aria-hidden>{initials(group.name)}</span>}
            title={group.name} description={pluralOps(group.items.length)}
            rightAccessory={<span className="tcd__contractor-amount">{formatMoney(group.total)}
              {group.offsets > 0 && <small>Зачтено {formatMoney(group.offsets)}</small>}</span>} />
        </button>
      </li>)}
    </ul>
  </>

  return <>
    {kind === 'sale' && <div className="tcd__filters" role="group" aria-label="Тип операции">
      {([['all', 'Все'], ['sale', 'Продажи'], ['advance', 'Авансы']] as const).map(([id, label]) =>
        <Chip key={id} chipType="Tab" isSelected={filter === id} aria-pressed={filter === id}
          onClick={() => setFilter(id)}>{label}</Chip>)}
    </div>}
    <section className="tcd__detail-summary" aria-label={`Сводка: ${selected.name}`}>
      {sections.filter((section) => section.kind !== 'advanceOffset' && section.documents.some((document) => document.contractor === selected.name)).map((section) =>
        <div className="tcd__detail-summary-row" key={section.kind}>
          <span>{summaryLabels[section.kind]}</span>
          <strong>{formatMoney(sumGross(section.documents.filter((document) => document.contractor === selected.name)))}</strong>
        </div>)}
    </section>
    {documents.length ? <ul className="tcd__timeline" aria-label="Документы контрагента">
      {documents.map((document) => {
        const positive = document.kind === 'sale' || document.kind === 'advance'
        return <li key={document.id}><TimelineEvent positive={positive}
          amount={`${positive ? '+' : '−'}${formatMoney(document.gross)}`}
          status={`НДС ${formatMoney(document.kind === 'purchase' ? document.vat ?? vatIncludedInGross(document.gross, 22) : vatForDocument(document, vat.rate))}`}
          title={labels[document.kind]}
          description={document.title.replace(` от ${document.contractor}`, '')} /></li>
      })}
    </ul> : <p className="tcd__vat-context" role="status">В этом квартале операций этого типа нет.</p>}
  </>
}
