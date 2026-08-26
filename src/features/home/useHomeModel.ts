import { useMemo } from 'react'
import { usePayments } from '@/state/PaymentsProvider'
import { useScenario } from '@/state/ScenarioProvider'
import { HOME_SCENARIOS } from '@/data/scenarios'
import { type AugustPayment } from '@/data/august'
import {
  CATEGORY_ORDER,
  categoryHistory,
  categoryPayments,
  computeLevels,
  type DomainCategoryId,
  type DomainHistoryGroup,
  type Severity,
} from './domain'

export type HomeModel = {
  levels: Record<DomainCategoryId, Severity>
  /** Открытые платежи по каждому домену (отсортированы по срочности). */
  paymentsByCat: Record<DomainCategoryId, AugustPayment[]>
  /** История операций по каждому домену (по месяцам) — под таб «Выполнено». */
  historyByCat: Record<DomainCategoryId, DomainHistoryGroup[]>
}

/**
 * Производные Главной над `PaymentsProvider` — аналог `levels`/`openTasks` из
 * `RiskStateContext` в Пульсе, но локально в хуке: сам провайдер не трогаем, чтобы
 * не завязывать доменную модель Главной на общий контекст (им пользуются и История,
 * и октябрьский сценарий). Данные берём из активного сценария (`ScenarioProvider`):
 * дефолт — «24 августа» с просрочкой, альтернатива — «Всё хорошо».
 */
export function useHomeModel(): HomeModel {
  const { isPaid } = usePayments()
  const { scenario } = useScenario()
  const { payments, usn } = HOME_SCENARIOS[scenario]

  return useMemo(() => {
    const levels = computeLevels(payments, usn, isPaid)
    const paymentsByCat = CATEGORY_ORDER.reduce(
      (acc, id) => {
        acc[id] = categoryPayments(id, payments, usn, isPaid)
        return acc
      },
      {} as Record<DomainCategoryId, AugustPayment[]>,
    )
    const historyByCat = CATEGORY_ORDER.reduce(
      (acc, id) => {
        acc[id] = categoryHistory(id, usn ? [usn, ...payments] : payments, isPaid)
        return acc
      },
      {} as Record<DomainCategoryId, DomainHistoryGroup[]>,
    )
    return { levels, paymentsByCat, historyByCat }
  }, [isPaid, payments, usn])
}
