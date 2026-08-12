import { useState } from 'react'
import { Cell } from '@ds/components/Cell'
import { Tabs } from '@ds/components/Tabs'
import Card from '@/components/ui/Card'
import {
  REPORTS,
  REPORT_GROUPS,
  countWaiting,
  filterReports,
  pluralWaiting,
  type Report,
  type ReportStatus,
  type ReportFilter,
} from '@/data/reports'
import './ReportsView.css'

function StatusDot({ status }: { status: ReportStatus }) {
  return <span className={`rep-dot rep-dot--${status}`} aria-hidden />
}

function ReportRow({ report }: { report: Report }) {
  const isWaiting = report.status === 'waiting'
  const cell = (
    <Cell
      className={`rep-row${isWaiting ? ' rep-row--wait' : ''}${report.status === 'submitted' ? ' rep-row--done' : ''}`}
      textScale="M"
      verticalSpacing="compact"
      title={report.title}
      description={report.note}
      leftAccessory={<StatusDot status={report.status} />}
      rightAccessory={
        isWaiting && report.action ? <span className="rep-action">{report.action} ›</span> : undefined
      }
    />
  )

  // «Ждём ответа» — единственное, что требует клиента: делаем строку кликабельной.
  if (isWaiting) {
    return (
      <button type="button" className="rep-row-btn" onClick={() => {}}>
        {cell}
      </button>
    )
  }
  return cell
}

/**
 * Страница «Отчётность». Фильтр «Все» / «Ждём ответа»: во «Все» отчёты сгруппированы
 * по статусу (ждём ответа → готовим → сдано), «Ждём ответа» оставляет только то, что
 * требует действия клиента. Пустых групп не рисуем.
 */
export default function ReportsView() {
  const [filter, setFilter] = useState<ReportFilter>('all')
  const waiting = countWaiting(REPORTS)
  const shown = filterReports(REPORTS, filter)

  const groups = REPORT_GROUPS.map((g) => ({
    ...g,
    items: shown.filter((r) => r.status === g.status),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="rep">
      <header className="rep__header">
        <p className="rep__lead">{waiting > 0 ? pluralWaiting(waiting) : 'Всё под контролем'}</p>
        <p className="rep__lead-note">Остальное бухгалтер готовит и сдаёт сам</p>
      </header>

      <Tabs
        className="rep__tabs"
        value={filter}
        onChange={(id) => setFilter(id as ReportFilter)}
        items={[
          { id: 'all', label: 'Все' },
          {
            id: 'waiting',
            label: waiting > 0 ? `Ждём ответа · ${waiting}` : 'Ждём ответа',
          },
        ]}
      />

      {groups.length > 0 ? (
        groups.map((g) => (
          <section className="rep__group" key={g.status}>
            <p className="rep__group-label">{g.label}</p>
            <Card className="rep__list">
              {g.items.map((r, i) => (
                <div key={r.id} className="rep__row">
                  {i > 0 && <div className="rep__divider" />}
                  <ReportRow report={r} />
                </div>
              ))}
            </Card>
          </section>
        ))
      ) : (
        <p className="rep__empty">Сейчас ответа не ждём — бухгалтер всё ведёт сам.</p>
      )}
    </div>
  )
}
