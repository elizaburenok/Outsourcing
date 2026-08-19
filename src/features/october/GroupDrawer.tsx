import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { formatMoney } from '@/lib/format'
import { payTo } from '@/routes'
import { usePayments } from '@/state/PaymentsProvider'
import { pluralPayments, type AugustPayment } from '@/data/august'
import PaymentRow from '@/features/august/PaymentRow'
import PaymentResultModal from '@/features/payment/PaymentResultModal'
import './GroupDrawer.css'

/**
 * Дровер группы налогов справа — обобщение OverdueDrawer. Открывается, когда в группе
 * несколько налогов к уплате. Собран на DS `Drawer`/`DrawerHeader`/`DrawerFooter` (как
 * `TaxCalcDrawer`): сумма — сразу под заголовком, список — кликабельные строки-платежи
 * (ведут на уплату), в футере — кнопка «Уплатить всё» разом.
 */
export default function GroupDrawer({
  open,
  title,
  totalLabel = 'Всего к уплате',
  totalLabelTone = 'neutral',
  payAllLabel = 'Уплатить всё',
  items,
  onClose,
}: {
  open: boolean
  title: string
  totalLabel?: string
  /** "error" — для «Просрочено», где подпись предупреждает о срочности. */
  totalLabelTone?: 'neutral' | 'error'
  payAllLabel?: string
  items: AugustPayment[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { markPaid } = usePayments()
  const [showResult, setShowResult] = useState(false)

  if (!open) return null
  const total = items.reduce((sum, p) => sum + p.amount, 0)

  function payAll() {
    items.forEach((p) => markPaid(p.id))
    setShowResult(true)
  }

  function finishResult() {
    setShowResult(false)
    onClose()
  }

  return (
    <>
      <Drawer open={open} onClose={onClose} side="right" aria-label={title}>
        <DrawerHeader onClose={onClose}>{title}</DrawerHeader>

        <div className="gd__body">
          <div className="gd__total">
            <span className="gd__total-amount">{formatMoney(total)}</span>
            <span
              className={`gd__total-label ${totalLabelTone === 'error' ? 'gd__total-label--error' : ''}`}
            >
              {totalLabel}
            </span>
          </div>

          <div className="gd__list">
            {items.map((p) => (
              <div key={p.id} className="gd__row">
                <PaymentRow
                  payment={p}
                  edgePadding="off"
                  onClick={() => {
                    onClose()
                    navigate(payTo(p.id))
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter type="1 Button" primaryAction={{ label: payAllLabel, onClick: payAll }} />
      </Drawer>

      {showResult && (
        <PaymentResultModal title="Платежи отправлены" onDone={finishResult}>
          <p>
            Отправили {pluralPayments(items.length)} на {formatMoney(total)}.
          </p>
          <p>Информация по платежам появится в ленте событий в течение 5 минут.</p>
        </PaymentResultModal>
      )}
    </>
  )
}
