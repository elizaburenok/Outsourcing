import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import MomentRow from '@/features/payments/MomentRow'
import { formatMoney } from '@/lib/format'
import { QUARTER, summarizeQuarter, type MonthBlock } from '@/data/quarter'
import './QuarterView.css'

function MonthSection({ month, nextId }: { month: MonthBlock; nextId?: string }) {
  return (
    <section className="qv__month">
      <h3 className="qv__month-name">{month.name}</h3>

      <Card className="qv__moments">
        {month.moments.map((m, i) => (
          <div key={m.id} className="qv__moment-wrap">
            {i > 0 && <div className="qv__divider" />}
            <MomentRow moment={m} isNext={m.id === nextId} />
          </div>
        ))}
      </Card>

      {month.weDo.length > 0 && (
        <div className="qv__wedo">
          <p className="qv__wedo-title">Что делаем мы за вас</p>
          <ul className="qv__wedo-list">
            {month.weDo.map((w) => (
              <li key={w.id} className="qv__wedo-item">
                <span className={`dot ${w.done ? 'dot--done' : 'dot--progress'}`} aria-hidden />
                <span className="qv__wedo-text">
                  {w.title}
                  <span className="qv__wedo-note"> — {w.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default function QuarterView() {
  const q = QUARTER
  const s = summarizeQuarter(q)
  const nextId = q.months.flatMap((m) => m.moments).find((m) => !m.paid)?.id
  const progressPct = Math.round((s.momentsPaid / s.momentsTotal) * 100)

  return (
    <div className="qv">
      {/* Свод по кварталу — спокойный ответ «сколько и когда» */}
      <Card className="qv__summary">
        <div className="qv__summary-head">
          <div>
            <p className="qv__summary-title">{q.title}</p>
            <p className="qv__summary-range">{q.rangeLabel}</p>
          </div>
          {s.overdueCount === 0 ? (
            <Badge tone="success">Просрочек нет</Badge>
          ) : (
            <Badge tone="error">Просрочено: {s.overdueCount}</Badge>
          )}
        </div>

        <div className="qv__summary-amount">
          <p className="qv__summary-label">Осталось уплатить за квартал</p>
          <p className="qv__summary-big">{formatMoney(s.remaining)}</p>
          <p className="qv__summary-context">
            из {formatMoney(s.totalDue)} · оплачено {formatMoney(s.paidAmount)}
          </p>
        </div>

        <div className="qv__progress">
          <div className="qv__progress-track">
            <div className="qv__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="qv__progress-label">
            {s.momentsPaid} из {s.momentsTotal} сроков закрыто
          </p>
        </div>

        {s.next && (
          <div className="qv__next">
            <span className="qv__next-label">Ближайший платёж · {s.next.dateLabel}</span>
            <span className="qv__next-amount">{formatMoney(s.next.amount)}</span>
          </div>
        )}

        <p className="qv__summary-note">
          Суммы будущих месяцев предварительные — уточняем к сроку. Отчётность сдаём мы.
        </p>
      </Card>

      {q.months.map((m) => (
        <MonthSection key={m.key} month={m} nextId={nextId} />
      ))}
    </div>
  )
}
