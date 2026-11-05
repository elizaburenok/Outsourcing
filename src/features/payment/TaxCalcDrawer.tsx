import { useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import { USN_CALC, getCalcBreakdown, type Payable, type CalcBreakdown } from '@/data/payment'
import type { PayCategory } from '@/data/august'
import { pluralOps } from '@/lib/plural'
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
  vatView = 'screens',
}: {
  payable: Payable
  open: boolean
  onClose: () => void
  vatView?: 'screens' | 'accordion'
}) {
  const calc = getCalcBreakdown(payable)
  const vat = getVatCalculation(payable)
  const [selectedKind, setSelectedKind] = useState<'sale' | 'purchase' | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [expandedKind, setExpandedKind] = useState<'sale' | 'purchase' | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const savedScrollTop = useRef(0)
  const accordion = vatView === 'accordion' && !!vat
  const close = () => { setSelectedName(null); setSelectedKind(null); setExpandedKind(null); savedScrollTop.current = 0; onClose() }
  const back = () => {
    if (selectedName) {
      setSelectedName(null)
      if (accordion) setSelectedKind(null)
    } else setSelectedKind(null)
  }
  const sectionTitle = selectedKind === 'sale' ? 'Продажи' : selectedKind === 'purchase' ? 'Покупки' : 'Расчёт налога'
  useLayoutEffect(() => {
    if (accordion && open && !selectedKind && !selectedName && bodyRef.current) {
      bodyRef.current.scrollTop = savedScrollTop.current
    }
  }, [accordion, open, selectedKind, selectedName])
  if (!calc && !vat) return null

  return (
    <Drawer open={open} onClose={close} side="right" aria-label={selectedName ? `Операции: ${selectedName}` : sectionTitle} className={vat ? 'tcd--vat' : undefined}>
      <DrawerHeader onClose={close}
        backAction={selectedKind ? { onClick: back, label: selectedName ? accordion ? 'Назад к расчёту налога' : 'Назад к контрагентам' : 'Назад к расчёту налога', icon: <img src={backIcon} alt="" /> } : undefined}
        closeIcon={selectedKind ? <img src={closeIcon} alt="" /> : undefined}>
        {selectedName ?? sectionTitle}
      </DrawerHeader>

      <div ref={bodyRef} key={`${selectedKind ?? 'summary'}-${selectedName ?? ''}`} className={`tcd__body${selectedKind ? ' tcd__body--details' : ''}`}>
        {vat && selectedKind ? <VatCategoryDetails kind={selectedKind} vat={vat} selectedName={selectedName} onSelect={setSelectedName} /> : vat ? (
          <VatCalc vat={vat} payable={payable} accordion={accordion} expandedKind={expandedKind} onExpand={setExpandedKind} onSelect={setSelectedKind} onSelectContractor={(kind, name) => { savedScrollTop.current = bodyRef.current?.scrollTop ?? 0; setSelectedKind(kind); setSelectedName(name) }} />
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

function VatCalc({ vat, payable, accordion, expandedKind, onExpand, onSelect, onSelectContractor }: {
  vat: VatCalculation
  payable: Payable
  accordion: boolean
  expandedKind: 'sale' | 'purchase' | null
  onExpand: (kind: 'sale' | 'purchase' | null) => void
  onSelect: (kind: 'sale' | 'purchase') => void
  onSelectContractor: (kind: 'sale' | 'purchase', name: string) => void
}) {
  const [sales, advances, offsets, purchases] = vat.sections
  const salesGross = Math.round((sales.gross + advances.gross - offsets.gross) * 100) / 100
  const salesVat = Math.round((sales.vat + advances.vat - offsets.vat) * 100) / 100
  const categories = [
    { kind: 'purchase' as const, title: 'Покупки', amount: purchases.gross },
    { kind: 'sale' as const, title: 'Продажи', amount: salesGross },
  ]
  return <>
    <div className="tcd__heading">
      <h2 className="tcd__heading-title">НДС за {vat.quarter} квартал 2026</h2>
    </div>
    <div className="tcd__summary tcd__summary--vat-design">
      <p className="tcd__hint">Бухгалтер посчитал налог к уплате</p>
      <div className="tcd__line">
        <p className="tcd__line-label">Продажи за {vat.quarter} квартал с учётом НДС</p>
        <p className="tcd__line-value">{formatMoney(salesGross)}</p>
      </div>
      <div className="tcd__line">
        <p className="tcd__line-label">Покупки за {vat.quarter} квартал с учётом НДС</p>
        <p className="tcd__line-value">{formatMoney(purchases.gross)}</p>
      </div>
      <div className="tcd__line">
        <p className="tcd__line-label">НДС за квартал{vat.rate === 22 ? ': из НДС с продаж вычитаем НДС с покупок' : ''}</p>
        <p className="tcd__line-value">{vat.rate === 22 ? <>{formatMoney(salesVat)} − {formatMoney(purchases.vat)} = </> : null}{formatMoney(vat.tax)}</p>
      </div>
      {vat.rate !== 22 && <p className="tcd__vat-context">При ставке {vat.rate}% входной НДС с покупок не принимается к вычету.</p>}
      <div className="tcd__line">
        <p className="tcd__line-label">НДС за текущий квартал платится в следующем квартале: ежемесячно, тремя частями. {payable.subtitle || 'Текущий платёж'}{payable.dueLabel ? ` — до ${payable.dueLabel}` : ''}</p>
        <p className="tcd__line-value">{formatMoney(payable.amount)}</p>
      </div>
    </div>
    <div className="tcd__income-head"><h3 className="tcd__income-title">НДС с операций</h3></div>
    <div className="tcd__list tcd__category-list">
      {categories.map(({ kind, title, amount }) => <section className="tcd__accordion-section" key={kind}>
        <button type="button" className="tcd__contractor-button" onClick={() => accordion ? onExpand(expandedKind === kind ? null : kind) : onSelect(kind)}
          aria-expanded={accordion ? expandedKind === kind : undefined} aria-controls={accordion && expandedKind === kind ? `vat-${kind}-contractors` : undefined}>
          <Cell textScale="M" edgePadding="off" verticalSpacing="none" title={title}
            rightAccessory={<span className="tcd__category-accessory"><span className="tcd__contractor-amount">{formatMoney(amount)}</span>
              {accordion && <ChevronDown className={expandedKind === kind ? 'tcd__chevron tcd__chevron--open' : 'tcd__chevron'} size={20} aria-hidden />}</span>} />
        </button>
        {accordion && expandedKind === kind && <div id={`vat-${kind}-contractors`} className="tcd__accordion-content">
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
