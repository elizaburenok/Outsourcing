/**
 * Сценарий «Уплата налогов, 10 октября» — тот же единый список платежей, что и в
 * августе, но снятый уже ПОСЛЕ закрытия III квартала (30 сентября). Ключевое отличие:
 * аванс по УСН за 9 месяцев теперь посчитан (квартал закрыт) и стоит в списке твёрдой
 * суммой со сроком до 28 октября — тот самый платёж, который в середине квартала был
 * «в процессе» и не показывался числом. Остальное — обычный октябрьский ритм по
 * сентябрьским основаниям. Суммы номинальные, согласованы с august.ts / quarter.ts.
 *
 * «Сегодня» прототипа — 10 октября: зарплата и травматизм за август (срок 15 сентября)
 * просрочены; ближайшие сроки — 15 октября (зарплата и травматизм за сентябрь) и
 * 28 октября (взносы, НДФЛ). Налог по УСН за III квартал ещё считается — закреплён второй
 * строкой под блоком «просрочено».
 */

import { USN_ADVANCE, type AugustPayment } from './august'

export const OCTOBER_PAYMENTS: AugustPayment[] = [
  // — уже оплачено (сентябрьский ритм закрыт) —
  {
    id: 'o-ndfl-sep-2',
    title: 'НДФЛ с зарплаты за 23–30 сентября',
    category: 'ndfl',
    amount: 3900,
    viaEnp: true,
    state: 'paid',
    paidLabel: '5 октября',
  },
  {
    id: 'o-vznos-aug',
    title: 'Страховые взносы за август',
    category: 'vznos',
    amount: 19500,
    viaEnp: true,
    state: 'paid',
    paidLabel: '28 сентября',
  },
  {
    id: 'o-ndfl-sep-1',
    title: 'НДФЛ с зарплаты за 1–22 сентября',
    category: 'ndfl',
    amount: 8400,
    viaEnp: true,
    state: 'paid',
    paidLabel: '28 сентября',
  },
  {
    id: 'o-travma-aug',
    title: 'Взносы на травматизм за август',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'overdue',
    dueLabel: '15 сентября',
  },
  {
    id: 'o-salary-aug',
    title: 'Зарплата директору за август',
    category: 'salary',
    amount: 53783,
    viaEnp: true,
    state: 'overdue',
    dueLabel: '15 сентября',
  },

  // — к уплате —
  {
    id: 'o-travma-sep',
    title: 'Взносы на травматизм за сентябрь',
    category: 'travma',
    amount: 200,
    viaEnp: false,
    state: 'due',
    dueLabel: '15 октября',
  },
  {
    id: 'o-salary-sep',
    title: 'Зарплата директору за сентябрь',
    category: 'salary',
    amount: 53783,
    viaEnp: true,
    state: 'due',
    dueLabel: '15 октября',
  },
  {
    id: 'o-vznos-sep',
    title: 'Страховые взносы за сентябрь',
    category: 'vznos',
    amount: 19500,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 октября',
  },
  {
    id: 'o-ndfl-oct-1',
    title: 'НДФЛ с зарплаты за 1–22 октября',
    category: 'ndfl',
    amount: 9100,
    viaEnp: true,
    state: 'due',
    dueLabel: '28 октября',
  },
]

/**
 * Налог по УСН за III квартал на 10 октября. Квартал закрыт (30 сентября), но точная
 * сумма ещё считается бухгалтером (данные приходят через людей, не real-time) —
 * состояние `process`, числа нет. Строка закрепляется вверху списка (сразу под
 * просроченными), чтобы клиент заранее видел: крупный квартальный налог впереди,
 * за какой период он и когда будет посчитан. Срок расчёта — до 18 октября.
 */
export function octoberUsn(): AugustPayment {
  return {
    id: USN_ADVANCE.id,
    title: 'Налог по УСН за III квартал',
    category: 'usn',
    amount: USN_ADVANCE.amount,
    viaEnp: true,
    state: 'process',
    dueLabel: '18 октября',
  }
}
