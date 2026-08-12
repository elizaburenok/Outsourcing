import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@ds/components/Button'
import { CHAT_BANNER } from '@/data/onboarding'
import './ChatBanner.css'

/**
 * Этап 1, вариант A — плашка в ленте чата. Неблокирующий канал: живёт в переписке,
 * не перехватывает вход. От лица бухгалтера, с одной кнопкой в кабинет.
 */
export default function ChatBanner({ onOpen }: { onOpen: () => void }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="chat-banner">
      <button
        type="button"
        className="chat-banner__close"
        aria-label="Скрыть"
        onClick={() => setDismissed(true)}
      >
        <X size={16} strokeWidth={2} />
      </button>
      <span className="chat-banner__icon" aria-hidden>
        <Sparkles size={22} strokeWidth={1.75} />
      </span>
      <div className="chat-banner__body">
        <p className="chat-banner__title">{CHAT_BANNER.title}</p>
        <p className="chat-banner__text">{CHAT_BANNER.text}</p>
        <Button className="chat-banner__cta" visualVariant="Primary" onClick={onOpen}>
          {CHAT_BANNER.cta}
        </Button>
      </div>
    </div>
  )
}
