import { useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import { USN_CALC, getCalcBreakdown, type Payable, type CalcBreakdown } from '@/data/payment'
import type { PayCategory } from '@/data/august'
import { pluralOps } from '@/lib/plural'
import { getVatCalculation, vatForDocument, type VatContractor } from '@/data/vat'
import './TaxCalcDrawer.css'

type RateCategory = Extract<PayCategory, 'ndfl' | 'vznos' | 'travma'>

const RATE_HEADING: Record<RateCategory, string> = {
  ndfl: 'НДФЛ с зарплаты',
  vznos: 'Страховые взносы',
  travma: 'Взносы на травматизм',
}

const RATE_LINE_LABEL: Record<RateCategory, string> = {
  ndfl: 'Начисленную зарплату за период умножаем на ставку НДФЛ',
  vznos: 'Фонд оплаты труда за период умножаем на тариф страховых взносов',
  travma: 'Фонд оплаты труда за период умножаем на тариф взносов на травматизм',
}

const RATE_HINT: Record<RateCategory, string> = {
  ndfl: 'НДФЛ считается от начисленной зарплаты автоматически — проверьте, что начисления за период отражены верно.',
  vznos: 'Взносы считаются от фонда оплаты труда автоматически — проверьте, что начисления за период отражены верно.',
  travma: 'Тариф зависит от класса профриска компании — проверьте, что он указан верно в СФР.',
}

/**
 * Дровер «Расчёт налога» — почему такая сумма. Для УСН «Доходы» — детальный разбор
 * с доходом по контрагентам (модель сверена с референс-скрином). Для остальных
 * налогов и взносов (НДФЛ, страховые взносы, взносы на травматизм) — база
 * начисления × тариф. Для зарплаты директора дровера нет — это не налог.
 * Собран на компоненте DS Drawer (side="right").
 */
export default function TaxCalcDrawer({
  payable,
  open,
  onClose,
}: {
  payable: Payable
  open: boolean
  onClose: () => void
}) {
  const calc = getCalcBreakdown(payable)
  const vat = getVatCalculation(payable, payable.vatRate ?? 5)
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'sale' | 'advance'>('all')
  if (!calc && !vat) return null
  const contractor = vat?.contractors.find((item) => item.id === selectedContractor)
  const close = () => {
    setSelectedContractor(null)
    setFilter('all')
    onClose()
  }

  return (
    <Drawer open={open} onClose={close} side="right" aria-label="Расчёт налога" className={vat ? 'tcd--vat' : undefined}>
      <DrawerHeader onClose={close}>
        {contractor && <button type="button" className="tcd__back" aria-label="К расчёту НДС" onClick={() => setSelectedContractor(null)}><ArrowLeft size={24} /></button>}
        {contractor ? contractor.name : 'Расчёт налога'}
      </DrawerHeader>

      <div className="tcd__body">
        {vat ? (
          contractor ? (
            <VatContractorDetail contractor={contractor} vat={vat} filter={filter} onFilter={setFilter} />
          ) : (
            <VatCalc vat={vat} onSelect={(id) => { setFilter('all'); setSelectedContractor(id) }} />
          )
        ) : calc?.kind === 'usn' ? (
          <UsnCalc />
        ) : calc ? (
          <RateCalc category={payable.category as RateCategory} calc={calc} />
        ) : null}
      </div>

      {!vat && <DrawerFooter
        type="1 Button"
        primaryAction={
          calc?.kind === 'usn'
            ? { label: 'Добавить операцию', onClick: onClose }
            : { label: 'Понятно', onClick: onClose }
        }
      />}
    </Drawer>
  )
}

type VatCalculation = NonNullable<ReturnType<typeof getVatCalculation>>

function VatCalc({ vat, onSelect }: { vat: VatCalculation; onSelect: (id: string) => void }) {
  return <>
    <h2 className="tcd__heading-title">НДС за {vat.quarter} квартал</h2>
    <div className="tcd__summary">
      <p className="tcd__hint">Персональный бухгалтер уже рассчитал НДС по закрывающим документам и авансовым платежам.</p>
      <p className="tcd__hint">Вам осталось проверить расчёт и уплатить налог.</p>
      <div className="tcd__line">
        <p className="tcd__line-label">Доход за {vat.quarter} квартал с учётом НДС</p>
        <p className="tcd__line-value">{formatMoney(vat.gross)}</p>
      </div>
      <div className="tcd__line">
        <p className="tcd__line-label">НДС за текущий квартал платится в следующем квартале: ежемесячно, равными частями</p>
        <p className="tcd__line-value">{formatMoney(vat.tax)} / 3 ≈ {formatMoney(vat.installments[0])}</p>
      </div>
    </div>
    <div className="tcd__income-head">
      <div><h3 className="tcd__income-title">НДС за {vat.quarter} квартал</h3><span className="tcd__row-ops">{vat.contractors.length} контрагента</span></div>
      <span className="tcd__income-total">{formatMoney(vat.tax)}</span>
    </div>
    <ul className="tcd__list">
      {vat.contractors.map((item) => {
        const income = item.documents.reduce((sum, document) => sum + document.gross, 0)
        const tax = item.documents.reduce((sum, document) => sum + vatForDocument(document, vat.rate), 0)
        return <li key={item.id}>
          <button type="button" className="tcd__contractor" onClick={() => onSelect(item.id)}>
            <Cell textScale="M" edgePadding="off" verticalSpacing="compact"
              leftAccessory={<span className="tcd__avatar" style={{ background: item.color }} aria-hidden>{item.initials}</span>}
              title={item.name} description={`${item.documents.length} ${item.documents.length === 1 ? 'документ' : 'документа'}`}
              rightAccessory={<span className="tcd__contractor-amount">{formatMoney(tax)}<small>Доход {formatMoney(income)}</small></span>}
            />
          </button>
        </li>
      })}
    </ul>
  </>
}

function VatContractorDetail({ contractor, vat, filter, onFilter }: {
  contractor: VatContractor
  vat: VatCalculation
  filter: 'all' | 'sale' | 'advance'
  onFilter: (value: 'all' | 'sale' | 'advance') => void
}) {
  const documents = contractor.documents.filter((document) => filter === 'all' || document.kind === filter)
  const allTax = contractor.documents.reduce((sum, document) => sum + vatForDocument(document, vat.rate), 0)
  const income = contractor.documents.reduce((sum, document) => sum + document.gross, 0)
  return <>
    <div className="tcd__filters" role="group" aria-label="Тип документов">
      {([['all', 'Все'], ['sale', 'НДС с продаж'], ['advance', 'НДС с предоплат']] as const).map(([value, label]) =>
        <button key={value} type="button" className={`tcd__filter ${filter === value ? 'tcd__filter--active' : ''}`} onClick={() => onFilter(value)}>{label}</button>
      )}
    </div>
    <div className="tcd__summary tcd__detail-summary">
      <div className="tcd__detail-line"><span>Доход с учётом НДС</span><strong>{formatMoney(income)}</strong></div>
      <div className="tcd__detail-line"><span>НДС к уплате</span><strong>{formatMoney(allTax)}</strong></div>
    </div>
    {documents.length ? <ul className="tcd__list">
      {documents.map((document) => <li key={document.id} className="tcd__document">
        <span><strong>{document.title}</strong><small>НДС {vat.rate}%</small></span>
        <span className="tcd__contractor-amount">{formatMoney(vatForDocument(document, vat.rate))}<small>Доход {formatMoney(document.gross)}</small></span>
      </li>)}
    </ul> : <p className="tcd__empty">Документов этого типа нет.</p>}
  </>
}

function UsnCalc() {
  const c = USN_CALC
  return (
    <>
      <div className="tcd__heading">
        <h2 className="tcd__heading-title">Налог по УСН «Доходы»</h2>
        <Info size={18} strokeWidth={2} className="tcd__heading-info" aria-hidden />
      </div>

      <div className="tcd__summary">
        <p className="tcd__hint">
          Убедитесь, что каждая <span className="tcd__accent">операция</span> относится к
          корректной системе налогообложения — тогда расчёт налога будет верным.
        </p>

        <div className="tcd__line">
          <p className="tcd__line-label">
            Ваш доход {c.periodLabel} умножаем на ставку {c.rate}%
          </p>
          <p className="tcd__line-value">
            {formatMoney(c.income)} × {c.rate}% = {formatMoney(c.taxBeforeDeduction)}
          </p>
        </div>

        <div className="tcd__line">
          <p className="tcd__line-label">Вычитаем страховые взносы и уплаченные авансы по УСН</p>
          <p className="tcd__line-value">− {formatMoney(c.deduction)}</p>
        </div>

        <div className="tcd__divider" />

        <div className="tcd__line">
          <p className="tcd__line-label">К уплате</p>
          <p className="tcd__line-value">{formatMoney(c.toPay)}</p>
        </div>
      </div>

      <div className="tcd__income-head">
        <h3 className="tcd__income-title">Доход по УСН в {c.yearLabel} году</h3>
        <span className="tcd__income-total">{formatMoney(c.income)}</span>
      </div>

      <ul className="tcd__list">
        {c.contractors.map((k) => (
          <li key={k.id} className="tcd__row">
            <span className="tcd__avatar" style={{ background: k.color }} aria-hidden>
              {k.initials}
            </span>
            <span className="tcd__row-text">
              <span className="tcd__row-name">{k.name}</span>
              <span className="tcd__row-ops">{pluralOps(k.ops)}</span>
            </span>
            <span className="tcd__row-amount">{formatMoney(k.amount)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function RateCalc({
  category,
  calc,
}: {
  category: RateCategory
  calc: Extract<CalcBreakdown, { kind: 'rate' }>
}) {
  const rateLabel = calc.ratePercent.toString().replace('.', ',')
  return (
    <>
      <div className="tcd__heading">
        <h2 className="tcd__heading-title">{RATE_HEADING[category]}</h2>
        <Info size={18} strokeWidth={2} className="tcd__heading-info" aria-hidden />
      </div>

      <div className="tcd__summary">
        <p className="tcd__hint">{RATE_HINT[category]}</p>

        <div className="tcd__line">
          <p className="tcd__line-label">{RATE_LINE_LABEL[category]}</p>
          <p className="tcd__line-value">
            {formatMoney(calc.base)} × {rateLabel}% = {formatMoney(calc.tax)}
          </p>
        </div>

        <div className="tcd__divider" />

        <div className="tcd__line">
          <p className="tcd__line-label">К уплате</p>
          <p className="tcd__line-value">{formatMoney(calc.tax)}</p>
        </div>
      </div>
    </>
  )
}
