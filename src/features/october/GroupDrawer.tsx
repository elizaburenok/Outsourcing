import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DrawerHeader } from '@ds/components/Drawer'
import { formatMoney } from '@/lib/format'
import { payTo } from '@/routes'
import type { AugustPayment } from '@/data/august'
import PaymentRow from '@/features/august/PaymentRow'
import './GroupDrawer.css'

/**
 * Дровер группы налогов справа — обобщение OverdueDrawer. Открывается, когда в группе
 * несколько налогов к уплате. Список — кликабельные строки-платежи (ведут на уплату),
 * снизу — итог по группе. Параметризован заголовком, подписью и её тоном.
 */
export default function GroupDrawer({
  open,
  title,
  note,
  noteTone = 'neutral',
  totalLabel = 'Всего к уплате',
  items,
  onClose,
}: {
  open: boolean
  title: string
  note?: string
  noteTone?: 'error' | 'neutral'
  totalLabel?: string
  items: AugustPayment[]
  onClose: () => void
}) {
  const navigate = useNavigate()
  // Esc закрывает; блокируем прокрутку фона, пока дровер открыт.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  const total = items.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="gd-overlay" onClick={onClose}>
      <aside
        className="gd"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <DrawerHeader onClose={onClose}>{title}</DrawerHeader>

        <div className="gd__body">
          {note && (
            <p className={`gd__note ${noteTone === 'error' ? 'gd__note--error' : ''}`}>{note}</p>
          )}

          <div className="gd__list">
            {items.map((p, i) => (
              <div key={p.id} className="gd__row">
                {i > 0 && <div className="av__divider" />}
                <PaymentRow
                  payment={p}
                  onClick={() => {
                    onClose()
                    navigate(payTo(p.id))
                  }}
                />
              </div>
            ))}
          </div>

          <div className="gd__total">
            <span className="gd__total-label">{totalLabel}</span>
            <span className="gd__total-amount">{formatMoney(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
