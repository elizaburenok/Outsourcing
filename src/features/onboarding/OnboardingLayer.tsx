import { useLocation } from 'react-router-dom'
import { Sparkles, PartyPopper, RotateCcw } from 'lucide-react'
import { useOnboarding } from '@/state/OnboardingProvider'
import { ROUTES } from '@/routes'
import { COACH_STEPS, COACH_TOTAL, ENTRY_MODAL, DONE_MODAL } from '@/data/onboarding'
import OnboardingModal, { ModalBullets } from './OnboardingModal'
import Coachmark from './Coachmark'
import './OnboardingLayer.css'

/**
 * Глобальный слой онбординга поверх приложения: входная модалка-анонс (этап 2),
 * интерактивный коуч (этап 3) и финальная модалка. Плюс служебная кнопка
 * «Сброс онбординга» для повторного прогона сценария (инструмент прототипа).
 * Монтируется один раз в RootLayout.
 */
export default function OnboardingLayer() {
  const { stage, coachStep, startCoach, advance, skip, reset } = useOnboarding()
  const { pathname } = useLocation()

  // Модалки этапа 2/3 имеют смысл только внутри ЛК, не на странице чата.
  const inCabinet = pathname !== ROUTES.chat

  return (
    <>
      {stage === 'entry' && inCabinet && (
        <OnboardingModal
          media={<Sparkles size={40} strokeWidth={1.75} />}
          title={ENTRY_MODAL.title}
          primaryLabel={ENTRY_MODAL.primary}
          onPrimary={startCoach}
          secondaryLabel={ENTRY_MODAL.secondary}
          onSecondary={skip}
        >
          <ModalBullets items={ENTRY_MODAL.bullets} />
        </OnboardingModal>
      )}

      {stage === 'coach' && inCabinet && (
        <Coachmark
          key={COACH_STEPS[coachStep].id}
          step={COACH_STEPS[coachStep]}
          index={coachStep}
          total={COACH_TOTAL}
          onAction={advance}
          onSkip={skip}
        />
      )}

      {stage === 'done' && (
        <OnboardingModal
          media={<PartyPopper size={40} strokeWidth={1.75} />}
          mediaTone="success"
          title={DONE_MODAL.title}
          primaryLabel={DONE_MODAL.primary}
          onPrimary={skip}
        >
          {DONE_MODAL.text}
        </OnboardingModal>
      )}

      {/* Инструмент прототипа: повторный прогон сценария с чата. */}
      <button type="button" className="onb-reset" onClick={reset} title="Пройти онбординг заново">
        <RotateCcw size={16} strokeWidth={2} />
        Сброс онбординга
      </button>
    </>
  )
}
