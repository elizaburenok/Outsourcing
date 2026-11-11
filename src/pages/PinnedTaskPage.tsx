import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Cell } from '@ds/components/Cell'
import NavigationBar from '@ds/components/NavigationBar'
import PageShell from '@/components/PageShell/PageShell'
import CreateTaskDrawer from '@/features/case2/CreateTaskDrawer'
import { CreateTaskButton } from '@/features/clientTasks/TasksEntry'
import { useClientTasks } from '@/state/ClientTasksProvider'
import { PERMANENT_TASK_TYPES, clientTaskContext, clientTaskParentId } from '@/data/clientTaskCatalog'
import { ROUTES, taskTo } from '@/routes'

export default function PinnedTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tasks, createTask } = useClientTasks()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const type = PERMANENT_TASK_TYPES.find((item) => item.id === id)

  if (!type) {
    return <PageShell aside={<NavigationBar hasBackButton hasTextBlock title="Задачи" onBackClick={() => navigate(ROUTES.tasks)} />}>
      <p>Задача не найдена</p>
    </PageShell>
  }

  const childTasks = tasks.filter((task) => clientTaskParentId(task) === type.id)

  return <PageShell background="primary" aside={<NavigationBar hasBackButton hasTextBlock hasRootLink rootLinkText="Задачи" title={type.title} onBackClick={() => navigate(ROUTES.tasks)} onRootLinkClick={() => navigate(ROUTES.tasks)} />}>
    <div className="client-tasks-page">
      <CreateTaskButton onClick={() => setDrawerOpen(true)} />
      <div className="client-tasks-page__list">
        {childTasks.length ? childTasks.map((task) => <button type="button" className="client-tasks-page__row" key={task.id} onClick={() => navigate(taskTo(task.id))}>
          <Cell textScale="M" verticalSpacing="none" edgePadding="off" title={task.title} description={clientTaskContext(task)} />
        </button>) : <p className="client-tasks-page__empty">Пока нет задач</p>}
      </div>
    </div>
    <CreateTaskDrawer open={drawerOpen} defaultTitle={type.title} onClose={() => setDrawerOpen(false)} onCreate={(title, description, attachments, kind) => {
      createTask(title, description, { topic: type.topic, subject: type.subject, attachments, kind, parentId: type.id })
    }} />
  </PageShell>
}
