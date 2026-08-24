import { useMemo } from 'react'
import { usePayments } from '@/state/PaymentsProvider'
import type { AugustPayment } from '@/data/august'
import { HOME_SCENARIOS, type HomeScenarioId } from './scenarios'
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
  /** История операций по каждому домену (по месяцам) — под таб «Готово». */
  historyByCat: Record<DomainCategoryId, DomainHistoryGroup[]>
}

/**
 * Производные Главной над `PaymentsProvider` — аналог `levels`/`openTasks` из
 * `RiskStateContext` в Пульсе, но локально в хуке: сам провайдер не трогаем, чтобы
 * не завязывать доменную модель Главной на общий контекст (им пользуются и История,
 * и октябрьский сценарий). `scenarioId` выбирает набор платежей (служебный тумблер
 * прототипа — см. `scenarios.ts`), не элемент продукта.
 */
export function useHomeModel(scenarioId: HomeScenarioId): HomeModel {
  const { isPaid } = usePayments()

  return useMemo(() => {
    const { payments, usn } = HOME_SCENARIOS[scenarioId]
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
  }, [isPaid, scenarioId])
}
