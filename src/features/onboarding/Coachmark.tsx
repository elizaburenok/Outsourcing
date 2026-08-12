import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ACCOUNTANT } from '@/data/accountant'
import type { CoachStep, CoachSide } from '@/data/onboarding'
import './Coachmark.css'

type Rect = { top: number; left: number; width: number; height: number }

const GAP = 12 // отступ тултипа от объекта
const PAD = 8 // «подушка» подсветки вокруг объекта
const MARGIN = 12 // минимальный зазор до края экрана

/**
 * Интерактивный коуч-тултип рядом с объектом онбординга.
 * — Находит цель по [data-coach="anchor"], меряет её и рисует спотлайт (затемняет
 *   экран, оставляя «окно» вокруг объекта).
 * — Ставит карточку-тултип рядом с объектом (сторона выбирается по месту).
 * — Продвигается ТОЛЬКО по действию: клик по подсвеченному объекту = onAction.
 *   Кнопки «Далее» нет — есть только «Пропустить».
 */
export default function Coachmark({
  step,
  index,
  total,
  onAction,
  onSkip,
}: {
  step: CoachStep
  index: number
  total: number
  onAction: () => void
  onSkip: () => void
}) {
  const [anchor, setAnchor] = useState<Rect | null>(null)
  const [tip, setTip] = useState<{ top: number; left: number; side: CoachSide } | null>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const scrolledRef = useRef(false)

  // Меряем якорь. Цель может появиться не сразу (например, внутри шторки) —
  // повторяем измерение несколько кадров, пока элемент не найдётся. Если объект
  // не целиком в экране, один раз подкручиваем к нему (чтобы подсветка была видна).
  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-coach="${step.anchor}"]`)
    if (!el) return false
    if (!scrolledRef.current) {
      scrolledRef.current = true
      const r0 = el.getBoundingClientRect()
      if (r0.top < 0 || r0.bottom > window.innerHeight) {
        el.scrollIntoView({ block: 'nearest', behavior: 'auto' })
      }
    }
    const r = el.getBoundingClientRect()
    setAnchor({ top: r.top, left: r.left, width: r.width, height: r.height })
    return true
  }, [step.anchor])

  useLayoutEffect(() => {
    scrolledRef.current = false
    setAnchor(null)
    setTip(null)
    let raf = 0
    let tries = 0
    const tick = () => {
      if (measure() || tries > 40) return
      tries += 1
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [measure])

  // Пересчёт при скролле/ресайзе.
  useEffect(() => {
    const onMove = () => measure()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [measure])

  // Позиционируем тултип после того, как знаем и якорь, и размеры карточки.
  useLayoutEffect(() => {
    if (!anchor || !tipRef.current) return
    const tw = tipRef.current.offsetWidth
    const th = tipRef.current.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight

    const spaceBelow = vh - (anchor.top + anchor.height)
    const spaceAbove = anchor.top
    const spaceRight = vw - (anchor.left + anchor.width)
    const spaceLeft = anchor.left

    const fits = {
      bottom: spaceBelow >= th + GAP + MARGIN,
      top: spaceAbove >= th + GAP + MARGIN,
      right: spaceRight >= tw + GAP + MARGIN,
      left: spaceLeft >= tw + GAP + MARGIN,
    }
    const order: CoachSide[] = step.side
      ? [step.side, 'bottom', 'top', 'right', 'left']
      : ['bottom', 'top', 'right', 'left']
    const side = order.find((s) => fits[s]) ?? 'bottom'

    let top = 0
    let left = 0
    if (side === 'bottom' || side === 'top') {
      left = anchor.left + anchor.width / 2 - tw / 2
      top = side === 'bottom' ? anchor.top + anchor.height + GAP : anchor.top - GAP - th
    } else {
      top = anchor.top + anchor.height / 2 - th / 2
      left = side === 'right' ? anchor.left + anchor.width + GAP : anchor.left - GAP - tw
    }
    // Гарантируем, что карточка целиком в экране (для крупных объектов допускаем
    // лёгкое перекрытие — подсветка-кольцо всё равно видна).
    const clamp = (v: number, size: number, vp: number) =>
      Math.max(MARGIN, Math.min(v, vp - size - MARGIN))
    top = clamp(top, th, vh)
    left = clamp(left, tw, vw)
    setTip({ top, left, side })
  }, [anchor, step.side, step.title, step.text])

  // Esc = пропустить обзор.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onSkip()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onSkip])

  return (
    <div className="cm-root">
      {/* Блокировщик кликов по остальному экрану (не закрывает — обзор ведёт по объектам). */}
      <div className="cm-catch" />

      {anchor && (
        <button
          type="button"
          className="cm-hole"
          aria-label={step.hint}
          onClick={onAction}
          style={{
            top: anchor.top - PAD,
            left: anchor.left - PAD,
            width: anchor.width + PAD * 2,
            height: anchor.height + PAD * 2,
          }}
        />
      )}

      {anchor && (
        <div
          ref={tipRef}
          className={`cm-tip ${tip ? `cm-tip--${tip.side}` : 'cm-tip--hidden'}`}
          role="dialog"
          aria-label={step.title}
          style={tip ? { top: tip.top, left: tip.left } : undefined}
        >
          <div className="cm-tip__head">
            <span className="cm-tip__avatar" aria-hidden>
              {ACCOUNTANT.initials}
              <span className="cm-tip__online" />
            </span>
            <span className="cm-tip__who">
              <span className="cm-tip__name">{ACCOUNTANT.name}, {ACCOUNTANT.role}</span>
              <span className="cm-tip__step">Шаг {index + 1} из {total}</span>
            </span>
          </div>

          <h3 className="cm-tip__title">{step.title}</h3>
          <p className="cm-tip__text">{step.text}</p>

          <div className="cm-tip__dots" aria-hidden>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`cm-tip__dot ${i === index ? 'is-active' : ''} ${i < index ? 'is-done' : ''}`} />
            ))}
          </div>

          <div className="cm-tip__foot">
            <span className="cm-tip__hint">{step.hint}</span>
            <button type="button" className="cm-tip__skip" onClick={onSkip}>
              Пропустить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
