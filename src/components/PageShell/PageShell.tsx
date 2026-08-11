import type { ReactNode } from 'react'
import './PageShell.css'

/** Раскладка страницы ОБ: левая контекстная колонка + контент. */
export default function PageShell({
  aside,
  children,
}: {
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="shell">
      {aside && <aside className="shell__aside">{aside}</aside>}
      <div className="shell__main">
        <div className="shell__main-inner">{children}</div>
      </div>
    </div>
  )
}
