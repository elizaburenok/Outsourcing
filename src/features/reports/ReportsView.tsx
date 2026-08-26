import { useEffect, useState } from 'react'
import { Cell } from '@ds/components/Cell'
import { Tabs } from '@ds/components/Tabs'
import declarationLogo from '@ds/src/logo/Declaration.png'
import taxDocumentLogo from '@ds/src/logo/Tax Document.svg'
import taxReportsLogo from '@ds/src/logo/Tax Reports.svg'
import documentLogo from '@ds/src/logo/Document.png'
import mailLogo from '@ds/src/logo/Mail.svg'
import reportLogo from '@ds/src/logo/Report.svg'
import {
  REPORTS,
  REPORTS_OK,
  countWaiting,
  filterReports,
  type Report,
  type ReportStatus,
  type ReportLogoKind,
} from '@/data/reports'
import { useScenario } from '@/state/ScenarioProvider'
import './ReportsView.css'

const REPORT_LOGO: Record<ReportLogoKind, string> = {
  declaration: declarationLogo,
  'tax-document': taxDocumentLogo,
  'tax-reports': taxReportsLogo,
  document: documentLogo,
  mail: mailLogo,
  report: reportLogo,
}

function ReportLogoIcon({ kind }: { kind: ReportLogoKind }) {
  return <img className="rep-logo" src={REPORT_LOGO[kind]} alt="" />
}

const EMPTY_TEXT: Record<ReportStatus, string> = {
  waiting: 'Сейчас ответа не ждём — бухгалтер всё ведёт сам.',
  preparing: 'Сейчас ничего не готовим.',
  submitted: 'Пока ничего не сдано.',
}

function ReportRow({ report }: { report: Report }) {
  const isWaiting = report.status === 'waiting'
  const cell = (
    <Cell
      textScale="M"
      verticalSpacing="none"
      edgePadding="off"
      title={report.title}
      description={report.note}
      leftAccessory={<ReportLogoIcon kind={report.logo} />}
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
 * Страница «Отчётность». Три таба по статусу — «Ждём ответа» (единственное, что
 * требует действия клиента), «В работе» (бухгалтер готовит) и «Выполнено». У каждой
 * строки — лого предмета отчёта (декларация/документ/уведомление) вместо статус-точки:
 * статус теперь читается по табу, а не по цвету индикатора.
 */
export default function ReportsView() {
  const { scenario } = useScenario()
  const reports = scenario === 'ok' ? REPORTS_OK : REPORTS
  const waiting = countWaiting(reports)
  const [filter, setFilter] = useState<ReportStatus>(waiting > 0 ? 'waiting' : 'preparing')
  const shown = filterReports(reports, filter)

  // Нет задач на клиента — таб «Ждём ответа» скрываем совсем, фокус сразу на «В работе».
  useEffect(() => {
    if (waiting === 0 && filter === 'waiting') setFilter('preparing')
  }, [waiting, filter])

  return (
    <div className="rep">
      <Tabs
        className="rep__tabs"
        value={filter}
        onChange={(id) => setFilter(id as ReportStatus)}
        items={[
          ...(waiting > 0
            ? [
                {
                  id: 'waiting',
                  label: (
                    <span className="rep-tab-label">
                      Ждём ответа
                      <span className="rep-tab-counter">{waiting}</span>
                    </span>
                  ),
                },
              ]
            : []),
          { id: 'preparing', label: 'В работе' },
          { id: 'submitted', label: 'Выполнено' },
        ]}
      />

      {shown.length > 0 ? (
        shown.map((r) => <ReportRow key={r.id} report={r} />)
      ) : (
        <p className="rep__empty">{EMPTY_TEXT[filter]}</p>
      )}
    </div>
  )
}
