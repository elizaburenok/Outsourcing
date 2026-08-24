/**
 * 3 сценария под служебный тумблер прототипа (не элемент продукта) — проверить, как
 * читаются доменные карточки Главной в разных состояниях: всё оплачено, есть ближайшие
 * платежи без риска, есть просрочка. По образцу `Пульс/src/data/scenarios.ts`, но проще:
 * каждый сценарий — это готовый список платежей + аванс УСН.
 */

import { AUGUST_PAYMENTS, usnPayment, type AugustPayment } from '@/data/august'

export type HomeScenarioId = 'ok' | 'attention' | 'overdue'

export interface HomeScenario {
  id: HomeScenarioId
  /** Подпись сегмента тумблера. */
  label: string
  payments: AugustPayment[]
  /** null — аванс УСН не показываем (домен «УСН» полностью закрыт). */
  usn: AugustPayment | null
}

/** Аванс по УСН за 9 месяцев — одинаков во всех 3 сценариях: карточка «УСН» регулярно
 *  показывает дату следующего платежа независимо от того, что происходит в других доменах. */
const USN_NEXT = usnPayment('mid')

/**
 * Следующий платёж по НДС для сценария «всё хорошо» — квартал только что закрыт и
 * оплачен, следующая обязанность (за III квартал) ещё не посчитана. Как и аванс УСН,
 * в состоянии `process`: дата известна, сумма — нет (появится по итогам квартала).
 */
const NDS_NEXT: AugustPayment = {
  id: 'demo-nds-next',
  title: 'НДС за III квартал',
  category: 'nds',
  amount: 0,
  viaEnp: true,
  state: 'process',
  dueLabel: '28 октября',
}

/**
 * Ближайшие платежи без просрочки — реальные `due`-записи из `AUGUST_PAYMENTS` (не
 * дубли с новыми id): страница уплаты ищет платёж по id в реальном списке
 * (`getPayableById`), выдуманный id увёл бы клик в никуда (молчаливый редирект на
 * Главную — там же, где на самом деле лежит эта дата/сумма).
 */
const ATTENTION_IDS = ['salary-aug-advance', 'nds-q2-2', 'vznos-jul', 'ndfl-aug-1']
const ATTENTION_PAYMENTS: AugustPayment[] = AUGUST_PAYMENTS.filter((p) =>
  ATTENTION_IDS.includes(p.id),
)

export const HOME_SCENARIOS: Record<HomeScenarioId, HomeScenario> = {
  ok: {
    id: 'ok',
    label: 'Всё хорошо',
    payments: [NDS_NEXT],
    usn: USN_NEXT,
  },
  attention: {
    id: 'attention',
    label: 'Ближайшие платежи',
    payments: ATTENTION_PAYMENTS,
    usn: USN_NEXT,
  },
  overdue: {
    id: 'overdue',
    label: 'Есть просрочка',
    payments: AUGUST_PAYMENTS,
    usn: USN_NEXT,
  },
}

export const HOME_SCENARIO_ORDER: HomeScenarioId[] = ['ok', 'attention', 'overdue']
