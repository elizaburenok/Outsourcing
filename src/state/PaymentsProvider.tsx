import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Лёгкий контекст оплаченных платежей (аналог RiskStateContext из «Пульса»).
 * Держит id уже уплаченных в текущей сессии платежей, чтобы состояние переживало
 * переход между Главной и страницей уплаты (`/pay/:id`). После уплаты строка уходит
 * во вкладку «Готово» — самым новым платежам первыми, поэтому порядок оплаты важен
 * (`paidOrder`), а не только факт оплаты.
 */
type PaymentsContextValue = {
  /** id уплаченных в этой сессии платежей, самый новый — первым (index 0). */
  paidOrder: readonly string[]
  /** Пометить платёж уплаченным. */
  markPaid: (id: string) => void
  /** Уплачен ли платёж. */
  isPaid: (id: string) => boolean
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null)

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [paidOrder, setPaidOrder] = useState<string[]>(() => [])

  const markPaid = useCallback((id: string) => {
    setPaidOrder((prev) => (prev.includes(id) ? prev : [id, ...prev]))
  }, [])

  const isPaid = useCallback((id: string) => paidOrder.includes(id), [paidOrder])

  const value = useMemo<PaymentsContextValue>(
    () => ({ paidOrder, markPaid, isPaid }),
    [paidOrder, markPaid, isPaid],
  )

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
}

export function usePayments(): PaymentsContextValue {
  const ctx = useContext(PaymentsContext)
  if (!ctx) throw new Error('usePayments должен вызываться внутри <PaymentsProvider>')
  return ctx
}
