/**
 * Профиль компании — факты для нижних пунктов Главной («Доверенность»,
 * «Подключённые сервисы», «Тариф»), не привязанные к конкретному платёжному
 * сценарию (см. `august.ts`).
 */

/** Количество выпущенных МЧД (директор + бухгалтер-аутсорс). */
export const MCHD_COUNT = 2

/** Подключённые банки/маркетплейсы — пусто, пока ничего не подключено. */
export const CONNECTED_SERVICES: string[] = []

export const TARIFF_NAME = 'Бухгалтерское обслуживание для ООО'

export function connectedServicesText(services: string[]): string {
  return services.length === 0
    ? 'Добавьте маркетплейсы или банки'
    : services.join(', ')
}
