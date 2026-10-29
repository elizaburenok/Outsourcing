/**
 * Служебные сценарии Главной для прототипа (не элемент продукта) — переключаются
 * плавающим тумблером в углу, чтобы показать, как читаются доменные карточки в разных
 * состояниях: накопилась просрочка (дефолт) и «всё хорошо». По образцу прежнего
 * `home/scenarios.ts` (удалён в bee2c27), но под текущую доменную модель.
 *
 * Каждый сценарий — готовый список платежей + строка аванса УСН (её домен «УСН» ведёт
 * отдельно, см. `useHomeModel`).
 */

import { AUGUST_PAYMENTS, USN_ADVANCE, usnPayment, type AugustPayment } from '@/data/august'

export type ScenarioId = 'overdue' | 'ok' | 'case2' | 'case3' | 'case2_pending' | 'case2_overdue' | 'ip' | 'ip_december' | 'onboarding' | 'onboarding_vat'

export interface HomeScenario {
  id: ScenarioId
  /** Подпись сегмента тумблера. */
  label: string
  payments: AugustPayment[]
  /** null — аванс УСН не показываем (домен «УСН» полностью закрыт). */
  usn: AugustPayment | null
}

/**
 * Предварительный расчёт налога по УСН за III квартал: сумма уже прикинута, но квартал
 * не закрыт (30 сентября) — платить рано. `process` + `preliminary`: показываем цифру
 * как ориентир, а не как обязательство «оплатить».
 */
const USN_PRELIMINARY: AugustPayment = {
  ...USN_ADVANCE,
  state: 'process',
  preliminary: true,
  payFromLabel: '1 октября',
}

/** Предварительный расчёт НДС за III квартал — по тому же принципу, что и УСН. */
const NDS_PRELIMINARY: AugustPayment = {
  id: 'nds-q3-prelim',
  title: '1-й платёж за III квартал',
  category: 'nds',
  amount: 28500,
  viaEnp: true,
  state: 'process',
  preliminary: true,
  payFromLabel: '1 октября',
  dueLabel: '28 октября',
}

/**
 * «Всё хорошо»: все августовские платежи закрыты в срок — просрочки нет, задачи по
 * сотрудникам закрыты (карточка «Сотрудники» → «Всё уплачено»), а под табом «Выполнено»
 * есть чем наполнить историю периода.
 */
const ALL_PAID: AugustPayment[] = AUGUST_PAYMENTS.map((p) =>
  p.state === 'paid' ? p : { ...p, state: 'paid', paidLabel: 'в срок' },
)

export const HOME_SCENARIOS: Record<ScenarioId, HomeScenario> = {
  onboarding: { id: 'onboarding', label: 'Онбординг', payments: [], usn: null },
  onboarding_vat: { id: 'onboarding_vat', label: 'Онбординг · НДС', payments: [], usn: null },
  // Дефолт прототипа — сценарий «24 августа»: накопились просроченные платежи.
  overdue: {
    id: 'overdue',
    label: 'Есть просрочка',
    payments: AUGUST_PAYMENTS,
    usn: USN_PRELIMINARY,
  },
  // Нет просрочки · предварительный расчёт по УСН и НДС · сотрудники закрыты.
  ok: {
    id: 'ok',
    label: 'Всё хорошо',
    payments: [...ALL_PAID, NDS_PRELIMINARY],
    usn: USN_PRELIMINARY,
  },
  // Кейс 2 — отдельный экран (макет 210-28862): ООО на УСН «Доходы» 6% + НДС, есть
  // сотрудники. Свои данные берёт из `@/data/case2` (кнопка «Создать задачу», блок
  // «Платежи» с УСН/НДС/сотрудниками, блок «Задачи»). При этом сценарии Главная рендерит
  // `Case2View` (см. HomePage), а не доменные карточки; `payments`/`usn` — для полноты типа.
  case2: {
    id: 'case2',
    label: 'Готовы к уплате',
    payments: AUGUST_PAYMENTS,
    usn: usnPayment('mid'),
  },
  case2_pending: { id: 'case2_pending', label: 'Ещё не рассчитаны', payments: [], usn: null },
  case2_overdue: { id: 'case2_overdue', label: 'Просрочены', payments: [], usn: null },
  ip: { id: 'ip', label: 'ИП · октябрь', payments: [], usn: null },
  ip_december: { id: 'ip_december', label: 'ИП · декабрь', payments: [], usn: null },
  // Кейс 3 — тот же клиент, что и Кейс 2, но декабрь: пик налогового календаря (много
  // платежей одновременно). Свои данные берёт из `@/data/case3`; Главная рендерит тот же
  // `Case2View` с другим набором. `payments`/`usn` — для полноты типа.
  case3: {
    id: 'case3',
    label: 'Кейс 3',
    payments: AUGUST_PAYMENTS,
    usn: usnPayment('mid'),
  },
}

export const SCENARIO_ORDER: ScenarioId[] = ['case2_pending', 'case2', 'case2_overdue', 'ip', 'ip_december', 'onboarding', 'onboarding_vat']

/** Дефолтный сценарий — состояние, в которое возвращает кнопка сброса. */
export const DEFAULT_SCENARIO: ScenarioId = 'onboarding'
