import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SCENARIO, type ScenarioId } from '@/data/scenarios'
import { usePayments } from './PaymentsProvider'

/**
 * Служебный контекст сценария Главной (не элемент продукта) — какое состояние показывает
 * прототип: «Есть просрочка» (дефолт) или «Всё хорошо». Переключается плавающим тумблером
 * в углу. `reset` возвращает всё в дефолт: и сам сценарий, и уплаты текущей сессии
 * (`PaymentsProvider`), поэтому провайдер живёт внутри `PaymentsProvider`.
 */
type ScenarioContextValue = {
  scenario: ScenarioId
  setScenario: (id: ScenarioId) => void
  /** Полный сброс прототипа в дефолтное состояние. */
  reset: () => void
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const { reset: resetPaid } = usePayments()
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO)

  const reset = useCallback(() => {
    setScenario(DEFAULT_SCENARIO)
    resetPaid()
  }, [resetPaid])

  const value = useMemo<ScenarioContextValue>(
    () => ({ scenario, setScenario, reset }),
    [scenario, reset],
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario должен вызываться внутри <ScenarioProvider>')
  return ctx
}
