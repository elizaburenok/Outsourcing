import { formatMoney } from '@/lib/format'
import type { TotalDueContent } from './domain'
import './TotalDueWidget.css'

/**
 * Виджет общей суммы к уплате по всем налогам и взносам (макет 892-86541) — в правой
 * колонке Кейса 2 (см. `PageShell.rightRail`), рядом с основным контентом. Просто
 * карточка-рамка на токенах DS, не компонент `@ds/components/Widget` (тот —
 * фиксированный шаблон с заголовком/строками/футером под другой сценарий
 * использования и не подходит для одной суммы + подписи).
 */
export default function TotalDueWidget({ content }: { content: TotalDueContent }) {
  return (
    <div className="total-due-widget">
      <p className="total-due-widget__amount">{formatMoney(content.amount)}</p>
      <p className="total-due-widget__subtitle">{content.subtitle}</p>
    </div>
  )
}
