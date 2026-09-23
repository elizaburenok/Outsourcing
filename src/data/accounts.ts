/**
 * Счета компании для выбора счёта списания при уплате налога из дровера (макет
 * 1178-16236, фрейм «Выберите счёт»). Демо-набор: расчётные/операционный счета и
 * корпоративная карта. Первый в списке — счёт по умолчанию (предвыбран в модалке).
 */

export type AccountKind = 'bank' | 'card'

export interface Account {
  id: string
  /** Крупная строка ячейки — остаток по счёту или название карты. */
  title: string
  /** Подпись под ней — тип счёта и маскированный номер. */
  subtitle: string
  kind: AccountKind
}

export const ACCOUNTS: Account[] = [
  { id: 'acc-9804-current', title: '50 275,37 ₽', subtitle: 'Расчётный, **9804', kind: 'bank' },
  { id: 'acc-9804-reserve', title: '120 900 ₽', subtitle: 'Расчётный, **9804', kind: 'bank' },
  { id: 'acc-5564', title: '375 815 ₽', subtitle: 'Операционный, **5564', kind: 'bank' },
  { id: 'acc-card-8945', title: 'Банковская карта', subtitle: 'Корпоративный, **8945', kind: 'card' },
]
