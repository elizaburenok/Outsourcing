import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { INITIAL_CLIENT_TASKS, type ClientTask } from '@/data/clientTasks'
import type { ClientTaskTopic } from '@/data/clientTaskCatalog'

type TaskMetadata = { topic: ClientTaskTopic; subject?: string; attachments?: string[]; kind?: 'ordinary' | 'reconciliation'; parentId?: string }

type ClientTasksContextValue = {
  tasks: ClientTask[]
  createTask: (title: string, description: string, metadata?: TaskMetadata) => ClientTask
}

const ClientTasksContext = createContext<ClientTasksContextValue | null>(null)
const STORAGE_KEY = 'ob-client-tasks-v1'

function initialTasks(): ClientTask[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) return [...parsed, ...INITIAL_CLIENT_TASKS] as ClientTask[]
    }
  } catch { /* Прототип работает и без доступного localStorage. */ }
  return INITIAL_CLIENT_TASKS
}

export function ClientTasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ClientTask[]>(initialTasks)

  function createTask(title: string, description: string, metadata?: TaskMetadata): ClientTask {
    const task: ClientTask = {
      id: `client-${crypto.randomUUID()}`,
      title: title.trim(),
      description: description.trim(),
      status: 'active',
      createdAt: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' }).format(new Date()),
      progress: 'Задача отправлена бухгалтеру',
      topic: metadata?.topic ?? 'other',
      subject: metadata?.subject,
      attachments: metadata?.attachments,
      kind: metadata?.kind,
      parentId: metadata?.parentId,
    }
    setTasks((current) => {
      const created = current.filter((item) => item.id.startsWith('client-'))
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([task, ...created])) } catch { /* Храним до перезагрузки. */ }
      return [task, ...current]
    })
    return task
  }

  const value = useMemo(() => ({ tasks, createTask }), [tasks])
  return <ClientTasksContext.Provider value={value}>{children}</ClientTasksContext.Provider>
}

export function useClientTasks() {
  const context = useContext(ClientTasksContext)
  if (!context) throw new Error('useClientTasks должен вызываться внутри ClientTasksProvider')
  return context
}
