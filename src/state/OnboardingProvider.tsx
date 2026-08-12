import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/routes'
import { COACH_STEPS, COACH_TOTAL } from '@/data/onboarding'

/**
 * Оркестратор 3-этапного онбординга нового ЛК.
 *   chat  — этап 1: информирование в чате бухгалтера (плашка / модалка).
 *   entry — этап 2: модалка-анонс при первом входе в ЛК.
 *   coach — этап 3: интерактивный коуч рядом с объектами (5 шагов).
 *   done  — обзор пройден до конца (показываем финальную модалку).
 *   off   — онбординг закрыт (пропущен или завершён).
 */
export type OnbStage = 'chat' | 'entry' | 'coach' | 'done' | 'off'
export type ChatVariant = 'banner' | 'modal'

type OnboardingContextValue = {
  stage: OnbStage
  coachStep: number
  /** Вариант показа этапа 1 (служебный переключатель прототипа). */
  chatVariant: ChatVariant
  setChatVariant: (v: ChatVariant) => void
  /** Держать ли открытой шторку «Задачи бухгалтера» (для последнего шага коуча). */
  tasksDrawerForced: boolean
  /** Перейти из чата в ЛК → показать входную модалку. */
  openCabinet: () => void
  /** Запустить коуч с первого шага. */
  startCoach: () => void
  /** Закрыть текущий шаг по совершённому действию → следующий шаг или финал. */
  advance: () => void
  /** Пропустить/закрыть онбординг. */
  skip: () => void
  /** Повторный прогон сценария с начала (инструмент прототипа). */
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<OnbStage>('chat')
  const [coachStep, setCoachStep] = useState(0)
  const [chatVariant, setChatVariant] = useState<ChatVariant>('banner')

  const openCabinet = useCallback(() => {
    navigate(ROUTES.home)
    setStage('entry')
  }, [navigate])

  const startCoach = useCallback(() => {
    setCoachStep(0)
    setStage('coach')
  }, [])

  const advance = useCallback(() => {
    setCoachStep((step) => {
      if (step < COACH_TOTAL - 1) return step + 1
      // Последний шаг пройден — показываем финальную модалку.
      setStage('done')
      return step
    })
  }, [])

  const skip = useCallback(() => setStage('off'), [])

  const reset = useCallback(() => {
    setCoachStep(0)
    setChatVariant('banner')
    setStage('chat')
    navigate(ROUTES.chat)
  }, [navigate])

  const tasksDrawerForced = stage === 'coach' && !!COACH_STEPS[coachStep]?.needsDrawer

  const value = useMemo<OnboardingContextValue>(
    () => ({
      stage,
      coachStep,
      chatVariant,
      setChatVariant,
      tasksDrawerForced,
      openCabinet,
      startCoach,
      advance,
      skip,
      reset,
    }),
    [stage, coachStep, chatVariant, tasksDrawerForced, openCabinet, startCoach, advance, skip, reset],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding должен вызываться внутри <OnboardingProvider>')
  return ctx
}
