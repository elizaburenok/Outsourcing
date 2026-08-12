import { useEffect, useState } from 'react'
import { Paperclip, SendHorizontal } from 'lucide-react'
import { Chip } from '@ds/components/Chip'
import { useOnboarding } from '@/state/OnboardingProvider'
import { ACCOUNTANT } from '@/data/accountant'
import { CHAT_MESSAGES, CHAT_MODAL } from '@/data/onboarding'
import OnboardingModal, { ModalBullets } from '@/features/onboarding/OnboardingModal'
import ChatBanner from './ChatBanner'
import './ChatScreen.css'

/**
 * Этап 1 — информирование через чат бухгалтера (основной канал).
 * Mock-переписка с Анной + два варианта показа анонса нового ЛК для сравнения:
 *   A. Плашка в ленте чата (неблокирующая).
 *   B. Модалка при открытии страницы чата (перехват входа) — рискованный вариант:
 *      клиенты привыкли работать в чате, поэтому у модалки есть «Остаться в чате».
 * Переключатель вариантов — служебный инструмент прототипа.
 */
export default function ChatScreen() {
  const { chatVariant, setChatVariant, openCabinet } = useOnboarding()
  const [modalOpen, setModalOpen] = useState(chatVariant === 'modal')

  // Модалка варианта B показывается при открытии чата и при переключении на «Модалку».
  useEffect(() => {
    setModalOpen(chatVariant === 'modal')
  }, [chatVariant])

  return (
    <div className="chat">
      {/* Служебный переключатель вариантов показа (не элемент продукта). */}
      <div className="chat__variant">
        <span className="chat__variant-label">Вариант показа</span>
        <div className="chat__variant-tabs">
          <Chip chipType="Tab" isSelected={chatVariant === 'banner'} onClick={() => setChatVariant('banner')}>
            Плашка
          </Chip>
          <Chip chipType="Tab" isSelected={chatVariant === 'modal'} onClick={() => setChatVariant('modal')}>
            Модалка
          </Chip>
        </div>
      </div>

      <div className="chat__panel">
        <header className="chat__head">
          <span className="chat__avatar" aria-hidden>
            {ACCOUNTANT.initials}
            {ACCOUNTANT.online && <span className="chat__online" />}
          </span>
          <span className="chat__who">
            <span className="chat__name">{ACCOUNTANT.name}, {ACCOUNTANT.role}</span>
            <span className="chat__status">на связи</span>
          </span>
        </header>

        <div className="chat__thread">
          {CHAT_MESSAGES.map((m) => (
            <div key={m.id} className={`chat__msg chat__msg--${m.from}`}>
              {m.text}
            </div>
          ))}

          {/* Вариант A — плашка прямо в ленте. */}
          {chatVariant === 'banner' && <ChatBanner onOpen={openCabinet} />}
        </div>

        <div className="chat__input">
          <button type="button" className="chat__input-icon" aria-label="Прикрепить" disabled>
            <Paperclip size={20} strokeWidth={1.75} />
          </button>
          <span className="chat__input-placeholder">Написать сообщение…</span>
          <button type="button" className="chat__input-send" aria-label="Отправить" disabled>
            <SendHorizontal size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Вариант B — модалка при открытии страницы чата. */}
      {modalOpen && (
        <OnboardingModal
          media={<span className="chat__modal-avatar" aria-hidden>{ACCOUNTANT.initials}</span>}
          title={CHAT_MODAL.title}
          primaryLabel={CHAT_MODAL.primary}
          onPrimary={openCabinet}
          secondaryLabel={CHAT_MODAL.secondary}
          onSecondary={() => setModalOpen(false)}
          onClose={() => setModalOpen(false)}
        >
          <ModalBullets items={CHAT_MODAL.bullets} />
        </OnboardingModal>
      )}
    </div>
  )
}
