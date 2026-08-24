import type { CardContent, CardTone } from './domain'
import './CategoryCard.css'

interface Props {
  label: string
  tone: CardTone
  content: CardContent
  /** Кликабельна ли карточка (false для домена, где всё в `process`, или ничего не открыто). */
  interactive: boolean
  /** Значение `data-coach` для якоря онбординга (напр. «tasks» у карточки «Отчётность»). */
  coach?: string
  onClick?: () => void
}

/**
 * Карточка домена на Главной — «глупый» шаблон (аналог `RiskCard` из Пульса).
 * Цвет и текст задаёт визуальный тон (`tone`); фон — на токенах DS
 * (bg-neutral/success/warning/error). Некликабельна, когда `interactive === false`.
 */
export default function CategoryCard({ label, tone, content, interactive, coach, onClick }: Props) {
  return (
    <button
      type="button"
      data-coach={coach}
      className={`category-card category-card--${tone}${interactive ? ' category-card--interactive' : ''}`}
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
    >
      <span className="category-card__label">{label}</span>
      <span className="category-card__body">
        <span className="category-card__title">{content.title}</span>
        <span className="category-card__subtitle">{content.subtitle}</span>
      </span>
    </button>
  )
}
