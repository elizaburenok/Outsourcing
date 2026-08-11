/** Денежный формат ₽ с неразрывными пробелами между разрядами. */
export function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽'
}
