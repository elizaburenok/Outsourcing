import type { ReactNode } from 'react'
import './TimelineEvent.css'

export function TimelineEvent({ amount, status, title, description, positive = false }: {
  amount: ReactNode
  status: ReactNode
  title: ReactNode
  description: ReactNode
  positive?: boolean
}) {
  return <div className="timeline-event">
    <div className="timeline-event__amount-column">
      <p className={`timeline-event__amount${positive ? ' timeline-event__amount--positive' : ''}`}>{amount}</p>
      {status && <p className="timeline-event__description">{status}</p>}
    </div>
    <div className="timeline-event__content">
      <p className="timeline-event__title">{title}</p>
      <p className="timeline-event__description">{description}</p>
    </div>
  </div>
}
