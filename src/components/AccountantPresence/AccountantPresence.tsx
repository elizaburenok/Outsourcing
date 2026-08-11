import { MessageCircle } from 'lucide-react'
import './AccountantPresence.css'

/**
 * Присутствие персонального бухгалтера — сквозной элемент на всех экранах.
 * Не «поддержка в подвале»: показываем конкретного человека и статус «на связи».
 * Особенно важно для текущих клиентов, которых переводят из общего чата.
 */
export default function AccountantPresence() {
  return (
    <button className="accountant" type="button" aria-label="Чат с бухгалтером">
      <span className="accountant__avatar" aria-hidden>
        АК
        <span className="accountant__online" />
      </span>
      <span className="accountant__text">
        <span className="accountant__name">Анна, ваш бухгалтер</span>
        <span className="accountant__status">на связи</span>
      </span>
      <span className="accountant__icon" aria-hidden>
        <MessageCircle size={20} strokeWidth={1.75} />
      </span>
    </button>
  )
}
