import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Camera,
  ChevronDown,
  Clock3,
  Copy,
  Check,
  Mic,
  Plus,
  Search,
  Smile,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import {
  AI_ANSWERS,
  AI_NOTICE,
  AI_RULES,
  AI_WELCOME,
  ASSISTANT_ACCOUNT,
  SPECIALIST_INCOMING,
  SUPPORT_MESSAGES,
  SUPPORT_REPLIES,
  TAB_AI,
  TAB_SUPPORT,
  type AssistantMessage,
  type AssistantTab,
} from './assistantData'
import './AssistantWidget.css'

/** «HH:MM» текущего времени для новых сообщений. */
function now(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * Иконка кнопки «Homescreen Button» (макет 4664:23230, иконка
 * `Filled/Bubble Rounded List Short` 30×30): белая «скворушка» с двумя короткими
 * линиями-«текстом».
 */
function BubbleIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 30 30" aria-hidden="true">
      <rect x="3" y="4" width="24" height="18" rx="8.5" fill="currentColor" />
      <path d="M9.5 19.6 7 25.3c-.35 1.02 1 1.7 1.85 1.05L14.2 21.6Z" fill="currentColor" />
      <rect x="9.5" y="10.2" width="11" height="2.8" rx="1.4" fill="var(--color-bg-inverse)" />
      <rect x="9.5" y="15" width="7.5" height="2.8" rx="1.4" fill="var(--color-bg-inverse)" />
    </svg>
  )
}

/** Красный PDF-документ в карточке вложения (макет 4664:23238). */
function PdfIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 2.5h7.6L19 7.4V19.5A2.5 2.5 0 0 1 16.5 22h-10A2.5 2.5 0 0 1 4 19.5v-14A2.5 2.5 0 0 1 6.5 2.5Z"
        fill="var(--color-primitive-error)"
      />
      <path d="M14 2.7V7.5h4.8" fill="var(--color-primitive-error)" opacity={0.55} />
      <text
        x="12"
        y="17.4"
        textAnchor="middle"
        fontSize="5.4"
        fontWeight={700}
        fill="#ffffff"
        fontFamily="inherit"
      >
        PDF
      </text>
    </svg>
  )
}

/** Исходящее сообщение клиента — лавандовый пузырь (макет 4664:23238/23279). */
function ClientMessage({ message }: { message: AssistantMessage }) {
  return (
    <div className="aw__msg aw__msg--client">
      <span className="aw__msg-text">{message.text}</span>
      <span className="aw__msg-time">{message.time}</span>
    </div>
  )
}

/** Карточка специалиста поддержки: аватар + имя + текст (макет 4664:23238). */
function AgentMessage({ message }: { message: AssistantMessage }) {
  return (
    <div className="aw__msg aw__msg--agent">
      <div className="aw__agent-head">
        <span className="aw__avatar aw__avatar--agent" aria-hidden="true">
          {message.name?.slice(0, 1)}
        </span>
        <span className="aw__agent-name">{message.name}</span>
      </div>
      <span className="aw__msg-text">{message.text}</span>
      <span className="aw__msg-time">{message.time}</span>
    </div>
  )
}

/** Карточка вложения (PDF) в ленте поддержки. */
function AttachmentCard({ message }: { message: AssistantMessage }) {
  return (
    <div className="aw__attach">
      <span className="aw__attach-icon">
        <PdfIcon />
      </span>
      <span className="aw__attach-body">
        <span className="aw__attach-title">{message.attachment?.title}</span>
        <span className="aw__attach-meta">{message.attachment?.meta}</span>
      </span>
      <span className="aw__msg-time aw__msg-time--attach">{message.time}</span>
    </div>
  )
}

/**
 * Ответ AI-Ассистента: серая карточка с блоками, «Источники» и рядом
 * обратной связи (копировать / лайк / дизлайк) — макет 4664:23292.
 */
function AiAnswer({
  message,
  feedback,
  copied,
  onFeedback,
  onCopy,
}: {
  message: AssistantMessage
  feedback?: 'up' | 'down'
  copied: boolean
  onFeedback: (value: 'up' | 'down') => void
  onCopy: () => void
}) {
  return (
    <div className="aw__answer">
      <div className="aw__msg aw__msg--agent aw__answer-card">
        {message.aiAnswer?.blocks.map((block, index) => (
          <p key={index} className="aw__answer-block">
            {block.lead && (
              <>
                <span aria-hidden="true">— </span>
                <strong>{block.lead} </strong>
              </>
            )}
            {block.text}
          </p>
        ))}
        <button type="button" className="aw__link aw__answer-sources">
          Источники
        </button>
        <span className="aw__msg-time">{message.time}</span>
      </div>
      <div className="aw__feedback" role="group" aria-label="Оценить ответ">
        <button
          type="button"
          className="aw__feedback-btn"
          aria-label="Скопировать ответ"
          onClick={onCopy}
        >
          {copied ? <Check size={20} strokeWidth={1.75} /> : <Copy size={20} strokeWidth={1.75} />}
        </button>
        <button
          type="button"
          className="aw__feedback-btn"
          aria-label="Ответ полезный"
          aria-pressed={feedback === 'up'}
          onClick={() => onFeedback('up')}
        >
          <ThumbsUp size={20} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="aw__feedback-btn"
          aria-label="Ответ не полезный"
          aria-pressed={feedback === 'down'}
          onClick={() => onFeedback('down')}
        >
          <ThumbsDown size={20} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

/**
 * Чат поддержки + AI-Ассистент для сценария «Готовые платежи»:
 * плавающая кнопка (макет 4664:23230) и окно 440×750 с фиксированной высотой
 * в правом нижнем углу (макеты 4664:23238–4664:23320).
 *
 * Мок-сценарий прототипа:
 *  - AI-Ассистент: пустая лента — приветствие; вопрос клиента → статус
 *    «Собираю данные....» → развёрнутый ответ с «Источниками»;
 *  - Поддержка: готовая переписка; через несколько секунд после открытия
 *    приходит новое сообщение от специалиста — бейдж на табе и точка в шапке;
 *  - «Правила работы» открывает модалку «Как работает Ассистент».
 */
export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<AssistantTab>('ai')
  const [aiMessages, setAiMessages] = useState<AssistantMessage[]>([])
  const [supportMessages, setSupportMessages] = useState<AssistantMessage[]>(SUPPORT_MESSAGES)
  const [aiTyping, setAiTyping] = useState(false)
  const [supportTyping, setSupportTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [supportDraft, setSupportDraft] = useState('')
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const idSeq = useRef(0)
  const nextId = () => `aw-${++idSeq.current}`
  const aiAnswerIdx = useRef(0)
  const supportReplyIdx = useRef(0)
  const timers = useRef<number[]>([])
  const tabRef = useRef(tab)
  tabRef.current = tab

  const aiThreadRef = useRef<HTMLDivElement>(null)
  const supportThreadRef = useRef<HTMLDivElement>(null)

  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }, [])

  // Очистка всех таймеров при размонтировании.
  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])

  // Входящее сообщение от специалиста: раз, ~8 секунд после первого открытия окна
  // (сценарий «Пришло сообщение от специалиста», 4664:23320).
  const incomingScheduled = useRef(false)
  useEffect(() => {
    if (!open || incomingScheduled.current) return
    incomingScheduled.current = true
    later(() => {
      setSupportMessages((prev) => [...prev, { ...SPECIALIST_INCOMING, id: nextId(), time: now() }])
      if (tabRef.current !== 'support') setUnread((u) => u + 1)
    }, 8000)
  }, [open, later])

  // Автопрокрутка активной ленты вниз при новых сообщениях/статусах.
  useEffect(() => {
    const el = tab === 'ai' ? aiThreadRef.current : supportThreadRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [aiMessages, supportMessages, aiTyping, supportTyping, tab])

  // Escape закрывает модалку правил, затем окно.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (rulesOpen) setRulesOpen(false)
      else setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, rulesOpen])

  const selectTab = (next: AssistantTab) => {
    setTab(next)
    if (next === 'support') setUnread(0)
  }

  /** Отправка в AI-Ассистент: пузырь клиента → «Собираю данные....» → ответ. */
  const sendAi = (raw: string) => {
    const text = raw.trim()
    if (!text || aiTyping) return
    setDraft('')
    setAiMessages((prev) => [...prev, { id: nextId(), from: 'client', text, time: now() }])
    setAiTyping(true)
    later(() => {
      const answer = AI_ANSWERS[Math.min(aiAnswerIdx.current, AI_ANSWERS.length - 1)]
      aiAnswerIdx.current += 1
      setAiMessages((prev) => [...prev, { id: nextId(), from: 'agent', text: '', time: now(), aiAnswer: answer }])
      setAiTyping(false)
    }, 1600)
  }

  /** Отправка в поддержку: пузырь клиента → ответ Карину. */
  const sendSupport = (raw: string) => {
    const text = raw.trim()
    if (!text || supportTyping) return
    setSupportDraft('')
    setSupportMessages((prev) => [...prev, { id: nextId(), from: 'client', text, time: now() }])
    setSupportTyping(true)
    later(() => {
      const reply = SUPPORT_REPLIES[supportReplyIdx.current % SUPPORT_REPLIES.length]
      supportReplyIdx.current += 1
      setSupportMessages((prev) => [
        ...prev,
        { id: nextId(), from: 'agent', name: 'Карина', text: reply, time: now() },
      ])
      setSupportTyping(false)
    }, 2000)
  }

  const copyAnswer = (message: AssistantMessage) => {
    const text = message.aiAnswer?.blocks.map((b) => `${b.lead ?? ''} ${b.text}`).join('\n\n') ?? ''
    void navigator.clipboard?.writeText(text)
    setCopiedId(message.id)
    later(() => setCopiedId((cur) => (cur === message.id ? null : cur)), 1500)
  }

  return (
    <>
      {!open && (
        <button type="button" className="aw__fab" aria-label="Открыть чат" onClick={() => setOpen(true)}>
          <BubbleIcon />
        </button>
      )}

      {open && (
        <section className="aw__window" role="dialog" aria-label="Чат: поддержка и AI-Ассистент">
          <header className="aw__head">
            <div className="aw__account">
              <button type="button" className="aw__account-btn" aria-label="Выбрать счёт">
                <span className="aw__account-name">{ASSISTANT_ACCOUNT}</span>
                <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
              </button>
              {unread > 0 && (
                <span className="aw__unread-dot" aria-label={`Непрочитанных сообщений: ${unread}`} />
              )}
            </div>
            <div className="aw__head-actions">
              <button type="button" className="aw__icon-btn" aria-label="Поиск по чату">
                <Search size={22} strokeWidth={2} />
              </button>
              <button type="button" className="aw__icon-btn" aria-label="Закрыть чат" onClick={() => setOpen(false)}>
                <X size={22} strokeWidth={2} />
              </button>
            </div>
          </header>

          <div className="aw__tabs" role="tablist" aria-label="Разделы чата">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'support'}
              className={`aw__tab${unread > 0 ? ' aw__tab--badged' : ''}`}
              onClick={() => selectTab('support')}
            >
              {TAB_SUPPORT}
              {unread > 0 && (
                <span className="aw__tab-badge" aria-hidden="true">
                  {unread}
                </span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'ai'}
              className="aw__tab"
              onClick={() => selectTab('ai')}
            >
              {TAB_AI}
            </button>
          </div>

          {tab === 'ai' ? (
            <div className="aw__thread" ref={aiThreadRef}>
              {/* Уведомление про AI (кадр 4664:23279). */}
              <div className="aw__note">
                <span className="aw__note-icon" aria-hidden="true">
                  i
                </span>
                <span className="aw__note-body">
                  <span className="aw__note-text">{AI_NOTICE.text}</span>
                  <button type="button" className="aw__link" onClick={() => setRulesOpen(true)}>
                    {AI_NOTICE.action}
                  </button>
                </span>
              </div>

              {aiMessages.length === 0 ? (
                /* Приветствие при пустой ленте (кадр 4664:23254). */
                <div className="aw__welcome">
                  <h2 className="aw__welcome-title">
                    {AI_WELCOME.title}
                    <span className="aw__welcome-accent">{AI_WELCOME.accent}</span>
                  </h2>
                  <p className="aw__welcome-sub">{AI_WELCOME.subtitle}</p>
                  <div className="aw__sample">
                    <div className="aw__sample-row aw__sample-row--client">
                      <span className="aw__bubble aw__bubble--welcome">{AI_WELCOME.sampleQuestion}</span>
                      <span className="aw__avatar aw__avatar--user" aria-hidden="true">
                        НО
                      </span>
                    </div>
                    <div className="aw__sample-row aw__sample-row--agent">
                      <span className="aw__avatar aw__avatar--ai" aria-hidden="true">
                        <Sparkles size={15} strokeWidth={2} />
                      </span>
                      <span className="aw__bubble aw__bubble--agent">{AI_WELCOME.sampleAnswer}</span>
                    </div>
                  </div>
                </div>
              ) : (
                aiMessages.map((message) =>
                  message.from === 'client' ? (
                    <ClientMessage key={message.id} message={message} />
                  ) : (
                    <AiAnswer
                      key={message.id}
                      message={message}
                      feedback={feedback[message.id]}
                      copied={copiedId === message.id}
                      onFeedback={(value) =>
                        setFeedback((prev) => {
                          const next = { ...prev }
                          if (next[message.id] === value) delete next[message.id]
                          else next[message.id] = value
                          return next
                        })
                      }
                      onCopy={() => copyAnswer(message)}
                    />
                  ),
                )
              )}

              {aiTyping && (
                <div className="aw__status" aria-live="polite">
                  <Clock3 size={13} strokeWidth={1.5} aria-hidden="true" />
                  <span>Собираю данные....</span>
                </div>
              )}
            </div>
          ) : (
            <div className="aw__thread" ref={supportThreadRef}>
              {supportMessages.map((message) => {
                if (message.attachment) return <AttachmentCard key={message.id} message={message} />
                return message.from === 'client' ? (
                  <ClientMessage key={message.id} message={message} />
                ) : (
                  <AgentMessage key={message.id} message={message} />
                )
              })}
              {supportTyping && (
                <div className="aw__status" aria-live="polite">
                  <Clock3 size={13} strokeWidth={1.5} aria-hidden="true" />
                  <span>Печатает....</span>
                </div>
              )}
            </div>
          )}

          {tab === 'ai' ? (
            <div className="aw__input">
              <div className="aw__pill">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendAi(draft)
                  }}
                  placeholder="Спросите у Ассистента"
                  aria-label="Сообщение ассистенту"
                />
                <button
                  type="button"
                  className="aw__send"
                  aria-label="Отправить"
                  disabled={!draft.trim() || aiTyping}
                  onClick={() => sendAi(draft)}
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="aw__input">
              <div className="aw__pill">
                <button type="button" className="aw__input-icon" aria-label="Прикрепить файл">
                  <Plus size={20} strokeWidth={1.75} />
                </button>
                <button type="button" className="aw__input-icon" aria-label="Эмодзи">
                  <Smile size={20} strokeWidth={1.75} />
                </button>
                <input
                  value={supportDraft}
                  onChange={(e) => setSupportDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendSupport(supportDraft)
                  }}
                  placeholder="Сообщение…"
                  aria-label="Сообщение поддержке"
                />
                <button type="button" className="aw__input-icon" aria-label="Камера">
                  <Camera size={20} strokeWidth={1.75} />
                </button>
                <button type="button" className="aw__input-icon" aria-label="Голосовое сообщение">
                  <Mic size={20} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {rulesOpen && (
        <div className="aw__overlay" onClick={() => setRulesOpen(false)}>
          <div
            className="aw__modal"
            role="dialog"
            aria-modal="true"
            aria-label={AI_RULES.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="aw__icon-btn aw__modal-close" aria-label="Закрыть" onClick={() => setRulesOpen(false)}>
              <X size={24} strokeWidth={2} />
            </button>
            <h3 className="aw__modal-title">{AI_RULES.title}</h3>
            {AI_RULES.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <p>
              {AI_RULES.consent}
              <a className="aw__link" href="#chat-rules" onClick={(e) => e.preventDefault()}>
                {AI_RULES.consentLink}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
