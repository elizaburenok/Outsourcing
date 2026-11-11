import type { ClientTaskTopic } from './clientTaskCatalog'

export type ClientTaskStatus = 'active' | 'completed'

export type ClientTask = {
  id: string
  title: string
  description: string
  status: ClientTaskStatus
  createdAt: string
  dueAt?: string
  completedAt?: string
  progress: string
  /** Направление из справочника и конкретный предмет обращения. */
  topic: ClientTaskTopic
  subject?: string
  attachments?: string[]
  kind?: 'ordinary' | 'reconciliation'
  /** Закреплённая задача, внутри которой создана эта подзадача. */
  parentId?: string
  assignee?: string
  chiefAccountant?: string
  substituteAccountant1?: string
  substituteAccountant2?: string
  priority?: 'low' | 'medium' | 'high'
  startsAt?: string
  duration?: string
  recurrence?: string
}

/** Демонстрационные обращения клиента к бухгалтеру. */
export const INITIAL_CLIENT_TASKS: ClientTask[] = [
  {
    id: 'usn-october-income', parentId: 'usn-notifications',
    title: 'Проверить доходы для уведомления по УСН',
    description: 'Проверьте поступления за октябрь и подскажите, все ли доходы учтены перед подготовкой уведомления.',
    status: 'active', createdAt: '10 ноября 2026', progress: 'Бухгалтер проверяет поступления',
    topic: 'taxes', subject: 'уведомления УСН',
  },
  {
    id: 'usn-advance-question', parentId: 'usn-notifications',
    title: 'Уточнить сумму аванса по УСН',
    description: 'Проверьте расчёт авансового платежа и объясните, какая сумма учтена в уведомлении.',
    status: 'active', createdAt: '7 ноября 2026', progress: 'Расчёт на проверке',
    topic: 'taxes', subject: 'уведомления УСН',
  },
  {
    id: 'usn-previous-notice', parentId: 'usn-notifications',
    title: 'Проверить отправленное уведомление по УСН',
    description: 'Убедитесь, что уведомление за прошлый период принято и сумма отражена верно.',
    status: 'completed', createdAt: '20 октября 2026', completedAt: '23 октября 2026', progress: 'Уведомление проверено',
    topic: 'taxes', subject: 'уведомления УСН',
  },
  {
    id: 'vat-invoice-check', parentId: 'vat-notifications',
    title: 'Проверить счета-фактуры за октябрь',
    description: 'Сверьте полученные счета-фактуры с учётом перед подготовкой уведомления по НДС.',
    status: 'active', createdAt: '9 ноября 2026', progress: 'Бухгалтер сверяет документы',
    topic: 'taxes', subject: 'уведомления НДС',
  },
  {
    id: 'vat-payment-amount', parentId: 'vat-notifications',
    title: 'Уточнить сумму НДС к уплате',
    description: 'Проверьте итоговую сумму и поясните расхождение с предварительным расчётом.',
    status: 'active', createdAt: '6 ноября 2026', progress: 'Сумма на проверке',
    topic: 'taxes', subject: 'уведомления НДС',
  },
  {
    id: 'vat-previous-notice', parentId: 'vat-notifications',
    title: 'Проверить статус уведомления по НДС',
    description: 'Проверьте, принято ли ранее отправленное уведомление.',
    status: 'completed', createdAt: '22 октября 2026', completedAt: '24 октября 2026', progress: 'Статус подтверждён',
    topic: 'taxes', subject: 'уведомления НДС',
  },
  {
    id: 'personnel-new-hire', parentId: 'personnel',
    title: 'Подготовить документы для нового сотрудника',
    description: 'Подскажите, какие данные нужны для оформления нового сотрудника, и подготовьте документы.',
    status: 'active', createdAt: '10 ноября 2026', progress: 'Бухгалтер готовит документы',
    topic: 'payroll', subject: 'кадровые вопросы',
  },
  {
    id: 'personnel-vacation', parentId: 'personnel',
    title: 'Оформить отпуск сотрудника',
    description: 'Помогите оформить отпуск сотрудника на согласованные даты.',
    status: 'active', createdAt: '8 ноября 2026', progress: 'Документы в подготовке',
    topic: 'payroll', subject: 'кадровые вопросы',
  },
  {
    id: 'personnel-employee-details', parentId: 'personnel',
    title: 'Обновить данные сотрудника',
    description: 'Проверьте полученные от сотрудника новые реквизиты и обновите кадровые данные.',
    status: 'completed', createdAt: '19 октября 2026', completedAt: '21 октября 2026', progress: 'Данные обновлены',
    topic: 'payroll', subject: 'кадровые вопросы',
  },
  { id: 'reconcile-supplier', title: 'Сверить расчёты с поставщиком', description: 'Проверьте расчёты с ООО «Вектор» за октябрь и подготовьте акт сверки. В выписке есть платёж, которого нет в акте поставщика.', status: 'active', createdAt: '6 ноября 2026', dueAt: '13 ноября 2026', progress: 'Бухгалтер проверяет выписку и документы', topic: 'counterparties', subject: 'ООО «Вектор»' },
  { id: 'marketplace-fee', title: 'Проверить комиссию маркетплейса', description: 'Проверьте удержания и комиссию по отчёту Wildberries за октябрь. Хочу понять, все ли суммы попали в учёт.', status: 'active', createdAt: '5 ноября 2026', dueAt: '12 ноября 2026', progress: 'Отчёт маркетплейса на проверке', topic: 'marketplaces', subject: 'Wildberries' },
  { id: 'tax-request', title: 'Разобрать письмо из налоговой', description: 'Получили письмо в личном кабинете ФНС. Посмотрите, нужен ли ответ и какие документы для него подготовить.', status: 'active', createdAt: '3 ноября 2026', dueAt: '11 ноября 2026', progress: 'Бухгалтер изучает письмо', topic: 'taxes', subject: 'письмо ФНС' },
  { id: 'salary-check', title: 'Проверить начисление зарплаты', description: 'Проверьте начисление зарплаты директору за октябрь перед выплатой.', status: 'active', createdAt: '30 октября 2026', progress: 'Бухгалтер сверяет начисления', topic: 'payroll', subject: 'октябрь 2026' },
  { id: 'loan-docs', title: 'Подготовить документы для банка', description: 'Нужны оборотно-сальдовая ведомость и бухгалтерская отчётность для рассмотрения заявки на кредит.', status: 'active', createdAt: '28 октября 2026', progress: 'Документы готовятся', topic: 'banking', subject: 'кредитная заявка' },
  { id: 'counterparty-act', title: 'Проверить акт от подрядчика', description: 'Проверьте акт за сентябрь и подскажите, можно ли его подписывать.', status: 'completed', createdAt: '21 октября 2026', completedAt: '24 октября 2026', progress: 'Акт проверен, замечаний нет', topic: 'counterparties', subject: 'акт подрядчика' },
  { id: 'expense-docs', title: 'Учесть расходы на оборудование', description: 'Передали чек и накладную на покупку оборудования. Проверьте, что документы отражены в учёте.', status: 'completed', createdAt: '15 октября 2026', completedAt: '18 октября 2026', progress: 'Документы отражены в учёте', topic: 'expenses', subject: 'оборудование' },
]
