import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Лёгкий контекст оплаченных платежей (аналог RiskStateContext из «Пульса»).
 * Держит множество id уже уплаченных платежей, чтобы состояние переживало переход
 * между Главной и страницей уплаты (`/pay/:id`). После уплаты строка уходит во
 * вкладку «Готово».
 */
type PaymentsContextValue = {
  /** id уплаченных в текущей сессии платежей. */
  paidIds: ReadonlySet<string>
  /** Пометить платёж уплаченным. */
  markPaid: (id: string) => void
  /** Уплачен ли платёж. */
  isPaid: (id: string) => boolean
}

const PaymentsContext = createContext<PaymentsContextValue | null>(null)

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [paidIds, setPaidIds] = useState<Set<string>>(() => new Set())

  const markPaid = useCallback((id: string) => {
    setPaidIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const isPaid = useCallback((id: string) => paidIds.has(id), [paidIds])

  const value = useMemo<PaymentsContextValue>(
    () => ({ paidIds, markPaid, isPaid }),
    [paidIds, markPaid, isPaid],
  )

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
}

export function usePayments(): PaymentsContextValue {
  const ctx = useContext(PaymentsContext)
  if (!ctx) throw new Error('usePayments должен вызываться внутри <PaymentsProvider>')
  return ctx
}
