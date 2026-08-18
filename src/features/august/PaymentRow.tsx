import { Clock } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { formatMoney } from '@/lib/format'
import type { AugustPayment, PayCategory } from '@/data/august'
import contributionsLogo from '@ds/src/logo/Contributions.png'
import taxesLogo from '@ds/src/logo/Taxes.png'
import avatarLogo from '@ds/src/logo/Avatar.png'
import '@/features/payments/payment-row.css'
import './AugustView.css'

/** Лого-иконка категории (из DS `src/logo`). Общий словарь для строки платежа во всех местах. */
export const CATEGORY: Record<PayCategory, string> = {
  ndfl: taxesLogo,
  travma: contributionsLogo,
  salary: avatarLogo,
  vznos: contributionsLogo,
  usn: taxesLogo,
  nds: taxesLogo,
}

export function PayIcon({ category, muted = false }: { category: PayCategory; muted?: boolean }) {
  return (
    <img
      className={`pay-logo ${muted ? 'pay-logo--muted' : ''}`}
      src={CATEGORY[category]}
      alt=""
    />
  )
}

/**
 * Лого-иконка платежа с бейджем-часами (для состояния «ещё считается»). Часы у аватара
 * сигналят: сумма пока не финальна, платёж впереди. Цвет бейджа — Category/Flamingo (DS).
 */
export function PayIconPending({ category }: { category: PayCategory }) {
  return (
    <span className="pay-logo-wrap">
      <img className="pay-logo" src={CATEGORY[category]} alt="" />
      <span className="pay-badge" aria-hidden="true">
        <Clock size={10} strokeWidth={2.5} />
      </span>
    </span>
  )
}

export function paymentNote(p: AugustPayment) {
  const sfr = !p.viaEnp && p.category === 'travma' ? ' · в СФР, мимо ЕНП' : ''
  if (p.state === 'paid') return <span className="pay-note">Оплачено {p.paidLabel}</span>
  if (p.state === 'process')
    return <span className="pay-note">Рассчитаем до {p.dueLabel}</span>
  if (p.state === 'overdue')
    return (
      <span className="pay-note pay-note--overdue">
        Просрочено с {p.dueLabel}
        {sfr}
      </span>
    )
  return (
    <span className="pay-note">
      до {p.dueLabel}
      {sfr}
    </span>
  )
}

/** Строка одного платежа (иконка-категория · название · срок/статус · сумма). */
export default function PaymentRow({
  payment,
  onClick,
}: {
  payment: AugustPayment
  /** Если задан — строка кликабельна (ведёт на страницу уплаты). */
  onClick?: () => void
}) {
  const isProcess = payment.state === 'process'
  const cell = (
    <Cell
      textScale="M"
      verticalSpacing="compact"
      title={<span className="pay-title">{payment.title}</span>}
      description={paymentNote(payment)}
      leftAccessory={
        isProcess ? (
          <PayIconPending category={payment.category} />
        ) : (
          <PayIcon category={payment.category} />
        )
      }
      rightAccessory={
        isProcess ? undefined : (
          <span className={`pay-amount ${payment.state === 'paid' ? 'pay-amount--done' : ''}`}>
            {formatMoney(payment.amount)}
          </span>
        )
      }
    />
  )

  if (!onClick) return cell
  return (
    <button type="button" className="pay-row-btn" onClick={onClick}>
      {cell}
    </button>
  )
}
