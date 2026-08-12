import { useEffect, type ReactNode } from 'react'
import { Button } from '@ds/components/Button'
import './OnboardingModal.css'

/**
 * Общая модалка онбординга по анатомии наших модалок (Figma):
 * картинка/иллюстрация сверху → контент → футер с кнопками.
 * Переиспользуется для чат-модалки (этап 1), входного анонса (этап 2) и финала.
 * Собрана на токенах DS и кнопке DS — без хардкода.
 */
export default function OnboardingModal({
  media,
  mediaTone = 'brand',
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: {
  /** Содержимое верхней иллюстрации (иконка/скрин). */
  media?: ReactNode
  mediaTone?: 'brand' | 'success'
  title: string
  children: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  /** Закрытие по Esc/клику по фону (если не задано — модалка обязательная). */
  onClose?: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (onClose ?? onSecondary ?? onPrimary)()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onSecondary, onPrimary])

  return (
    <div className="obm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="obm" role="dialog" aria-modal="true" aria-label={title}>
        {media && (
          <div className={`obm__media obm__media--${mediaTone}`} aria-hidden>
            {media}
          </div>
        )}
        <div className="obm__content">
          <h2 className="obm__title">{title}</h2>
          <div className="obm__text">{children}</div>
        </div>
        <div className="obm__footer">
          {secondaryLabel && onSecondary && (
            <Button className="obm__btn" visualVariant="Secondary" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button className="obm__btn" visualVariant="Primary" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Список выгод-буллетов для тела модалки (единый вид для всех модалок онбординга). */
export function ModalBullets({ items }: { items: string[] }) {
  return (
    <ul className="obm__bullets">
      {items.map((it, i) => (
        <li key={i} className="obm__bullet">
          {it}
        </li>
      ))}
    </ul>
  )
}
