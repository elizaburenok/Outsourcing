import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DrawerHeader } from '@ds/components/Drawer'
import { formatMoney } from '@/lib/format'
import { payTo } from '@/routes'
import { pluralPayments, type AugustPayment } from '@/data/august'
import PaymentRow from './PaymentRow'
import './OverdueDrawer.css'

/**
 * Дровер справа со списком просроченных платежей (паттерн из проекта «Пульс»,
 * пересобран на токенах DS и компоненте DrawerHeader). Открывается из свёрнутой
 * строки «N платежей просрочено» — вместо аккордеона внутри списка.
 */
export default function OverdueDrawer({
  open,
  items,
  onClose,
}: {
  open: boolean
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
    <div className="od-overlay" onClick={onClose}>
      <aside
        className="od"
        role="dialog"
        aria-modal="true"
        aria-label="Просроченные платежи"
        onClick={(e) => e.stopPropagation()}
      >
        <DrawerHeader onClose={onClose}>{pluralPayments(items.length)} просрочено</DrawerHeader>

        <div className="od__body">
          <p className="od__note">Уплатите как можно скорее — начисляются пени</p>

          <div className="od__list">
            {items.map((p, i) => (
              <div key={p.id} className="od__row">
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

          <div className="od__total">
            <span className="od__total-label">Всего просрочено</span>
            <span className="od__total-amount">{formatMoney(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
