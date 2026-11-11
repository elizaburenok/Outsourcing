/** Справочник направлений обращений клиента к бухгалтеру. */
export const CLIENT_TASK_TOPICS = {
  documents: { label: 'Документы' },
  counterparties: { label: 'Контрагенты' },
  marketplaces: { label: 'Маркетплейсы' },
  taxes: { label: 'Налоговая' },
  payroll: { label: 'Сотрудники' },
  banking: { label: 'Для банка' },
  expenses: { label: 'Расходы' },
  other: { label: 'Общий вопрос' },
} as const

export type ClientTaskTopic = keyof typeof CLIENT_TASK_TOPICS

/** Постоянные типы задач: порядок в массиве совпадает с порядком в разделе. */
export const PERMANENT_TASK_TYPES: readonly {
  id: string
  title: string
  summary: string
  topic: ClientTaskTopic
  subject: string
}[] = [
  { id: 'usn-notifications', title: 'Уведомления УСН', summary: 'Вопросы по уведомлениям на УСН', topic: 'taxes', subject: 'уведомления УСН' },
  { id: 'vat-notifications', title: 'Уведомления НДС', summary: 'Вопросы по уведомлениям на НДС', topic: 'taxes', subject: 'уведомления НДС' },
  { id: 'personnel', title: 'Кадровые', summary: 'Сотрудники и кадровые документы', topic: 'payroll', subject: 'кадровые вопросы' },
]

/** Одна подпись для строки списка и блока информации на странице задачи. */
export function clientTaskContext(task: { topic?: ClientTaskTopic; subject?: string; createdAt: string }): string {
  const topic = task.topic && task.topic in CLIENT_TASK_TOPICS ? task.topic : 'other'
  if (topic === 'other') return `Создана ${task.createdAt}`
  return task.subject ? `${CLIENT_TASK_TOPICS[topic].label}: ${task.subject}` : CLIENT_TASK_TOPICS[topic].label
}

/** Поддерживаем также задачи, созданные из закреплённых строк до появления parentId. */
export function clientTaskParentId(task: { parentId?: string; topic?: ClientTaskTopic; subject?: string }): string | undefined {
  return task.parentId ?? PERMANENT_TASK_TYPES.find((type) => type.topic === task.topic && type.subject === task.subject)?.id
}
