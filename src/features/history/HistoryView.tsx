import { Cell } from '@ds/components/Cell'
import { Chip } from '@ds/components/Chip'
import { PayIcon } from '@/features/august/PaymentRow'
import { formatMoney } from '@/lib/format'
import { HISTORY, type HistoryMonth } from '@/data/history'
import type { AugustPayment } from '@/data/august'
import './HistoryView.css'

function HistoryRow({ payment }: { payment: AugustPayment }) {
  return (
    <Cell
      textScale="M"
      verticalSpacing="none"
      edgePadding="off"
      title={<span className="pay-title">{payment.title}</span>}
      description={<span className="pay-note">{formatMoney(payment.amount)}</span>}
      leftAccessory={<PayIcon category={payment.category} />}
    />
  )
}

function MonthGroup({ month }: { month: HistoryMonth }) {
  return (
    <section className="hist__group">
      <header className="hist__month">
        <Cell
          textScale="M"
          verticalSpacing="none"
          horizontalSpacing="off"
          edgePadding="off"
          title={<span className="hist__month-label">{month.label}</span>}
        />
      </header>
      {month.payments.map((p) => (
        <HistoryRow key={p.id} payment={p} />
      ))}
    </section>
  )
}

export default function HistoryView() {
  return (
    <div className="hist">
      <div className="hist__filters">
        <Chip chipType="Dropdown">Тип платежа</Chip>
        <Chip chipType="Dropdown">Дата</Chip>
      </div>

      {HISTORY.map((m) => (
        <MonthGroup key={m.id} month={m} />
      ))}
    </div>
  )
}
