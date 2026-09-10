import type { ReactNode } from 'react'
import './PageShell.css'

/** Раскладка страницы ОБ: левая контекстная колонка + контент + опциональная правая колонка. */
export default function PageShell({
  aside,
  children,
  rightRail,
  background,
}: {
  aside?: ReactNode
  children: ReactNode
  /** Правая колонка (напр. виджет общей суммы в Кейсе 2, макет 892-86541) — 360px,
   *  паддинг 20px по бокам задаёт сама колонка (`.shell__right`). */
  rightRail?: ReactNode
  /** Фон на всю страницу вместо стандартного `--color-page-secondary` (напр. для Истории). */
  background?: 'primary'
}) {
  const shellClass = [
    'shell',
    background === 'primary' && 'shell--primary',
    rightRail && 'shell--wide-right',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      {aside && <aside className="shell__aside">{aside}</aside>}
      <div className="shell__main">
        <div className="shell__main-inner">{children}</div>
      </div>
      {rightRail && <div className="shell__right">{rightRail}</div>}
    </div>
  )
}
