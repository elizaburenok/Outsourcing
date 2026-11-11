import { useNavigate, useParams } from 'react-router-dom'
import { FileArchive, FileImage, FileText, FileSpreadsheet } from 'lucide-react'
import { Cell } from '@ds/components/Cell'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import { useClientTasks } from '@/state/ClientTasksProvider'
import { ROUTES, pinnedTaskTo } from '@/routes'
import { CLIENT_TASK_TOPICS, clientTaskContext, clientTaskParentId } from '@/data/clientTaskCatalog'
import type { ClientTask } from '@/data/clientTasks'

function ReadOnlyCell({ label, value, empty = false }: { label: string; value: string; empty?: boolean }) {
  return <Cell
    className={`client-task-detail__field${empty ? ' client-task-detail__field--empty' : ''}`}
    textScale="S"
    verticalSpacing="none"
    edgePadding="off"
    title={label}
    description={value}
  />
}

function taskType(task: ClientTask) {
  if (task.kind === 'ordinary') return 'Задача бухгалтеру'
  if (task.kind === 'reconciliation') return 'Обработка документов для сверки'
  return CLIENT_TASK_TOPICS[task.topic]?.label ?? 'Общий вопрос'
}

function GroupHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <Cell className="client-task-detail__group-heading" textScale="2XL" verticalSpacing="none" edgePadding="off" title={title} description={subtitle} />
}

function attachmentIcon(name: string) {
  const extension = name.split('.').pop()?.toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(extension ?? '')) return <FileImage size={24} aria-hidden />
  if (['xls', 'xlsx', 'csv'].includes(extension ?? '')) return <FileSpreadsheet size={24} aria-hidden />
  if (['zip', 'rar', '7z'].includes(extension ?? '')) return <FileArchive size={24} aria-hidden />
  if (extension === 'pdf') return <img src="/images/figma/upload/file-pdf.svg" alt="" />
  return <FileText size={24} aria-hidden />
}

export default function TaskDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { tasks } = useClientTasks()
  const task = tasks.find((item) => item.id === id)
  const parentId = task && clientTaskParentId(task)
  const backTo = parentId ? pinnedTaskTo(parentId) : ROUTES.tasks

  if (!task) return <PageShell background="primary" aside={<NavigationBar hasBackButton hasTextBlock title="Задачи" onBackClick={() => navigate(ROUTES.tasks)} />}><p>Задача не найдена</p></PageShell>

  return <PageShell background="primary" aside={<NavigationBar hasBackButton hasTextBlock hasRootLink rootLinkText="Задачи" title="Задача" onBackClick={() => navigate(backTo)} onRootLinkClick={() => navigate(ROUTES.tasks)} />}>
    <div className="client-task-detail">
      <header className="client-task-detail__header">
        <h2>{task.title}</h2>
        <p className="client-task-detail__status">{task.status === 'completed' ? 'Завершена' : 'В работе'}</p>
      </header>

      <section className="client-task-detail__section" aria-label="Данные задачи">
        <GroupHeader title="О задаче" />
        <ReadOnlyCell label="Название" value={task.title} />
        <ReadOnlyCell label="Тип задачи" value={taskType(task)} />
        {task.subject && <ReadOnlyCell label="Направление и предмет" value={clientTaskContext(task)} />}
        <ReadOnlyCell label="Описание задачи" value={task.description || 'Не добавлено'} empty={!task.description} />
        <ReadOnlyCell label="Поставлена" value={task.createdAt} />
        {task.completedAt && <ReadOnlyCell label="Завершена" value={task.completedAt} />}
      </section>

      <section className="client-task-detail__section" aria-label="Ответственные">
        <GroupHeader title="Ответственные" subtitle="Участники задачи" />
        <ReadOnlyCell label="Исполнитель" value={task.assignee || 'Бухгалтер Точки'} />
        <ReadOnlyCell label="Главный бухгалтер" value={task.chiefAccountant || 'Не назначен'} empty={!task.chiefAccountant} />
        <ReadOnlyCell label="Замещающий бухгалтер 1" value={task.substituteAccountant1 || 'Не назначен'} empty={!task.substituteAccountant1} />
        <ReadOnlyCell label="Замещающий бухгалтер 2" value={task.substituteAccountant2 || 'Не назначен'} empty={!task.substituteAccountant2} />
      </section>

      {task.attachments?.length ? <section className="client-task-detail__documents" aria-label="Загруженные файлы">
        <h3 className="client-task-detail__documents-title">Загруженные файлы</h3>
        <ul className="client-task-detail__documents-list">
          {task.attachments.map((name, index) => <li key={`${name}-${index}`} className="client-task-detail__attachment">
            <span className="client-task-detail__attachment-avatar">{attachmentIcon(name)}</span>
            <span className="client-task-detail__attachment-name">{name}</span>
          </li>)}
        </ul>
      </section> : null}
    </div>
  </PageShell>
}
