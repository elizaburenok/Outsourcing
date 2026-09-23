/**
 * Профиль компании — факты для нижних пунктов Главной («Доверенность»,
 * «Подключённые сервисы», «Тариф»), не привязанные к конкретному платёжному
 * сценарию (см. `august.ts`).
 */

/** Количество выпущенных МЧД (директор + бухгалтер-аутсорс). */
export const MCHD_COUNT = 2

/** @deprecated используй MARKETPLACES и INTEGRATIONS */
export const CONNECTED_SERVICES: string[] = []

/** Подключённые маркетплейсы (Ozon, Wildberries и др.) */
export const MARKETPLACES: string[] = []

/** Подключённые банковские и внешние интеграции */
export const INTEGRATIONS: string[] = []

export const TARIFF_NAME = 'Бухгалтерское обслуживание для ООО'

export function connectedServicesText(services: string[]): string {
  return services.length === 0
    ? 'Добавьте маркетплейсы или банки'
    : services.join(', ')
}

export function marketplacesText(list: string[]): string {
  return list.length === 0 ? 'Добавьте маркетплейс' : list.join(', ')
}

export function integrationsText(list: string[]): string {
  return list.length === 0 ? 'Добавьте интеграции' : list.join(', ')
}
