import type { ReactNode } from 'react'
import './PageShell.css'

/** Раскладка страницы ОБ: левая контекстная колонка + контент. */
export default function PageShell({
  aside,
  children,
  background,
}: {
  aside?: ReactNode
  children: ReactNode
  /** Фон на всю страницу вместо стандартного `--color-page-secondary` (напр. для Истории). */
  background?: 'primary'
}) {
  return (
    <div className={background === 'primary' ? 'shell shell--primary' : 'shell'}>
      {aside && <aside className="shell__aside">{aside}</aside>}
      <div className="shell__main">
        <div className="shell__main-inner">{children}</div>
      </div>
    </div>
  )
}
