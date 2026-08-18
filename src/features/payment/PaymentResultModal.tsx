import { useEffect, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@ds/components/Button'
import './PaymentResultModal.css'

/**
 * Результат флоу (успех) — как `FlowResultModal` в «Пульсе», пересобрано на токенах
 * и кнопке DS: модалка с зелёной галочкой, текстом и кнопкой «Готово».
 */
export default function PaymentResultModal({
  title,
  children,
  buttonLabel = 'Готово',
  onDone,
}: {
  title: string
  children: ReactNode
  buttonLabel?: string
  onDone: () => void
}) {
  // Esc закрывает; блокируем прокрутку фона.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onDone])

  return (
    <div className="prm-overlay">
      <div className="prm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="prm__header" aria-hidden />
        <div className="prm__body">
          <span className="prm__badge" aria-hidden>
            <Check size={24} strokeWidth={2} />
          </span>
          <div className="prm__content">
            <h2 className="prm__title">{title}</h2>
            <div className="prm__text">{children}</div>
          </div>
        </div>
        <div className="prm__footer">
          <Button className="prm__btn" visualVariant="Primary" onClick={onDone}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
