import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import { CellRightAccessory } from '@ds/components/CellRightAccessory'
import { Button } from '@ds/components/Button'
import { ACCOUNTS, type Account, type AccountKind } from '@/data/accounts'
import './AccountSelectModal.css'

/**
 * Аватар счёта (макет 1178-16297): рублёвый счёт — кружок-флаг (триколор), карта —
 * брендовый кружок с иконкой карты. Флаг — иллюстративная графика с собственными цветами
 * (как логотип), не тема UI, поэтому его цвета заданы в CSS напрямую.
 */
function AccountAvatar({ kind }: { kind: AccountKind }) {
  return (
    <span className={`asm-avatar asm-avatar--${kind}`} aria-hidden>
      {kind === 'card' ? <CreditCard size={20} strokeWidth={2} /> : null}
    </span>
  )
}

/**
 * Модалка выбора счёта списания — шаг между «Уплатить» в дровере и результатом (макет
 * 1178-16236, фрейм «Выберите счёт»). Список счетов радиокнопками: первый предвыбран,
 * можно перевыбрать другой. По «Выбрать» отдаёт выбранный счёт наверх. Собрана на DS
 * `Cell` + `CellRightAccessory[Radio]` + `Button`; шелл модалки — по образцу
 * `PaymentResultModal`.
 */
export default function AccountSelectModal({
  title = 'Выберите счёт',
  accounts = ACCOUNTS,
  submitLabel = 'Выбрать',
  onSelect,
  onClose,
}: {
  title?: string
  accounts?: Account[]
  submitLabel?: string
  /** Вызывается по «Выбрать» с id выбранного счёта. */
  onSelect: (accountId: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState(() => accounts[0]?.id ?? '')

  // Esc закрывает; блокируем прокрутку фона (как в PaymentResultModal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="asm-overlay" onClick={onClose}>
      <div
        className="asm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="asm__header">
          <h2 className="asm__title">{title}</h2>
          <button type="button" className="asm__close" onClick={onClose} aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="asm__list" role="radiogroup" aria-label={title}>
          {accounts.map((a) => (
            <div
              key={a.id}
              className="asm__row"
              role="radio"
              aria-checked={selected === a.id}
              tabIndex={0}
              onClick={() => setSelected(a.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(a.id)
                }
              }}
            >
              <Cell
                textScale="M"
                verticalSpacing="compact"
                edgePadding="off"
                title={a.title}
                description={a.subtitle}
                leftAccessory={<AccountAvatar kind={a.kind} />}
                rightAccessory={
                  <span className="asm__radio">
                    <CellRightAccessory kind="Radio" checked={selected === a.id} />
                  </span>
                }
              />
            </div>
          ))}
        </div>

        <div className="asm__footer">
          <Button
            className="asm__btn"
            visualVariant="Primary"
            onClick={() => selected && onSelect(selected)}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
