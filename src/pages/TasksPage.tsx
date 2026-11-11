import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pin } from 'lucide-react'
import NavigationBar from '@ds/components/NavigationBar'
import { Cell } from '@ds/components/Cell'
import { Tabs } from '@ds/components/Tabs'
import PageShell from '@/components/PageShell/PageShell'
import CreateTaskDrawer from '@/features/case2/CreateTaskDrawer'
import { CreateTaskButton } from '@/features/clientTasks/TasksEntry'
import { useClientTasks } from '@/state/ClientTasksProvider'
import { ROUTES, pinnedTaskTo, taskTo } from '@/routes'
import { clientTaskContext, clientTaskParentId, PERMANENT_TASK_TYPES } from '@/data/clientTaskCatalog'

export default function TasksPage() {
  const navigate = useNavigate()
  const { tasks, createTask } = useClientTasks()
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const shown = tasks.filter((task) => task.status === tab && !clientTaskParentId(task))

  return <PageShell background="primary" aside={<NavigationBar hasBackButton hasTextBlock hasRootLink rootLinkText="Онлайн-бухгалтерия" title="Задачи" onBackClick={() => navigate(ROUTES.home)} onRootLinkClick={() => navigate(ROUTES.home)} />}>
    <div className="client-tasks-page">
      <CreateTaskButton onClick={() => setDrawerOpen(true)} />
      <Tabs className="client-tasks-page__tabs" value={tab} onChange={(id) => setTab(id as 'active' | 'completed')} items={[{ id:'active', label:'Текущие' }, { id:'completed', label:'Завершённые' }]} />
      <div className="client-tasks-page__list" role="tabpanel">
        {tab === 'active' && PERMANENT_TASK_TYPES.map((type) => <button type="button" className="client-tasks-page__row client-tasks-page__row--permanent" key={type.id} onClick={() => navigate(pinnedTaskTo(type.id))}>
          <Cell textScale="M" verticalSpacing="none" edgePadding="off" title={type.title} description={type.summary} rightAccessory={<Pin className="client-tasks-page__pin" size={24} strokeWidth={1.75} aria-hidden="true" />} />
        </button>)}
        {shown.length ? shown.map((task) => <button type="button" className="client-tasks-page__row" key={task.id} onClick={() => navigate(taskTo(task.id))}>
          <Cell textScale="M" verticalSpacing="none" edgePadding="off" title={task.title} description={clientTaskContext(task)} />
        </button>) : <p className="client-tasks-page__empty">{tab === 'active' ? 'Пока нет текущих задач' : 'Пока нет завершённых задач'}</p>}
      </div>
    </div>
    <CreateTaskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={(title, description, attachments, kind) => { createTask(title, description, { topic: 'other', attachments, kind }) }} />
  </PageShell>
}
