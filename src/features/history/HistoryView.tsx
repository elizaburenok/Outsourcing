import { Cell } from '@ds/components/Cell'
import Card from '@/components/ui/Card'
import { PayIcon } from '@/features/payments/categoryIcon'
import { formatMoney } from '@/lib/format'
import { HISTORY, historyCount, historyTotal, type HistoryMonth } from '@/data/history'
import type { AugustPayment } from '@/data/august'
import './HistoryView.css'

function HistoryRow({ payment }: { payment: AugustPayment }) {
  const sfr = !payment.viaEnp && payment.category === 'travma' ? ' · в СФР, мимо ЕНП' : ''
  return (
    <Cell
      textScale="M"
      verticalSpacing="compact"
      title={<span className="pay-title">{payment.title}</span>}
      description={
        <span className="pay-note">
          Оплачено {payment.paidLabel}
          {sfr}
        </span>
      }
      leftAccessory={<PayIcon category={payment.category} />}
      rightAccessory={<span className="pay-amount pay-amount--done">{formatMoney(payment.amount)}</span>}
    />
  )
}

function MonthGroup({ month }: { month: HistoryMonth }) {
  return (
    <section className="hist__group">
      <header className="hist__month">
        <span className="hist__month-label">{month.label}</span>
        <span className="hist__month-total">{formatMoney(month.total)}</span>
      </header>
      <Card className="hist__list">
        {month.payments.map((p, i) => (
          <div key={p.id} className="hist__row">
            {i > 0 && <div className="hist__divider" />}
            <HistoryRow payment={p} />
          </div>
        ))}
      </Card>
    </section>
  )
}

export default function HistoryView() {
  const total = historyTotal(HISTORY)
  const count = historyCount(HISTORY)

  return (
    <div className="hist">
      <header className="hist__header">
        <p className="hist__amount">{formatMoney(total)}</p>
        <p className="hist__amount-label">Уплачено за прошлые месяцы · {count} операций</p>
      </header>

      {HISTORY.map((m) => (
        <MonthGroup key={m.id} month={m} />
      ))}
    </div>
  )
}
