import { usePayments } from '@/state/PaymentsProvider'
import PaymentRow from '@/features/august/PaymentRow'
import { CASE2, type ObCaseData } from '@/data/case2'
import { completedSections } from './accounting'
import './AccountingView.css'

/**
 * Раздел «Бухучёт» — все выполненные платежи по налогам и взносам, сгруппированные по
 * периодам (текущий месяц + прошлые месяцы истории). Открывается плиткой «Бухучёт» на
 * Главной. Строки — общий `PaymentRow` (иконка · название · «Оплачено …» · сумма),
 * некликабельные: это уже закрытые операции.
 */
export default function AccountingView({ data = CASE2 }: { data?: ObCaseData }) {
  const { isPaid } = usePayments()
  const sections = completedSections(data, isPaid)

  if (sections.length === 0) {
    return <p className="acc__empty">Пока нет выполненных платежей.</p>
  }

  return (
    <div className="acc">
      {sections.map((s) => (
        <section key={s.id} className="acc__group">
          <p className="acc__group-label">{s.label}</p>
          <div className="acc__list">
            {s.payments.map((p) => (
              <PaymentRow key={p.id} payment={p} edgePadding="off" verticalSpacing="none" />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
