import { useMemo } from 'react'
import { usePayments } from '@/state/PaymentsProvider'
import { AUGUST_PAYMENTS, usnPayment, type AugustPayment } from '@/data/august'
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

/** Аванс по УСН за 9 месяцев — карточка «УСН» регулярно показывает дату следующего
 *  платежа независимо от того, что происходит в других доменах. */
const USN_NEXT = usnPayment('mid')

/**
 * Производные Главной над `PaymentsProvider` — аналог `levels`/`openTasks` из
 * `RiskStateContext` в Пульсе, но локально в хуке: сам провайдер не трогаем, чтобы
 * не завязывать доменную модель Главной на общий контекст (им пользуются и История,
 * и октябрьский сценарий). Данные — сценарий «24 августа» (`AUGUST_PAYMENTS`).
 */
export function useHomeModel(): HomeModel {
  const { isPaid } = usePayments()
  const payments = AUGUST_PAYMENTS
  const usn = USN_NEXT

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
