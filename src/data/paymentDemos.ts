import { CASE2, type ObCaseData } from './case2'
import { CASE3 } from './case3'
import { IP_CASE } from './ipCase'
import { IP_DECEMBER_CASE } from './ipDecemberCase'
import type { AugustPayment, PayState } from './august'

/** Три снимка одних и тех же обязательств: расчёт, готовность и просрочка. */
function paymentDemo(state: PayState): ObCaseData {
  const convert = (items: AugustPayment[]) => items.map((p): AugustPayment => ({
    ...p,
    id: `demo-${state}-${p.id}`,
    state,
    amount: state === 'process' ? 0 : p.amount,
    preliminary: false,
    payFromLabel: undefined,
  }))
  const taxes = convert(CASE2.taxes)
  const nds = convert(CASE2.nds)
  // В демо сравниваем текущие платежи октября, без долга за прошлый месяц.
  const employees = convert(CASE2.employees.filter((p) => p.state !== 'overdue'))
  return { taxes, nds, employees, payables: [...taxes, ...nds, ...employees], historyLabel: 'Октябрь' }
}

export const PAYMENT_DEMOS = {
  case2_pending: paymentDemo('process'),
  case2: paymentDemo('due'),
  case2_overdue: paymentDemo('overdue'),
} as const

export const DEMO_PAYABLES = Object.values(PAYMENT_DEMOS).flatMap((data) => data.payables)

export function caseDataFor(scenario: string): ObCaseData {
  if (scenario === 'case3') return CASE3
  if (scenario === 'ip') return IP_CASE
  if (scenario === 'ip_december') return IP_DECEMBER_CASE
  return PAYMENT_DEMOS[scenario as keyof typeof PAYMENT_DEMOS] ?? CASE2
}

export function isCaseScenario(scenario: string): boolean {
  return scenario === 'case3' || scenario === 'ip' || scenario === 'ip_december' || scenario in PAYMENT_DEMOS
}
