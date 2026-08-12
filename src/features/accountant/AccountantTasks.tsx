import { useState } from 'react'
import Drawer, { DrawerHeader, DrawerFooter } from '@ds/components/Drawer'
import { Cell } from '@ds/components/Cell'
import { useOnboarding } from '@/state/OnboardingProvider'
import {
  ACCOUNTANT,
  ACCOUNTANT_TASKS,
  summarizeTasks,
  pluralTasks,
  type AccountantTask,
  type TaskStatus,
} from '@/data/accountant'
import './AccountantTasks.css'

const GROUPS: { status: TaskStatus; label: string }[] = [
  { status: 'inProgress', label: 'В работе' },
  { status: 'waitingYou', label: 'Ждём вас' },
  { status: 'done', label: 'Готово недавно' },
]

function StatusDot({ status }: { status: TaskStatus }) {
  return <span className={`acc-dot acc-dot--${status}`} aria-hidden />
}

function TaskRow({ task }: { task: AccountantTask }) {
  const isWaiting = task.status === 'waitingYou'
  const cell = (
    <Cell
      className={`acc-row${isWaiting ? ' acc-row--wait' : ''}${task.status === 'done' ? ' acc-row--done' : ''}`}
      textScale="M"
      verticalSpacing="compact"
      title={task.title}
      description={task.note}
      leftAccessory={<StatusDot status={task.status} />}
      rightAccessory={isWaiting && task.action ? <span className="acc-action">{task.action} ›</span> : undefined}
    />
  )

  // «Ждём вас» — единственное, что требует клиента: делаем строку кликабельной.
  if (isWaiting) {
    return (
      <button type="button" className="acc-row-btn" onClick={() => {}}>
        {cell}
      </button>
    )
  }
  return cell
}

/** Вход-плитка «Бухгалтер» в сетке разделов + шторка «Задачи бухгалтера». */
export default function AccountantTasks() {
  const { tasksDrawerForced } = useOnboarding()
  const [localOpen, setLocalOpen] = useState(false)
  // Коуч на последнем шаге сам открывает шторку, чтобы показать «Добавить задачу».
  const open = localOpen || tasksDrawerForced
  const s = summarizeTasks(ACCOUNTANT_TASKS)

  const noteParts: string[] = []
  if (s.inProgress) noteParts.push(`${s.inProgress} в работе`)
  if (s.waiting) noteParts.push(`${s.waiting} ждёт вас`)

  return (
    <>
      <button className="acc-tile" type="button" data-coach="tasks" onClick={() => setLocalOpen(true)}>
        <span className="acc-tile__avatar" aria-hidden>
          {ACCOUNTANT.initials}
          {ACCOUNTANT.online && <span className="acc-tile__online" />}
        </span>
        <span className="acc-tile__text">
          <span className="acc-tile__title">Бухгалтер</span>
          <span className="acc-tile__note">{noteParts.join(' · ') || pluralTasks(s.active)}</span>
        </span>
      </button>

      <Drawer open={open} onClose={() => setLocalOpen(false)} aria-label="Задачи бухгалтера">
        <DrawerHeader onClose={() => setLocalOpen(false)}>Задачи бухгалтера</DrawerHeader>

        <div className="acc-body">
          {GROUPS.map(({ status, label }) => {
            const items = ACCOUNTANT_TASKS.filter((t) => t.status === status)
            if (items.length === 0) return null
            return (
              <section className="acc-group" key={status}>
                <p className="acc-group__label">{label}</p>
                <div className="acc-group__list">
                  {items.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* Якорь коуча «создать задачу» — обёртка, т.к. DrawerFooter не пробрасывает data-* */}
        <div data-coach="add-task">
          <DrawerFooter
            type="1 Button"
            primaryAction={{ label: 'Добавить задачу', onClick: () => {} }}
          />
        </div>
      </Drawer>
    </>
  )
}
