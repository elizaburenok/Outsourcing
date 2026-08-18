import { Info } from 'lucide-react'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { formatMoney } from '@/lib/format'
import { USN_CALC, getCalcBreakdown, type Payable, type CalcBreakdown } from '@/data/payment'
import type { PayCategory } from '@/data/august'
import { pluralOps } from '@/lib/plural'
import './TaxCalcDrawer.css'

type RateCategory = Exclude<PayCategory, 'usn' | 'salary'>

const RATE_HEADING: Record<RateCategory, string> = {
  ndfl: 'НДФЛ с зарплаты',
  vznos: 'Страховые взносы',
  travma: 'Взносы на травматизм',
  nds: 'Налог по НДС',
}

const RATE_LINE_LABEL: Record<RateCategory, string> = {
  ndfl: 'Начисленную зарплату за период умножаем на ставку НДФЛ',
  vznos: 'Фонд оплаты труда за период умножаем на тариф страховых взносов',
  travma: 'Фонд оплаты труда за период умножаем на тариф взносов на травматизм',
  nds: 'Выручку за расчётный месяц умножаем на пониженную ставку НДС для УСН',
}

const RATE_HINT: Record<RateCategory, string> = {
  ndfl: 'НДФЛ считается от начисленной зарплаты автоматически — проверьте, что начисления за период отражены верно.',
  vznos: 'Взносы считаются от фонда оплаты труда автоматически — проверьте, что начисления за период отражены верно.',
  travma: 'Тариф зависит от класса профриска компании — проверьте, что он указан верно в СФР.',
  nds: 'Ставка 5% — без права на вычет входного НДС, применяется при доходе от 20 до 272,5 млн ₽ в год.',
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
  if (!calc) return null

  return (
    <Drawer open={open} onClose={onClose} side="right" aria-label="Расчёт налога">
      <DrawerHeader onClose={onClose}>Расчёт налога</DrawerHeader>

      <div className="tcd__body">
        {calc.kind === 'usn' ? (
          <UsnCalc />
        ) : (
          <RateCalc category={payable.category as RateCategory} calc={calc} />
        )}
      </div>

      <DrawerFooter
        type="1 Button"
        primaryAction={
          calc.kind === 'usn'
            ? { label: 'Добавить операцию', onClick: onClose }
            : { label: 'Понятно', onClick: onClose }
        }
      />
    </Drawer>
  )
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
