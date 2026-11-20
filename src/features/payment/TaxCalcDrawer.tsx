import { useLayoutEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { AccordeonCell } from '@ds/components/AccordeonCell'
import { formatMoney } from '@/lib/format'
import { USN_CALC, getCalcBreakdown, type Payable, type CalcBreakdown } from '@/data/payment'
import type { PayCategory } from '@/data/august'
import { pluralOps, pluralContractors } from '@/lib/plural'
import { getVatCalculation } from '@/data/vat'
import { VatCategoryDetails } from './VatContractorDetails'
import backIcon from './assets/figma-arrow-left.svg'
import closeIcon from './assets/figma-close.svg'
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
  const vat = getVatCalculation(payable)
  const [selectedContractor, setSelectedContractor] = useState<{ kind: 'sale' | 'purchase'; name: string } | null>(null)
  const [expandedKind, setExpandedKind] = useState<'sale' | 'purchase' | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const savedScrollTop = useRef(0)
  const close = () => { setSelectedContractor(null); setExpandedKind(null); savedScrollTop.current = 0; onClose() }
  useLayoutEffect(() => {
    if (open && !selectedContractor && bodyRef.current) {
      bodyRef.current.scrollTop = savedScrollTop.current
    }
  }, [open, selectedContractor])
  if (!calc && !vat) return null

  return (
    <Drawer open={open} onClose={close} side="right" aria-label={selectedContractor ? `Документы: ${selectedContractor.name}` : 'Расчёт налога'} className={vat ? 'tcd--vat' : undefined}>
      <DrawerHeader onClose={close}
        subtitle={selectedContractor ? selectedContractor.kind === 'purchase' ? 'Покупка' : 'Продажа' : undefined}
        backAction={selectedContractor ? { onClick: () => setSelectedContractor(null), label: 'Назад к расчёту налога', icon: <img src={backIcon} alt="" /> } : undefined}
        closeIcon={selectedContractor ? <img src={closeIcon} alt="" /> : undefined}>
        {selectedContractor?.name ?? 'Расчёт налога'}
      </DrawerHeader>

      <div ref={bodyRef} key={selectedContractor?.name ?? 'summary'} className={`tcd__body${selectedContractor ? ' tcd__body--details' : ''}`}>
        {vat && selectedContractor ? <VatCategoryDetails kind={selectedContractor.kind} vat={vat} selectedName={selectedContractor.name} /> : vat ? (
          <VatCalc vat={vat} payable={payable} expandedKind={expandedKind} onExpand={setExpandedKind} onSelectContractor={(kind, name) => { savedScrollTop.current = bodyRef.current?.scrollTop ?? 0; setSelectedContractor({ kind, name }) }} />
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

function VatCalc({ vat, payable, expandedKind, onExpand, onSelectContractor }: {
  vat: VatCalculation
  payable: Payable
  expandedKind: 'sale' | 'purchase' | null
  onExpand: (kind: 'sale' | 'purchase' | null) => void
  onSelectContractor: (kind: 'sale' | 'purchase', name: string) => void
}) {
  const [sales, advances, offsets, purchases, purchaseAdvances, purchaseOffsets] = vat.sections
  const salesVat = Math.round((sales.vat + advances.vat - offsets.vat) * 100) / 100
  const purchasesVat = Math.round((purchases.vat + purchaseAdvances.vat - purchaseOffsets.vat) * 100) / 100
  const categories = [
    { kind: 'sale' as const, title: 'Продажи', amount: salesVat,
      hasDocuments: [sales, advances, offsets].some((section) => section.documents.length > 0) },
    { kind: 'purchase' as const, title: 'Покупки', amount: purchasesVat,
      hasDocuments: [purchases, purchaseAdvances, purchaseOffsets].some((section) => section.documents.length > 0) },
  ].filter(({ hasDocuments }) => hasDocuments)
  const simpleRateDemo = payable.id.endsWith('c2-nds-q3-1') && vat.rate === 5
  return <>
    {!simpleRateDemo && <div className="tcd__heading">
      <h2 className="tcd__heading-title">НДС за {vat.quarter} квартал 2026</h2>
    </div>}
    <div className="tcd__summary tcd__summary--vat-design">
      {simpleRateDemo
        ? <p className="tcd__hint">Бухгалтер посчитал НДС по закрывающим документам и авансовым платежам.</p>
        : <p className="tcd__hint">{vat.penalty !== undefined ? 'Бухгалтер уточнил расчёт НДС к доплате' : 'Бухгалтер посчитал налог к уплате'}</p>}
      {simpleRateDemo && <div className="tcd__line">
        <p className="tcd__line-label">НДС за текущий квартал платится в следующем квартале: ежемесячно, равными частями</p>
        <p className="tcd__line-value">{formatMoney(vat.tax)} / 3 = {formatMoney(vat.installments[0])}</p>
      </div>}
      {purchaseAdvances.documents.length > 0 && <div className="tcd__line">
        <p className="tcd__line-label">НДС с покупок: по счетам-фактурам + с предоплаты − зачёт предоплаты</p>
        <p className="tcd__line-value">{formatMoney(purchases.vat)} + {formatMoney(purchaseAdvances.vat)} − {formatMoney(purchaseOffsets.vat)} = {formatMoney(purchasesVat)}</p>
      </div>}
      {!simpleRateDemo && <div className="tcd__line">
        <p className="tcd__line-label">{vat.penalty !== undefined ? 'НДС к доплате' : 'НДС за квартал'}{vat.rate === 22 ? ': из НДС с продаж вычитаем НДС с покупок' : ''}</p>
        <p className="tcd__line-value">{vat.rate === 22 ? <>{formatMoney(salesVat)} − {formatMoney(purchasesVat)} = </> : null}{formatMoney(vat.tax)}</p>
      </div>}
      {vat.rate === 7 && <p className="tcd__vat-context">При ставке {vat.rate}% входной НДС с покупок не принимается к вычету.</p>}
      {vat.tax === 0 && <p className="tcd__vat-context">Налог к уплате за квартал — 0 ₽: входной НДС {formatMoney(vat.deductionsVat)} переносится на следующий период (ст. 171 НК РФ).</p>}
      {!simpleRateDemo && <div className="tcd__line">
        <p className="tcd__line-label">{vat.penalty !== undefined ? 'Пени за просрочку' : vat.tax === 0
          ? 'Платёж по НДС за этот квартал формироваться не будет.'
          : <>НДС за текущий квартал платится в следующем квартале: ежемесячно, тремя частями. {payable.subtitle || 'Текущий платёж'}{payable.dueLabel ? ` — до ${payable.dueLabel}` : ''}</>}</p>
        <p className="tcd__line-value">{formatMoney(vat.penalty ?? vat.installments[0])}</p>
      </div>}
      {vat.penalty !== undefined && <div className="tcd__line">
        <p className="tcd__line-label">Всего к уплате</p>
        <p className="tcd__line-value">{formatMoney(vat.tax + vat.penalty)}</p>
      </div>}
    </div>
    <div className="tcd__income-head">
      <div>
        <h3 className="tcd__income-title">{simpleRateDemo ? `НДС за ${vat.quarter} квартал` : 'НДС с операций'}</h3>
        {simpleRateDemo && <p className="tcd__income-desc">{pluralContractors(vat.contractors.length)}</p>}
      </div>
      {simpleRateDemo && <span className="tcd__head-totals">
        <span className="tcd__head-total">{formatMoney(salesVat)}</span>
        <small>Доход {formatMoney(sales.gross + advances.gross - offsets.gross)}</small>
      </span>}
    </div>
    <div className="tcd__list tcd__category-list">
      {simpleRateDemo && <VatCategoryDetails kind="sale" vat={vat} selectedName={null} onSelect={(name) => onSelectContractor('sale', name)} showTotal={false} />}
      {!simpleRateDemo && categories.map(({ kind, title, amount }) => <section className="tcd__accordion-section" key={kind}>
        <button type="button" className="tcd__contractor-button" onClick={() => onExpand(expandedKind === kind ? null : kind)}
          aria-expanded={expandedKind === kind} aria-controls={expandedKind === kind ? `vat-${kind}-contractors` : undefined}>
          <AccordeonCell title={title} description={formatMoney(amount)} expanded={expandedKind === kind} />
        </button>
        {expandedKind === kind && <div id={`vat-${kind}-contractors`} className="tcd__accordion-content">
          <VatCategoryDetails kind={kind} vat={vat} selectedName={null} onSelect={(name) => onSelectContractor(kind, name)} showTotal={false} />
        </div>}
      </section>)}
    </div>
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
