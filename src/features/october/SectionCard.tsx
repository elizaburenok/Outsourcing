import type { LucideIcon } from 'lucide-react'
import Card from '@/components/ui/Card'

/**
 * Плитка раздела на Главной (Операции / ЕНС / Сотрудники).
 * Стили `.section-card*` — в AugustView.css.
 */
export default function SectionCard({
  icon: Icon,
  title,
  note,
  badge,
  onClick,
}: {
  icon: LucideIcon
  title: string
  note?: string
  /** Счётчик в правом верхнем углу (напр. число отчётов, ждущих ответа). */
  badge?: number
  onClick?: () => void
}) {
  return (
    <Card
      className={`section-card ${onClick ? 'section-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="section-card__top">
        <span className="section-card__icon">
          <Icon size={22} strokeWidth={1.75} />
        </span>
        {badge != null && badge > 0 && <span className="section-card__badge">{badge}</span>}
      </div>
      <div className="section-card__text">
        <p className="section-card__title">{title}</p>
        {note && <p className="section-card__note">{note}</p>}
      </div>
    </Card>
  )
}
