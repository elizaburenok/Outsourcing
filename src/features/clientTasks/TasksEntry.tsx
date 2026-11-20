import { publicAsset } from '@/lib/publicAsset'
import { HeaderButton } from '@ds/components/HeaderButton'
import Card from '@/components/ui/Card'
import { useClientTasks } from '@/state/ClientTasksProvider'
import { pluralTasks } from '@/data/accountant'
import './ClientTasks.css'

export function CreateTaskButton({ onClick, mobileLabel }: { onClick: () => void; mobileLabel?: string }) {
  return <div className="client-tasks__create" data-coach="add-task"><HeaderButton visualVariant="Secondary" icon={<img src={publicAsset('/images/figma/tasks/plus-circle.svg')} width="24" height="24" alt="" />} onClick={onClick}><span className={mobileLabel ? 'client-tasks__create-desktop-label' : undefined}>Создать задачу</span>{mobileLabel && <span className="client-tasks__create-mobile-label">{mobileLabel}</span>}</HeaderButton></div>
}

export function TasksEntry({ onClick }: { onClick: () => void }) {
  const { tasks } = useClientTasks()
  const active = tasks.filter((task) => task.status === 'active').length
  return <button type="button" className="client-tasks__entry" onClick={onClick} aria-label={`Задачи, ${pluralTasks(active)} в работе у бухгалтера`}>
    <Card className="client-tasks__entry-card">
      <img src={publicAsset('/images/figma/tasks/tasks-entry.svg')} width="30" height="30" alt="" />
      <span className="client-tasks__entry-text"><strong>Задачи</strong><small>{active ? `${pluralTasks(active)} в работе у бухгалтера` : 'Нет задач в работе'}</small></span>
    </Card>
  </button>
}
