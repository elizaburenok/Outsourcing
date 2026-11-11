import type { ReactNode } from 'react'
import chevronDown from './chevron-down.svg'
import './AccordeonCell.css'

export function AccordeonCell({ title, description, expanded = false }: {
  title: ReactNode
  description?: ReactNode
  expanded?: boolean
}) {
  return <span className="accordeon-cell">
    <span className="accordeon-cell__content">
      <span className="accordeon-cell__title">{title}</span>
      <img className={`accordeon-cell__chevron${expanded ? ' accordeon-cell__chevron--expanded' : ''}`}
        src={chevronDown} alt="" width="18" height="18" />
    </span>
    {description && <span className="accordeon-cell__description">{description}</span>}
  </span>
}
