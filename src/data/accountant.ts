/**
 * Задачи бухгалтера — «пульт спокойствия»: клиент видит, что человек делает
 * с его бухгалтерией прямо сейчас. Данные идут через людей, не real-time,
 * поэтому без тайм-стемпов «минуту назад» — только суть, срок и статус.
 */

export type TaskStatus = 'inProgress' | 'waitingYou' | 'done'

export interface AccountantTask {
  id: string
  title: string
  note?: string
  status: TaskStatus
  /** Подпись действия для задач статуса «ждём вас» */
  action?: string
}

export interface Accountant {
  name: string
  role: string
  initials: string
  online: boolean
}

export const ACCOUNTANT: Accountant = {
  name: 'Анна',
  role: 'ваш бухгалтер',
  initials: 'АК',
  online: true,
}

export const ACCOUNTANT_TASKS: AccountantTask[] = [
  {
    id: 'usn-9m',
    title: 'Отчёт УСН за 9 месяцев',
    note: 'Готовим · сдать до 25 октября',
    status: 'inProgress',
  },
  {
    id: 'salary-aug',
    title: 'Сверка зарплаты за август',
    note: 'Проверяем начисления',
    status: 'inProgress',
  },
  {
    id: 'mchd',
    title: 'Подписать МЧД для сдачи отчётности',
    note: 'Без подписи не сдадим отчёт',
    status: 'waitingYou',
    action: 'Подписать',
  },
  {
    id: 'ndfl-jul',
    title: 'Платёжка НДФЛ отправлена',
    note: '8 августа',
    status: 'done',
  },
]

export function summarizeTasks(tasks: AccountantTask[]) {
  const inProgress = tasks.filter((t) => t.status === 'inProgress').length
  const waiting = tasks.filter((t) => t.status === 'waitingYou').length
  return { inProgress, waiting, active: inProgress + waiting }
}

/** «1 задача / 2 задачи / 5 задач» */
export function pluralTasks(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'задач'
  if (mod10 === 1 && mod100 !== 11) word = 'задача'
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'задачи'
  return `${n} ${word}`
}
